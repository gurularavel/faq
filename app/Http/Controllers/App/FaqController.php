<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\App\Faqs\FaqSearchRequest;
use App\Http\Requests\GeneralListRequest;
use App\Http\Resources\Admin\Faqs\FaqsListResource;
use App\Http\Resources\App\Faqs\FaqArchivesListResource;
use App\Http\Resources\App\Faqs\FaqsSearchResource;
use App\Http\Resources\GeneralResource;
use App\Models\Category;
use App\Models\Faq;
use App\Repositories\CategoryRepository;
use App\Repositories\FaqRepository;
use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

class FaqController extends Controller
{
    private FaqRepository $repo;

    public function __construct(FaqRepository $repo)
    {
        $this->repo = $repo;
    }

    /**
     * @OA\Get(
     *     path="/api/app/faqs/search",
     *     summary="Search FAQ",
     *     tags={"AppFAQ"},
     *          security={
     *           {
     *               "AppApiToken": {},
     *               "AppSanctumBearerToken": {}
     *           }
     *       },
     *               @OA\Parameter(
     *           name="parameters",
     *           in="query",
     *           description="Search request parameters",
     *           required=true,
     *           @OA\Schema(ref="#/components/schemas/FaqSearchRequest")
     *       ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/FaqsSearchResource"))
     *     )
     * )
     */
    public function search(FaqSearchRequest $request): AnonymousResourceCollection
    {
        $validated = $request->validated();

        return FaqsSearchResource::collection($this->repo->fuzzySearch($validated));
    }

    /**
     * @OA\Get(
     *     path="/api/app/faqs/most-searched",
     *     summary="Most Searched FAQ",
     *     tags={"AppFAQ"},
     *          security={
     *           {
     *               "AppApiToken": {},
     *               "AppSanctumBearerToken": {}
     *           }
     *       },
     *                    @OA\Parameter(
     *            name="parameters",
     *            in="query",
     *            description="Search request parameters",
     *            required=true,
     *            @OA\Schema(ref="#/components/schemas/FaqSearchRequest")
     *        ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/FaqsListResource"))
     *     )
     * )
     */
    public function getMostSearchedItems(FaqSearchRequest $request): AnonymousResourceCollection
    {
        return FaqsListResource::collection($this->repo->getMostSearchedItems($request->validated()));
    }

    /**
     * @OA\Get(
     *     path="/api/app/faqs/find/{faq}",
     *     summary="Find by ID",
     *     tags={"AppFAQ"},
     *          security={
     *           {
     *               "AppApiToken": {},
     *               "AppSanctumBearerToken": {}
     *           }
     *       },
     *     @OA\Parameter(
     *         name="faq",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/FaqsListResource")
     *     )
     * )
     */
    public function findById(Faq $faq): FaqsListResource
    {
        $this->repo->checkIsActive($faq);
        $this->repo->loadTranslations($faq);

        return FaqsListResource::make($faq);
    }

    /**
     * @OA\Post(
     *     path="/api/app/faqs/open/{faq}",
     *     summary="Increase seen count",
     *          tags={"AppFAQ"},
     *           security={
     *            {
     *                "AppApiToken": {},
     *                "AppSanctumBearerToken": {}
     *            }
     *        },
     *     @OA\Parameter(
     *         name="faq",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Seen count increased",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     */
    public function open(Faq $faq): JsonResponse
    {
        $this->repo->checkIsActive($faq);
        $this->repo->open($faq);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Seen count increased')
                ->getLang('seen_count_increased'),
        ]));
    }

    /**
     * @OA\Get(
     *     path="/api/app/categories/{category}/selected-faqs",
     *     summary="Most Searched FAQ",
     *     tags={"AppCategory"},
     *          security={
     *           {
     *               "AppApiToken": {},
     *               "AppSanctumBearerToken": {}
     *           }
     *       },
     *               @OA\Parameter(
     *           name="category",
     *           in="path",
     *           required=true,
     *           @OA\Schema(type="integer")
     *       ),
     *                    @OA\Parameter(
     *            name="parameters",
     *            in="query",
     *            description="Search request parameters",
     *            required=true,
     *            @OA\Schema(ref="#/components/schemas/GeneralListRequest")
     *        ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/FaqsListResource"))
     *     )
     * )
     */
    public function getSelectedFaqsByCategory(GeneralListRequest $request, Category $category): AnonymousResourceCollection
    {
        return FaqsListResource::collection($this->repo->getSelectedFaqsByCategory($category, $request->validated()));
    }

    /**
     * @OA\Get(
     *     path="/api/app/faqs/{faq}/archives/load",
     *     summary="Load FAQ archives",
     *     tags={"AppFAQ"},
     *          security={
     *           {
     *               "AppApiToken": {},
     *               "AppSanctumBearerToken": {}
     *           }
     *       },
     *          @OA\Parameter(
     *          name="faq",
     *          in="path",
     *          required=true,
     *          @OA\Schema(type="integer")
     *      ),
     *                    @OA\Parameter(
     *            name="parameters",
     *            in="query",
     *            description="Search request parameters",
     *            required=true,
     *            @OA\Schema(ref="#/components/schemas/GeneralListRequest")
     *        ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/FaqsListResource"))
     *     )
     * )
     */
    public function loadArchives(GeneralListRequest $request, Faq $faq): AnonymousResourceCollection
    {
        return FaqArchivesListResource::collection($this->repo->loadArchives($faq, $request->validated()));
    }
}
