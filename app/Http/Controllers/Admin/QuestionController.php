<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Questions\QuestionStoreRequest;
use App\Http\Requests\Admin\Questions\QuestionUpdateRequest;
use App\Http\Requests\GeneralListRequest;
use App\Http\Resources\Admin\Questions\QuestionsListResource;
use App\Http\Resources\Admin\Questions\QuestionsResource;
use App\Http\Resources\Admin\Questions\QuestionResource;
use App\Http\Resources\GeneralResource;
use App\Models\Question;
use App\Models\QuestionGroup;
use App\Repositories\QuestionRepository;
use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

class QuestionController extends Controller
{
    private QuestionRepository $repo;

    public function __construct(QuestionRepository $repo)
    {
        $this->repo = $repo;
    }

    /**
     * @OA\Get(
     *     path="/api/control/question-groups/{questionGroup}/questions/load",
     *     summary="Display a listing of the resource",
     *          tags={"Question"},
     *      security={
     *             {
     *                 "ApiToken": {},
     *                 "SanctumBearerToken": {}
     *             }
     *        },
     *          @OA\Parameter(
     *          name="questionGroup",
     *          in="path",
     *          required=true,
     *          @OA\Schema(type="integer")
     *      ),
     *          @OA\Parameter(
     *          name="parameters",
     *          in="query",
     *          description="List request parameters",
     *          required=false,
     *          @OA\Schema(ref="#/components/schemas/GeneralListRequest")
     *      ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/QuestionsResource"))
     *     )
     * )
     * Display a listing of the resource.
     *
     * @param GeneralListRequest $request
     * @param QuestionGroup $questionGroup
     * @return AnonymousResourceCollection
     */
    public function index(GeneralListRequest $request, QuestionGroup $questionGroup): AnonymousResourceCollection
    {
        return QuestionsResource::collection($this->repo->load($questionGroup, $request->validated()));
    }

    /**
     * @OA\Get(
     *     path="/api/control/question-groups/{questionGroup}/questions/list",
     *     summary="List questions",
     *               tags={"Question"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *               @OA\Parameter(
     *           name="questionGroup",
     *           in="path",
     *           required=true,
     *           @OA\Schema(type="integer")
     *       ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/QuestionsListResource"))
     *     )
     * )
     */
    public function list(QuestionGroup $questionGroup): AnonymousResourceCollection
    {
        return QuestionsListResource::collection($this->repo->list($questionGroup));
    }

    /**
     * @OA\Get(
     *     path="/api/control/question-groups/{questionGroup}/questions/show/{question}",
     *     summary="Show question",
     *               tags={"Question"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *               @OA\Parameter(
     *           name="questionGroup",
     *           in="path",
     *           required=true,
     *           @OA\Schema(type="integer")
     *       ),
     *     @OA\Parameter(
     *         name="question",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/QuestionResource")
     *     )
     * )
     */
    public function show(QuestionGroup $questionGroup, Question $question): QuestionResource
    {
        $this->repo->show($question);

        return QuestionResource::make($question);
    }

    /**
     * @OA\Post(
     *     path="/api/control/question-groups/{questionGroup}/questions/add",
     *     summary="Store a newly created resource in storage",
     *               tags={"Question"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *               @OA\Parameter(
     *           name="questionGroup",
     *           in="path",
     *           required=true,
     *           @OA\Schema(type="integer")
     *       ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/QuestionStoreRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Resource created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     *
     * Store a newly created resource in storage.
     *
     * @param QuestionStoreRequest $request
     * @param QuestionGroup $questionGroup
     * @return JsonResponse
     */
    public function store(QuestionStoreRequest $request, QuestionGroup $questionGroup): JsonResponse
    {
        $question = $this->repo->store($questionGroup, $request->validated());

        $this->repo->loadRelations($question);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('question_form_saved_successfully'),
            'data' => QuestionsResource::make($question),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/question-groups/{questionGroup}/questions/update/{question}",
     *     summary="Update the specified resource in storage",
     *               tags={"Question"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *               @OA\Parameter(
     *           name="questionGroup",
     *           in="path",
     *           required=true,
     *           @OA\Schema(type="integer")
     *       ),
     *     @OA\Parameter(
     *         name="question",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/QuestionUpdateRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Resource updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     */
    public function update(QuestionUpdateRequest $request, QuestionGroup $questionGroup, Question $question): JsonResponse
    {
        $question = $this->repo->update($question, $request->validated());

        $this->repo->loadRelations($question);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('question_form_saved_successfully'),
            'data' => QuestionsResource::make($question),
        ]));
    }

    /**
     * @OA\Delete(
     *     path="/api/control/question-groups/{questionGroup}/questions/delete/{question}",
     *     summary="Remove the specified resource from storage",
     *               tags={"Question"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *               @OA\Parameter(
     *           name="questionGroup",
     *           in="path",
     *           required=true,
     *           @OA\Schema(type="integer")
     *       ),
     *     @OA\Parameter(
     *         name="question",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Resource deleted successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     *
     * Remove the specified resource from storage.
     *
     * @param QuestionGroup $questionGroup
     * @param Question $question
     * @return JsonResponse
     */
    public function destroy(QuestionGroup $questionGroup, Question $question): JsonResponse
    {
        $this->repo->destroy($question);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Deleted successfully!')
                ->getLang('question_deleted_successfully'),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/question-groups/{questionGroup}/questions/change-active-status/{question}",
     *     summary="Change the active status of the specified resource",
     *               tags={"Question"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *               @OA\Parameter(
     *           name="questionGroup",
     *           in="path",
     *           required=true,
     *           @OA\Schema(type="integer")
     *       ),
     *     @OA\Parameter(
     *         name="question",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Status changed successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     */
    public function changeActiveStatus(QuestionGroup $questionGroup, Question $question): JsonResponse
    {
        $this->repo->changeActiveStatus($question);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Status changed successfully!')
                ->getLang('admin_status_changed_successfully'),
        ]));
    }
}
