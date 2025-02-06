<?php

namespace App\Repositories;

use App\Models\Question;
use App\Models\QuestionGroup;
use App\Services\LangService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class QuestionRepository
{
    public function load(QuestionGroup $questionGroup, array $validated): LengthAwarePaginator
    {
        return $questionGroup->questions()
            ->with([
                'translatable',
                'creatable',
                'difficultyLevel',
                'difficultyLevel.translatable',
            ])
            ->withCount([
                'answers',
            ])
            ->when($validated['search'] ?? null, function (Builder $builder) use ($validated) {
                $builder->where(function (Builder $builder) use ($validated) {
                    $builder->whereHas('translatable', function (Builder $query) use ($validated) {
                        $query->where('column', 'title');
                        $query->where('text', 'like', '%' . $validated['search'] . '%');
                    });
                    $builder->orWhereHas('answers.translatable', function (Builder $query) use ($validated) {
                        $query->where('column', 'title');
                        $query->where('text', 'like', '%' . $validated['search'] . '%');
                    });
                });
            })
            ->orderByDesc('id')
            ->paginate($validated['limit'] ?? 10);
    }

    public function list(QuestionGroup $questionGroup): Collection
    {
        return $questionGroup->questions()
            ->active()
            ->with([
                'translatable',
            ])
            ->orderBy('id')
            ->get();
    }

    public function loadRelations(Question $question): void
    {
        $question
            ->load([
                'translatable',
                'creatable',
                'difficultyLevel',
                'difficultyLevel.translatable',
            ])
            ->loadCount([
                'answers',
            ]);
    }

    public function show(Question $question): void
    {
        $question
            ->load([
                'translatable',
                'creatable',
                'questionGroup',
                'questionGroup.translatable',
                'difficultyLevel',
                'difficultyLevel.translatable',
                'answers',
                'answers.translatable',
            ]);
    }

    public function store(QuestionGroup $questionGroup, array $validated): Question
    {
        if (!$questionGroup->isActive()) {
            throw new BadRequestHttpException(
                LangService::instance()
                    ->setDefault('Question group is not active!')
                    ->getLang('question_group_is_not_active')
            );
        }

        return DB::transaction(static function () use ($questionGroup, $validated) {
            $translations = $validated['translations'];
            unset($validated['translations']);

            $answersData = $validated['answers'];
            unset($validated['answers']);

            $validated['uuid'] = Str::uuid();

            /** @var Question $question */
            $question = $questionGroup->questions()->create($validated);

            $default = $translations[0];
            foreach ($translations as $translation) {
                $question->setLang('title', $translation['title'] ?? $default['title'], $translation['language_id']);
            }

            $question->saveLang();

            $answerRepo = new AnswerRepository();

            foreach ($answersData as $answerData) {
                $answerRepo->store($question, $answerData);
            }

            return $question;
        });
    }

    public function update(Question $question, array $validated): Question
    {
        return DB::transaction(static function () use ($question, $validated) {
            $translations = $validated['translations'];
            unset($validated['translations']);

            $answersData = $validated['answers'];
            unset($validated['answers']);

            $question->update($validated);

            foreach ($translations as $translation) {
                $question->setLang('title', $translation['title'], $translation['language_id']);
            }

            $question->saveLang();

            $answerRepo = new AnswerRepository();

            $answerRepo->destroyQuestionAllAnswers($question);

            foreach ($answersData as $answerData) {
                $answerRepo->store($question, $answerData);
            }

            return $question;
        });
    }

    public function destroy(Question $question): void
    {
        DB::transaction(static function () use ($question) {
            $answerRepo = new AnswerRepository();

            $answerRepo->destroyQuestionAllAnswers($question);

            $question->delete();
        });
    }

    public function changeActiveStatus(Question $question): void
    {
        DB::transaction(static function () use ($question) {
            $question->is_active = !$question->is_active;
            $question->save();
        });
    }
}
