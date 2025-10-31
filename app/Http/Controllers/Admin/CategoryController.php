<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Categories\CategoriesListRequest;
use App\Http\Requests\Admin\Categories\CategoryStoreRequest;
use App\Http\Requests\Admin\Categories\CategoryUpdateRequest;
use App\Http\Requests\GeneralListRequest;
use App\Http\Resources\Admin\Categories\CategoriesListResource;
use App\Http\Resources\Admin\Categories\CategoriesResource;
use App\Http\Resources\Admin\Categories\CategoryResource;
use App\Http\Resources\GeneralResource;
use App\Models\Category;
use App\Models\Faq;
use App\Repositories\CategoryRepository;
use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

class CategoryController extends Controller
{
    private CategoryRepository $repo;

    public function __construct(CategoryRepository $repo)
    {
        $this->repo = $repo;
    }

    /**
     * @OA\Get(
     *     path="/api/control/categories/load",
     *     summary="Display a listing of the resource",
     *          tags={"Category"},
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
     *          @OA\Schema(ref="#/components/schemas/CategoriesListRequest")
     *      ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/CategoriesResource"))
     *     )
     * )
     * Display a listing of the resource.
     *
     * @param CategoriesListRequest $request
     * @return AnonymousResourceCollection
     */
    public function index(CategoriesListRequest $request): AnonymousResourceCollection
    {
        return CategoriesResource::collection($this->repo->load($request->validated()));
    }

    /**
     * @OA\Get(
     *     path="/api/control/categories/list",
     *     summary="List categories",
     *               tags={"Category"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *               @OA\Parameter(
     *           name="parameters",
     *           in="query",
     *           description="List request parameters",
     *           required=false,
     *           @OA\Schema(ref="#/components/schemas/CategoriesListRequest")
     *       ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/CategoriesListResource"))
     *     )
     * )
     */
    public function list(CategoriesListRequest $request): AnonymousResourceCollection
    {
        return CategoriesListResource::collection($this->repo->list($request->validated()));
    }

    /**
     * @OA\Get(
     *     path="/api/control/categories/subs/{category}",
     *     summary="Load subcategories",
     *               tags={"Category"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
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
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/CategoriesResource"))
     *     )
     * )
     */
    public function loadSubs(GeneralListRequest $request, Category $category): AnonymousResourceCollection
    {
        return CategoriesResource::collection($this->repo->loadSubs($category, $request->validated()));
    }

    /**
     * @OA\Get(
     *     path="/api/control/categories/show/{category}",
     *     summary="Show category",
     *               tags={"Category"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/CategoryResource")
     *     )
     * )
     */
    public function show(Category $category): CategoryResource
    {
        $this->repo->show($category);

        return CategoryResource::make($category);
    }

    /**
     * @OA\Post(
     *     path="/api/control/categories/add",
     *     summary="Store a newly created resource in storage",
     *               tags={"Category"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/CategoryStoreRequest")
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
     * @param CategoryStoreRequest $request
     * @return JsonResponse
     */
    public function store(CategoryStoreRequest $request): JsonResponse
    {
        $category = $this->repo->store($request);

        $this->repo->loadRelations($category);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('category_form_saved_successfully'),
            'data' => CategoriesResource::make($category),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/categories/update/{category}",
     *     summary="Update the specified resource in storage",
     *               tags={"Category"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/CategoryUpdateRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Resource updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     */
    public function update(CategoryUpdateRequest $request, Category $category): JsonResponse
    {
        $category = $this->repo->update($category, $request);

        $this->repo->loadRelations($category);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('category_form_saved_successfully'),
            'data' => CategoriesResource::make($category),
        ]));
    }

    /**
     * @OA\Delete(
     *     path="/api/control/categories/delete/{category}",
     *     summary="Remove the specified resource from storage",
     *               tags={"Category"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="category",
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
     * @param Category $category
     * @return JsonResponse
     */
    public function destroy(Category $category): JsonResponse
    {
        $this->repo->destroy($category);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Deleted successfully!')
                ->getLang('category_deleted_successfully'),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/categories/change-active-status/{category}",
     *     summary="Change the active status of the specified resource",
     *               tags={"Category"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="category",
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
    public function changeActiveStatus(Category $category): JsonResponse
    {
        $this->repo->changeActiveStatus($category);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Status changed successfully!')
                ->getLang('admin_status_changed_successfully'),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/categories/{category}/selected-faqs/choose-pinned-faq/{faq}",
     *     summary="Choose pinned FAQ for category",
     *               tags={"Category"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *          @OA\Parameter(
     *          name="faq",
     *          in="path",
     *          required=true,
     *          @OA\Schema(type="integer")
     *      ),
     *     @OA\Response(
     *         response=200,
     *         description="Status changed successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     */
    public function choosePinnedFaqForCategory(Category $category, Faq $faq): JsonResponse
    {
        $this->repo->choosePinnedFaqForCategory($category, $faq);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Pinned FAQ changed successfully!')
                ->getLang('pinned_faq_changed_successfully'),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/categories/{category}/selected-faqs/remove-pinned-faq",
     *     summary="Remove pinned FAQ for category",
     *               tags={"Category"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="category",
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
    public function removePinnedFaqForCategory(Category $category): JsonResponse
    {
        $this->repo->removePinnedFaqForCategory($category);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Pinned FAQ removed successfully!')
                ->getLang('pinned_faq_removed_successfully'),
        ]));
    }
}
