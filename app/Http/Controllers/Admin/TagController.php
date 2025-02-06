<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Tags\TagStoreRequest;
use App\Http\Requests\Admin\Tags\TagUpdateRequest;
use App\Http\Requests\GeneralListRequest;
use App\Http\Resources\Admin\Tags\TagResource;
use App\Http\Resources\Admin\Tags\TagsListResource;
use App\Http\Resources\Admin\Tags\TagsResource;
use App\Http\Resources\GeneralResource;
use App\Models\Tag;
use App\Repositories\TagRepository;
use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

class TagController extends Controller
{
    private TagRepository $repo;

    public function __construct(TagRepository $repo)
    {
        $this->repo = $repo;
    }

    /**
     * @OA\Get(
     *     path="/api/control/tags/load",
     *     summary="Get list of tags",
     *     tags={"Tag"},
     *     security={
     *            {
     *                "ApiToken": {},
     *                "SanctumBearerToken": {}
     *            }
     *       },
     *               @OA\Parameter(
     *           name="parameters",
     *           in="query",
     *           description="List request parameters",
     *           required=false,
     *           @OA\Schema(ref="#/components/schemas/GeneralListRequest")
     *       ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/TagsResource"))
     *     )
     * )
     */
    public function index(GeneralListRequest $request): AnonymousResourceCollection
    {
        return TagsResource::collection($this->repo->load($request->validated()));
    }

    /**
     * @OA\Get(
     *     path="/api/control/tags/list",
     *     summary="Get list of tags",
     *     tags={"Tag"},
     *     security={
     *         {"ApiToken": {}},
     *         {"SanctumBearerToken": {}}
     *     },
     *     @OA\Response(
     *         response=200,
     *         description="Tags list retrieved successfully",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/TagsListResource"))
     *     )
     * )
     *
     * Display a listing of the resource.
     *
     * @return AnonymousResourceCollection
     */
    public function list(): AnonymousResourceCollection
    {
        return TagsListResource::collection($this->repo->list());
    }

    /**
     * @OA\Get(
     *     path="/api/control/tags/show/{id}",
     *     summary="Get tag by ID",
     *     tags={"Tag"},
     *          security={
     *            {
     *                "ApiToken": {},
     *                "SanctumBearerToken": {}
     *            }
     *       },
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/TagResource")
     *     )
     * )
     */
    public function show(Tag $tag): TagResource
    {
        return TagResource::make($tag);
    }

    /**
     * @OA\Get(
     *     path="/api/control/tags/find/{title}",
     *     summary="Find tag by title",
     *     tags={"Tag"},
     *          security={
     *            {
     *                "ApiToken": {},
     *                "SanctumBearerToken": {}
     *            }
     *       },
     *     @OA\Parameter(
     *         name="title",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *          @OA\Response(
     *          response=200,
     *          description="Tags list retrieved successfully",
     *          @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/TagsListResource"))
     *      )
     * )
     */
    public function findByTitle(string $title): AnonymousResourceCollection
    {
        return TagsListResource::collection($this->repo->findByTitle($title));
    }

    /**
     * @OA\Post(
     *     path="/api/control/tags/add",
     *     summary="Create a new tag",
     *     tags={"Tag"},
     *          security={
     *            {
     *                "ApiToken": {},
     *                "SanctumBearerToken": {}
     *            }
     *       },
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/TagStoreRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Tag created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/TagsResource")
     *     )
     * )
     */
    public function store(TagStoreRequest $request): JsonResponse
    {
        $tag = $this->repo->store($request->validated());

        $this->repo->loadRelations($tag);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('admin_form_saved_successfully'),
            'data' => TagResource::make($tag),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/tags/update/{id}",
     *     summary="Update an existing tag",
     *     tags={"Tag"},
     *          security={
     *            {
     *                "ApiToken": {},
     *                "SanctumBearerToken": {}
     *            }
     *       },
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/TagUpdateRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Tag updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/TagsResource")
     *     )
     * )
     */
    public function update(TagUpdateRequest $request, Tag $tag): JsonResponse
    {
        $updatedTag = $this->repo->update($tag, $request->validated());

        $this->repo->loadRelations($updatedTag);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('admin_form_saved_successfully'),
            'data' => TagResource::make($updatedTag),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/tags/change-active-status/{id}",
     *     summary="Change the active status of the specified resource",
     *               tags={"Tag"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="id",
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
    public function changeActiveStatus(Tag $tag): JsonResponse
    {
        $this->repo->changeActiveStatus($tag);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Status changed successfully!')
                ->getLang('admin_status_changed_successfully'),
        ]));
    }

    /**
     * @OA\Delete(
     *     path="/api/control/tags/delete/{id}",
     *     summary="Delete an tag",
     *     tags={"Tag"},
     *          security={
     *            {
     *                "ApiToken": {},
     *                "SanctumBearerToken": {}
     *            }
     *       },
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Admin deleted successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     */
    public function destroy(Tag $tag): JsonResponse
    {
        $this->repo->destroy($tag);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Deleted successfully!')
                ->getLang('admin_deleted_successfully'),
        ]));
    }
}
