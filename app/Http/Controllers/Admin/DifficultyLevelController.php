<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DifficultyLevels\DifficultyLevelStoreRequest;
use App\Http\Requests\Admin\DifficultyLevels\DifficultyLevelUpdateRequest;
use App\Http\Requests\GeneralListRequest;
use App\Http\Resources\Admin\DifficultyLevels\DifficultyLevelsListResource;
use App\Http\Resources\Admin\DifficultyLevels\DifficultyLevelsResource;
use App\Http\Resources\Admin\DifficultyLevels\DifficultyLevelResource;
use App\Http\Resources\GeneralResource;
use App\Models\DifficultyLevel;
use App\Repositories\DifficultyLevelRepository;
use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

class DifficultyLevelController extends Controller
{
    private DifficultyLevelRepository $repo;

    public function __construct(DifficultyLevelRepository $repo)
    {
        $this->repo = $repo;
    }

    /**
     * @OA\Get(
     *     path="/api/control/difficulty-levels/load",
     *     summary="Display a listing of the resource",
     *          tags={"DifficultyLevel"},
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
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/DifficultyLevelsResource"))
     *     )
     * )
     * Display a listing of the resource.
     *
     * @param GeneralListRequest $request
     * @return AnonymousResourceCollection
     */
    public function index(GeneralListRequest $request): AnonymousResourceCollection
    {
        return DifficultyLevelsResource::collection($this->repo->load($request->validated()));
    }

    /**
     * @OA\Get(
     *     path="/api/control/difficulty-levels/list",
     *     summary="List difficultyLevels",
     *               tags={"DifficultyLevel"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/DifficultyLevelsListResource"))
     *     )
     * )
     */
    public function list(): AnonymousResourceCollection
    {
        return DifficultyLevelsListResource::collection($this->repo->list());
    }

    /**
     * @OA\Get(
     *     path="/api/control/difficulty-levels/show/{difficultyLevel}",
     *     summary="Show difficultyLevel",
     *               tags={"DifficultyLevel"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="difficultyLevel",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/DifficultyLevelResource")
     *     )
     * )
     */
    public function show(DifficultyLevel $difficultyLevel): DifficultyLevelResource
    {
        $this->repo->loadRelations($difficultyLevel);

        return DifficultyLevelResource::make($difficultyLevel);
    }

    /**
     * @OA\Post(
     *     path="/api/control/difficulty-levels/add",
     *     summary="Store a newly created resource in storage",
     *               tags={"DifficultyLevel"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/DifficultyLevelStoreRequest")
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
     * @param DifficultyLevelStoreRequest $request
     * @return JsonResponse
     */
    public function store(DifficultyLevelStoreRequest $request): JsonResponse
    {
        $difficultyLevel = $this->repo->store($request->validated());

        $this->repo->loadRelations($difficultyLevel);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('difficulty_level_form_saved_successfully'),
            'data' => DifficultyLevelsResource::make($difficultyLevel),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/difficulty-levels/update/{difficultyLevel}",
     *     summary="Update the specified resource in storage",
     *               tags={"DifficultyLevel"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="difficultyLevel",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/DifficultyLevelUpdateRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Resource updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     */
    public function update(DifficultyLevelUpdateRequest $request, DifficultyLevel $difficultyLevel): JsonResponse
    {
        $difficultyLevel = $this->repo->update($difficultyLevel, $request->validated());

        $this->repo->loadRelations($difficultyLevel);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('difficulty_level_form_saved_successfully'),
            'data' => DifficultyLevelsResource::make($difficultyLevel),
        ]));
    }

    /**
     * @OA\Delete(
     *     path="/api/control/difficulty-levels/delete/{difficultyLevel}",
     *     summary="Remove the specified resource from storage",
     *               tags={"DifficultyLevel"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="difficultyLevel",
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
     * @param DifficultyLevel $difficultyLevel
     * @return JsonResponse
     */
    public function destroy(DifficultyLevel $difficultyLevel): JsonResponse
    {
        $this->repo->destroy($difficultyLevel);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Deleted successfully!')
                ->getLang('difficulty_level_deleted_successfully'),
        ]));
    }
}
