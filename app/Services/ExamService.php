<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\Question;
use App\Models\QuestionGroup;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ExamService
{
    private static ?ExamService $instance = null;
    private ?bool $hasPermission = null;
    private ?int $remainingQuestionsCount = null;
    private ?User $user = null;

    private function __construct()
    {

    }

    public static function instance(): ExamService
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function setUser(User $user): void
    {
        $this->user = $user;
    }

    public function getUser(): User
    {
        if ($this->user === null) {
            /** @var User $user */
            $user = auth('user')->user();

            return $user;
        }

        return $this->user;
    }

    public function getUserExams(): LengthAwarePaginator
    {
        $user = $this->getUser();

        return Exam::query()
            ->with([
                'questions',
                'questionGroup',
                'questionGroup.translatable',
            ])
            ->withCount([
                'questions',
                'questions as correct_questions_count' => static function ($query) {
                    $query->where('is_correct', true);
                },
                'questions as incorrect_questions_count' => static function ($query) {
                    $query->where('is_correct', false);
                },
            ])
            ->withSum('questions', 'point')
            ->where('user_id', $user->id)
            ->orderByDesc('id')
            ->paginate(10);
    }

    public function getUserLastActiveExamByQuestionGroup(QuestionGroup $questionGroup)
    {
        $user = $this->getUser();

        return $questionGroup->exams()
            ->where('user_id', $user->id)
            ->whereNull('start_date')
            ->orderByDesc('id')
            ->firstOrFail();
    }

    public function startExam(Exam $exam): void
    {
        $user = $this->getUser();

        if ($exam->user_id !== $user->id) {
            throw new AccessDeniedHttpException(
                LangService::instance()
                    ->setDefault('Access denied!')
                    ->getLang('access_denied')
            );
        }

        if ($exam->isStarted()) {
            throw new BadRequestHttpException(
                LangService::instance()
                    ->setDefault('Exam already started!')
                    ->getLang('exam_already_started')
            );
        }

        $exam->load([
            'questionGroup',
            'questionGroup.questions' => function ($query) {
                $query->active();
            },
        ]);

        $questions = $exam->questionGroup->questions;

        if ($questions->count() === 0) {
            throw new NotFoundHttpException(
                LangService::instance()
                    ->setDefault('No questions found!')
                    ->getLang('no_questions_found')
            );
        }

        DB::transaction(static function () use ($exam, $user, $questions) {
            $exam->start_date = Carbon::now();
            $exam->is_started = 'started_' . $exam->id;
            $exam->save();

            $data = [];
            $now = CarbonImmutable::now();

            foreach ($questions as $question) {
                $data[] = [
                    'question_id' => $question->id,
                    'exam_id' => $exam->id,
                    'created_at' => $now,
                    'creatable_id' => $user->id,
                    'creatable_type' => $user->getMorphClass(),
                ];
            }

            ExamQuestion::query()->insert($data);
        });
    }

    public function finishExam(Exam $exam): void
    {
        $user = $this->getUser();

        $this->checkExamPermission($exam, $user);

        DB::transaction(static function () use ($exam) {
            $exam->end_date = Carbon::now();
            $exam->save();
        });
    }

    public function hasNextQuestion(Exam $exam): bool
    {
        return $this->getRemainingQuestionsCount($exam) > 0;
    }

    public function getRemainingQuestionsCount(Exam $exam): int
    {
        if ($this->remainingQuestionsCount !== null) {
            return $this->remainingQuestionsCount;
        }

        $user = $this->getUser();

        $this->checkExamPermission($exam, $user);

        $this->remainingQuestionsCount = ExamQuestion::query()
            ->where('exam_id', $exam->id)
            ->whereNull('sent_date')
            ->count();

        return $this->remainingQuestionsCount;
    }

    public function getAllQuestionsCount(Exam $exam): int
    {
        if ($exam->questions_count !== null) {
            return $exam->questions_count;
        }

        $exam->loadCount('questions');

        return $exam->questions_count ?? 0;
    }

    public function calculateExamPercent(Exam $exam): float
    {
        $totalQuestions = $exam->questions()->count();
        $answeredQuestions = $exam->questions()
            ->whereNotNull('answered_at')
            ->count();

        return $totalQuestions === 0 ? 0 : round(($answeredQuestions / $totalQuestions) * 100);
    }

    public function getNextQuestion(Exam $exam, bool $hasNextQuestion = true): ?Question
    {
        if (!$hasNextQuestion) {
            $this->finishExam($exam);

            return null;
        }

        $user = $this->getUser();

        $this->checkExamPermission($exam, $user);

        $exam->load([
            'questions' => function ($query) {
                $query->whereNull('sent_date');
                $query->orderBy('id');
                $query->limit(1);
            },
            'questions.question',
            'questions.question.translatable',
            'questions.question.answers' => function ($query) {
                $query->inRandomOrder();
            },
            'questions.question.answers.translatable',
        ]);

        $questions = $exam->questions;

        if ($questions->count() === 0) {
            throw new NotFoundHttpException(
                LangService::instance()
                    ->setDefault('No active questions found!')
                    ->getLang('no_active_questions_found')
            );
        }

        /** @var ExamQuestion $nextQuestion */
        $nextQuestion = $questions->first();

        DB::transaction(static function () use ($nextQuestion) {
            $nextQuestion->sent_date = CarbonImmutable::now();
            $nextQuestion->end_date = $nextQuestion->sent_date->addSeconds(Exam::QUESTION_TIME_SECONDS + 1);

            $nextQuestion->save();
        });

        return $nextQuestion->question;
    }

    public function chooseAnswer(Exam $exam, string $questionUuid, string $answerUuid): bool
    {
        $user = $this->getUser();

        $this->checkExamPermission($exam, $user);

        /** @var ExamQuestion $question */
        $question = $exam->questions()
            ->whereHas('question', static function ($query) use ($questionUuid) {
                $query->where('uuid', $questionUuid);
            })
            ->whereNotNull('sent_date')
            ->whereNull('answered_at')
            ->where('end_date', '>', Carbon::now())
            ->firstOrFail();

        $answer = $question->question->answers()
            ->where('uuid', $answerUuid)
            ->firstOrFail();

        $isCorrect = $answer->is_correct;

        DB::transaction(static function () use ($question, $answer, $isCorrect) {
            $question->answer_id = $answer->id;
            $question->answered_at = Carbon::now();
            $question->is_correct = $isCorrect;
            $question->point = $isCorrect ? Exam::CORRECT_ANSWER_POINT : 0;

            $question->save();
        });

        return $isCorrect;
    }

    public function getExamResult(Exam $exam, bool $hasNextQuestion): ?array
    {
        $user = $this->getUser();

        if ($exam->user_id !== $user->id) {
            throw new AccessDeniedHttpException(
                LangService::instance()
                    ->setDefault('Access denied!')
                    ->getLang('access_denied')
            );
        }

        if ($hasNextQuestion) {
            return null;
        }

        if (!$exam->relationLoaded('questions')) {
            $exam->load([
                'questions',
            ]);
        }

        $exam
            ->loadCount([
                'questions as correct_questions_count' => static function ($query) {
                    $query->where('is_correct', true);
                },
                'questions as incorrect_questions_count' => static function ($query) {
                    $query->where('is_correct', false);
                },
            ])
            ->loadSum('questions', 'point');

        $correctQuestionsCount = $exam->correct_questions_count ?? 0;
        $incorrectQuestionsCount = $exam->incorrect_questions_count ?? 0;
        $totalQuestionsCount = $correctQuestionsCount + $incorrectQuestionsCount;

        $successRate = $totalQuestionsCount === 0 ? 0 : round(($correctQuestionsCount / $totalQuestionsCount) * 100);

        $point = $exam->questions_sum_point ?? 0;

        $firstSentDate = $exam->questions?->min('sent_date');
        $lastAnsweredDate = $exam->questions?->max('answered_at');

        $totalTimeSpent = 0;
        if ($firstSentDate && $lastAnsweredDate) {
            $totalTimeSpent = $firstSentDate->diffInSeconds($lastAnsweredDate);
        }
        $minutes = floor($totalTimeSpent / 60);
        $seconds = $totalTimeSpent % 60;
        $spentTimeFormatted = sprintf('%02d:%02d', $minutes, $seconds);

        return [
            'correct_questions_count' => $correctQuestionsCount,
            'incorrect_questions_count' => $incorrectQuestionsCount,
            'total_questions_count' => $totalQuestionsCount,
            'success_rate' => $successRate,
            'point' => (int) $point,
            'total_time_spent_formatted' => $spentTimeFormatted,
            'total_time_spent_seconds' => (int) $totalTimeSpent,
        ];
    }

    private function checkExamPermission(Exam $exam, User $user): void
    {
        if ($this->hasPermission === true) {
            return;
        }

        if ($exam->user_id !== $user->id) {
            throw new AccessDeniedHttpException(
                LangService::instance()
                    ->setDefault('Access denied!')
                    ->getLang('access_denied')
            );
        }

        if (!$exam->isStarted()) {
            throw new BadRequestHttpException(
                LangService::instance()
                    ->setDefault('Exam not started!')
                    ->getLang('exam_not_started')
            );
        }

        if ($exam->isEnded()) {
            throw new BadRequestHttpException(
                LangService::instance()
                    ->setDefault('Exam finished!')
                    ->getLang('exam_finished')
            );
        }

        $this->hasPermission = true;
    }
}
