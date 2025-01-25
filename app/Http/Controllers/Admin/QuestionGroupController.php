<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\QuestionGroups\QuestionGroupStoreRequest;
use App\Http\Requests\Admin\QuestionGroups\QuestionGroupUpdateRequest;
use App\Http\Requests\GeneralListRequest;
use App\Http\Resources\Admin\QuestionGroups\QuestionGroupsListResource;
use App\Http\Resources\Admin\QuestionGroups\QuestionGroupsResource;
use App\Http\Resources\Admin\QuestionGroups\QuestionGroupResource;
use App\Http\Resources\GeneralResource;
use App\Models\QuestionGroup;
use App\Repositories\QuestionGroupRepository;
use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

class QuestionGroupController extends Controller
{
    private QuestionGroupRepository $repo;

    public function __construct(QuestionGroupRepository $repo)
    {
        $this->repo = $repo;
    }

    /**
     * @OA\Get(
     *     path="/api/control/question-groups/load",
     *     summary="Display a listing of the resource",
     *          tags={"QuestionGroup"},
     *      security={
     *             {
     *                 "ApiToken": {},
     *                 "SanctumBearerToken": {}
     *             }
     *        },
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
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/QuestionGroupsResource"))
     *     )
     * )
     * Display a listing of the resource.
     *
     * @param GeneralListRequest $request
     * @return AnonymousResourceCollection
     */
    public function index(GeneralListRequest $request): AnonymousResourceCollection
    {
        return QuestionGroupsResource::collection($this->repo->load($request->validated()));
    }

    /**
     * @OA\Get(
     *     path="/api/control/question-groups/list",
     *     summary="List questionGroups",
     *               tags={"QuestionGroup"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/QuestionGroupsListResource"))
     *     )
     * )
     */
    public function list(): AnonymousResourceCollection
    {
        return QuestionGroupsListResource::collection($this->repo->list());
    }

    /**
     * @OA\Get(
     *     path="/api/control/question-groups/show/{questionGroup}",
     *     summary="Show questionGroup",
     *               tags={"QuestionGroup"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="questionGroup",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/QuestionGroupResource")
     *     )
     * )
     */
    public function show(QuestionGroup $questionGroup): QuestionGroupResource
    {
        $this->repo->loadRelations($questionGroup);

        return QuestionGroupResource::make($questionGroup);
    }

    /**
     * @OA\Post(
     *     path="/api/control/question-groups/add",
     *     summary="Store a newly created resource in storage",
     *               tags={"QuestionGroup"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/QuestionGroupStoreRequest")
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
     * @param QuestionGroupStoreRequest $request
     * @return JsonResponse
     */
    public function store(QuestionGroupStoreRequest $request): JsonResponse
    {
        $questionGroup = $this->repo->store($request->validated());

        $this->repo->loadRelations($questionGroup);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('question_group_form_saved_successfully'),
            'data' => QuestionGroupsResource::make($questionGroup),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/question-groups/update/{questionGroup}",
     *     summary="Update the specified resource in storage",
     *               tags={"QuestionGroup"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="questionGroup",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/QuestionGroupUpdateRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Resource updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     */
    public function update(QuestionGroupUpdateRequest $request, QuestionGroup $questionGroup): JsonResponse
    {
        $questionGroup = $this->repo->update($questionGroup, $request->validated());

        $this->repo->loadRelations($questionGroup);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('question_group_form_saved_successfully'),
            'data' => QuestionGroupsResource::make($questionGroup),
        ]));
    }

    /**
     * @OA\Delete(
     *     path="/api/control/question-groups/delete/{questionGroup}",
     *     summary="Remove the specified resource from storage",
     *               tags={"QuestionGroup"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="questionGroup",
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
     * @return JsonResponse
     */
    public function destroy(QuestionGroup $questionGroup): JsonResponse
    {
        $this->repo->destroy($questionGroup);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Deleted successfully!')
                ->getLang('question_group_deleted_successfully'),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/question-groups/change-active-status/{questionGroup}",
     *     summary="Change the active status of the specified resource",
     *               tags={"QuestionGroup"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="questionGroup",
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
    public function changeActiveStatus(QuestionGroup $questionGroup): JsonResponse
    {
        $this->repo->changeActiveStatus($questionGroup);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Status changed successfully!')
                ->getLang('admin_status_changed_successfully'),
        ]));
    }
}
