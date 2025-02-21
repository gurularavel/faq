<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\App\Faqs\FaqSearchRequest;
use App\Http\Resources\Admin\Faqs\FaqsListResource;
use App\Http\Resources\GeneralResource;
use App\Models\Faq;
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
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/FaqsListResource"))
     *     )
     * )
     */
    public function search(FaqSearchRequest $request): AnonymousResourceCollection
    {
        $validated = $request->validated();

        return FaqsListResource::collection($this->repo->fuzzySearch($validated));
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
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/FaqsListResource"))
     *     )
     * )
     */
    public function getMostSearchedItems(): AnonymousResourceCollection
    {
        return FaqsListResource::collection($this->repo->getMostSearchedItems());
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
}
