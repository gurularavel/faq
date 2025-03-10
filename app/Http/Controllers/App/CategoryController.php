<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Categories\CategoriesListRequest;
use App\Http\Resources\Admin\Categories\CategoriesListResource;
use App\Repositories\CategoryRepository;
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
     *     path="/api/app/categories/list",
     *     summary="List categories for app",
     *               tags={"AppCategory"},
     *               security={
     *            {
     *                "AppApiToken": {},
     *                "AppSanctumBearerToken": {}
     *            }
     *        },
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
}
