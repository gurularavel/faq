<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\App\Exams\ExamChooseAnswerRequest;
use App\Http\Resources\App\Exams\ExamsListResource;
use App\Http\Resources\App\Exams\QuestionsListResource;
use App\Models\Exam;
use App\Models\QuestionGroup;
use App\Services\ExamService;
use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

class ExamController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/app/exams/list",
     *     summary="Get list of exams",
     *     tags={"Exams"},
     *          security={
     *           {
     *               "AppApiToken": {},
     *               "AppSanctumBearerToken": {}
     *           }
     *       },
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/ExamsListResource"))
     *     )
     * )
     */
    public function list(): AnonymousResourceCollection
    {
        return ExamsListResource::collection(ExamService::instance()->getUserExams());
    }

    /**
     * @OA\Post(
     *     path="/api/app/exams/{exam}/start",
     *     summary="Start an exam",
     *     tags={"Exams"},
     *     security={
     *         {"AppApiToken": {}},
     *         {"AppSanctumBearerToken": {}}
     *     },
     *     @OA\Parameter(
     *         name="exam",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="percent", type="float"),
     *             @OA\Property(property="next_question", ref="#/components/schemas/QuestionsListResource")
     *         )
     *     )
     * )
     */
    public function start(Exam $exam): JsonResponse
    {
        ExamService::instance()->startExam($exam);
        $question = ExamService::instance()->getNextQuestion($exam);

        return response()->json([
            'message' => LangService::instance()
                ->setDefault('Exam started successfully!')
                ->getLang('exam_started'),
            'questions_count' => ExamService::instance()->getAllQuestionsCount($exam),
            'percent' => 0,
            'next_question' => $question ? QuestionsListResource::make($question) : null,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/app/exams/start-from-notification/{questionGroup}",
     *     summary="Start an exam from a notification (by model_id)",
     *     tags={"Exams"},
     *     security={
     *         {"AppApiToken": {}},
     *         {"AppSanctumBearerToken": {}}
     *     },
     *     @OA\Parameter(
     *         name="questionGroup",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="percent", type="float"),
     *             @OA\Property(property="next_question", ref="#/components/schemas/QuestionsListResource")
     *         )
     *     )
     * )
     */
    public function startFromNotification(QuestionGroup $questionGroup): JsonResponse
    {
        return $this->start(ExamService::instance()->getUserLastActiveExamByQuestionGroup($questionGroup));
    }

    /**
     * @OA\Get(
     *     path="/api/app/exams/get-exam-from-notification/{questionGroup}",
     *     summary="Get exam from a notification (by model_id)",
     *     tags={"Exams"},
     *     security={
     *         {"AppApiToken": {}},
     *         {"AppSanctumBearerToken": {}}
     *     },
     *     @OA\Parameter(
     *         name="questionGroup",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *          @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *          @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/ExamsListResource"))
     *      )
     * )
     */
    public function getExamFromNotification(QuestionGroup $questionGroup): ExamsListResource
    {
        return ExamsListResource::make(ExamService::instance()->getUserLastActiveExamByQuestionGroup($questionGroup));
    }

    /**
     * @OA\Post(
     *     path="/api/app/exams/{exam}/choose-answer",
     *     summary="Choose an answer for a question in an exam",
     *     tags={"Exams"},
     *     security={
     *         {"AppApiToken": {}},
     *         {"AppSanctumBearerToken": {}}
     *     },
     *     @OA\Parameter(
     *         name="exam",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/ExamChooseAnswerRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="is_correct", type="boolean"),
     *             @OA\Property(property="is_finish", type="boolean"),
     *             @OA\Property(property="percent", type="float"),
     *             @OA\Property(property="next_question", ref="#/components/schemas/QuestionsListResource"),
     *             @OA\Property(
     *                      property="result",
     *                      type="array",
     *                      description="Exam result",
     *                      @OA\Items(
     *                          @OA\Property(property="correct_questions_count", type="integer", example=1),
     *                          @OA\Property(property="incorrect_questions_count", type="integer", example=1),
     *                          @OA\Property(property="total_questions_count", type="integer", example=1),
     *                          @OA\Property(property="success_rate", type="integer", example=100),
     *                          @OA\Property(property="point", type="integer", example=100),
     *                          @OA\Property(property="total_time_spent_formatted", type="string", example="19:07"),
     *                          @OA\Property(property="total_time_spent_seconds", type="integer", example=180)
     *                      )
     *                  )
     *         )
     *     )
     * )
     */
    public function chooseAnswer(ExamChooseAnswerRequest $request, Exam $exam): JsonResponse
    {
        $validated = $request->validated();

        $isCorrect = ExamService::instance()->chooseAnswer($exam, $validated['question'], $validated['answer']);
        $hasNextQuestion = ExamService::instance()->hasNextQuestion($exam);
        $question = ExamService::instance()->getNextQuestion($exam, $hasNextQuestion);
        $result = ExamService::instance()->getExamResult($exam, $hasNextQuestion);

        return response()->json([
            'message' => LangService::instance()
                ->setDefault('Answer chosen successfully!')
                ->getLang('answer_chosen'),
            'is_correct' => $isCorrect,
            'is_finish' => $exam->isEnded(),
            'percent' => ExamService::instance()->calculateExamPercent($exam),
            'next_question' => $question ? QuestionsListResource::make($question) : null,
            'result' => $result,
        ]);
    }
}
