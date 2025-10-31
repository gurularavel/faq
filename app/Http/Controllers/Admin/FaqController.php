<?php

namespace App\Http\Controllers\Admin;

use App\Enum\FaqListTypeEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Faqs\FaqsLoadRequest;
use App\Http\Requests\Admin\Faqs\FaqStoreRequest;
use App\Http\Requests\Admin\Faqs\FaqUpdateRequest;
use App\Http\Requests\App\Faqs\FaqAddSelectedToCategoryRequest;
use App\Http\Requests\App\Faqs\FaqAddToListRequest;
use App\Http\Requests\App\Faqs\FaqBulkAddToListRequest;
use App\Http\Requests\App\Faqs\FaqBulkSelectedAddToCategoryRequest;
use App\Http\Requests\App\Faqs\FaqReportsTimeSeriesRequest;
use App\Http\Requests\App\Faqs\FaqReportsTopStatisticsRequest;
use App\Http\Resources\Admin\Faqs\FaqsListResource;
use App\Http\Resources\Admin\Faqs\FaqsReportTimeSeriesResource;
use App\Http\Resources\Admin\Faqs\FaqsReportTopStatisticsResource;
use App\Http\Resources\Admin\Faqs\FaqsResource;
use App\Http\Resources\Admin\Faqs\FaqResource;
use App\Http\Resources\GeneralResource;
use App\Models\Category;
use App\Models\Faq;
use App\Repositories\CategoryRepository;
use App\Repositories\FaqRepository;
use App\Services\LangService;
use Carbon\Carbon;
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
     *     path="/api/control/faqs/load",
     *     summary="Display a listing of the resource",
     *          tags={"Faq"},
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
     *          @OA\Schema(ref="#/components/schemas/FaqsLoadRequest")
     *      ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/FaqsResource"))
     *     )
     * )
     * Display a listing of the resource.
     *
     * @param FaqsLoadRequest $request
     * @return AnonymousResourceCollection
     */
    public function index(FaqsLoadRequest $request): AnonymousResourceCollection
    {
        return FaqsResource::collection($this->repo->load($request->validated()));
    }

    /**
     * @OA\Get(
     *     path="/api/control/faqs/list",
     *     summary="List faqs",
     *               tags={"Faq"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/FaqsListResource"))
     *     )
     * )
     */
    public function list(): AnonymousResourceCollection
    {
        return FaqsListResource::collection($this->repo->list());
    }

    /**
     * @OA\Get(
     *     path="/api/control/faqs/show/{faq}",
     *     summary="Show faq",
     *               tags={"Faq"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="faq",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/FaqResource")
     *     )
     * )
     */
    public function show(Faq $faq): FaqResource
    {
        $this->repo->show($faq);

        return FaqResource::make($faq);
    }

    /**
     * @OA\Post(
     *     path="/api/control/faqs/add",
     *     summary="Store a newly created resource in storage",
     *               tags={"Faq"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/FaqStoreRequest")
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
     * @param FaqStoreRequest $request
     * @return JsonResponse
     */
    public function store(FaqStoreRequest $request): JsonResponse
    {
        $faq = $this->repo->store($request);

        $this->repo->loadRelations($faq);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('faq_form_saved_successfully'),
            'data' => FaqsResource::make($faq),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/faqs/update/{faq}",
     *     summary="Update the specified resource in storage",
     *               tags={"Faq"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="faq",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/FaqUpdateRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Resource updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     */
    public function update(FaqUpdateRequest $request, Faq $faq): JsonResponse
    {
        $faq = $this->repo->update($faq, $request);

        $this->repo->loadRelations($faq);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('faq_form_saved_successfully'),
            'data' => FaqsResource::make($faq),
        ]));
    }

    /**
     * @OA\Delete(
     *     path="/api/control/faqs/delete/{faq}",
     *     summary="Remove the specified resource from storage",
     *               tags={"Faq"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="faq",
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
     * @param Faq $faq
     * @return JsonResponse
     */
    public function destroy(Faq $faq): JsonResponse
    {
        $this->repo->destroy($faq);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Deleted successfully!')
                ->getLang('faq_deleted_successfully'),
        ]));
    }

    /**
     * @OA\Delete(
     *     path="/api/control/faqs/images/delete/{faq}/{mediaId}",
     *     summary="Delete image from FAQ",
     *     tags={"Faq"},
     *     security={
     *         {
     *             "ApiToken": {},
     *             "SanctumBearerToken": {}
     *         }
     *     },
     *     @OA\Parameter(
     *         name="faq",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="mediaId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Image deleted successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     */
    public function destroyImage(Faq $faq, int $mediaId): JsonResponse
    {
        $this->repo->deleteImage($faq, $mediaId);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Selected media file deleted successfully!')
                ->getLang('faq_media_deleted_successfully'),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/faqs/change-active-status/{faq}",
     *     summary="Change the active status of the specified resource",
     *               tags={"Faq"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="faq",
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
    public function changeActiveStatus(Faq $faq): JsonResponse
    {
        $this->repo->changeActiveStatus($faq);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Status changed successfully!')
                ->getLang('admin_status_changed_successfully'),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/faqs/lists/add",
     *     summary="Add to list",
     *               tags={"Faq"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/FaqAddToListRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Resource updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     */
    public function addToList(FaqAddToListRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $faq = Faq::query()->findOrFail($validated['faq_id']);

        $this->repo->addToList($faq, FaqListTypeEnum::from($validated['list_type']));

        return response()->json([
            'message' => LangService::instance()
                ->setDefault('FAQ added to list successfully!')
                ->getLang('faq_added_to_list'),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/control/faqs/lists/remove",
     *     summary="Remove from list",
     *               tags={"Faq"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/FaqAddToListRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Resource updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     */
    public function removeFromList(FaqAddToListRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $faq = Faq::query()->findOrFail($validated['faq_id']);

        $this->repo->removeFromList($faq, FaqListTypeEnum::from($validated['list_type']));

        return response()->json([
            'message' => LangService::instance()
                ->setDefault('FAQ removed from list successfully!')
                ->getLang('faq_removed_from_list'),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/control/faqs/lists/bulk-add",
     *     summary="Add to list",
     *               tags={"Faq"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/FaqBulkAddToListRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Resource updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     */
    public function bulkAddToList(FaqBulkAddToListRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $this->repo->bulkAddToList($validated['faq_ids'], FaqListTypeEnum::from($validated['list_type']));

        return response()->json([
            'message' => LangService::instance()
                ->setDefault('FAQs added to list successfully!')
                ->getLang('faqs_added_to_list'),
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/control/reports/faqs/top-statistics",
     *     summary="Get top FAQ statistics",
     *     tags={"Reports"},
     *     security={
     *         {
     *             "ApiToken": {},
     *             "SanctumBearerToken": {}
     *         }
     *     },
     *               @OA\Parameter(
     *           name="parameters",
     *           in="query",
     *           required=false,
     *           @OA\Schema(ref="#/components/schemas/FaqReportsTopStatisticsRequest")
     *       ),
     *          @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *          @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/FaqsReportTopStatisticsResource"))
     *      )
     * )
     */
    public function topStatistics(FaqReportsTopStatisticsRequest $request): AnonymousResourceCollection
    {
        $validated = $request->validated();

        return FaqsReportTopStatisticsResource::collection($this->repo->topFaqs($validated['period'], $validated['limit'], ($validated['calendar'] ?? 'no') === 'yes'));
    }

    /**
     * @OA\Get(
     *     path="/api/control/reports/faqs/time-series",
     *     summary="Get FAQ time series data",
     *     tags={"Reports"},
     *     security={
     *         {
     *             "ApiToken": {},
     *             "SanctumBearerToken": {}
     *         }
     *     },
     *               @OA\Parameter(
     *           name="parameters",
     *           in="query",
     *           required=false,
     *           @OA\Schema(ref="#/components/schemas/FaqReportsTimeSeriesRequest")
     *       ),
     *          @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *          @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/FaqsReportTimeSeriesResource"))
     *      )
     * )
     */
    public function timeSeries(FaqReportsTimeSeriesRequest $request): AnonymousResourceCollection
    {
        $validated = $request->validated();

        return FaqsReportTimeSeriesResource::collection($this->repo->timeSeries($validated['granularity'], $validated['from'] ? Carbon::parse($validated['from']) : null, $validated['to'] ? Carbon::parse($validated['to']) : null));
    }

    /**
     * @OA\Get(
     *     path="/api/control/categories/{category}/selected-faqs/available-list",
     *     summary="Display a listing of the resource",
     *          tags={"Category"},
     *      security={
     *             {
     *                 "ApiToken": {},
     *                 "SanctumBearerToken": {}
     *             }
     *        },
     *               @OA\Parameter(
     *           name="category",
     *           in="path",
     *           required=true,
     *           @OA\Schema(type="integer")
     *       ),
     *          @OA\Parameter(
     *          name="parameters",
     *          in="query",
     *          description="List request parameters",
     *          required=false,
     *          @OA\Schema(ref="#/components/schemas/FaqsLoadRequest")
     *      ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/FaqsResource"))
     *     )
     * )
     * Display a listing of the resource.
     *
     * @param FaqsLoadRequest $request
     * @param Category $category
     * @return AnonymousResourceCollection
     */
    public function getAvailableFaqListForCategory(FaqsLoadRequest $request, Category $category): AnonymousResourceCollection
    {
        $validated = $request->validated();
        $validated['category'] = $category->id;

        (new CategoryRepository())->checkIsSub($category);

        return FaqsResource::collection($this->repo->load($validated, true));
    }

    /**
     * @OA\Post(
     *     path="/api/control/categories/{category}/selected-faqs/add",
     *     summary="Add selected to category",
     *               tags={"Category"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *          @OA\Parameter(
     *          name="category",
     *          in="path",
     *          required=true,
     *          @OA\Schema(type="integer")
     *      ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/FaqAddSelectedToCategoryRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Resource updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     */
    public function addSelectedToCategory(FaqAddSelectedToCategoryRequest $request, Category $category): JsonResponse
    {
        $validated = $request->validated();

        $faq = Faq::query()->findOrFail($validated['faq_id']);

        $this->repo->addSelectedToCategory($faq, $category);

        return response()->json([
            'message' => LangService::instance()
                ->setDefault('FAQ added selected to category successfully!')
                ->getLang('faq_added_selected_to_category'),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/control/categories/{category}/selected-faqs/remove",
     *     summary="Remove selected from category",
     *               tags={"Category"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *          @OA\Parameter(
     *          name="category",
     *          in="path",
     *          required=true,
     *          @OA\Schema(type="integer")
     *      ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/FaqAddSelectedToCategoryRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Resource updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     */
    public function removeSelectedFromCategory(FaqAddSelectedToCategoryRequest $request, Category $category): JsonResponse
    {
        $validated = $request->validated();

        $faq = Faq::query()->findOrFail($validated['faq_id']);

        $this->repo->removeSelectedFromCategory($faq, $category);

        return response()->json([
            'message' => LangService::instance()
                ->setDefault('FAQ removed selected from category successfully!')
                ->getLang('faq_removed_selected_from_category'),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/control/categories/{category}/selected-faqs/bulk-add",
     *     summary="Bulk Add selected to category",
     *               tags={"Category"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *          @OA\Parameter(
     *          name="category",
     *          in="path",
     *          required=true,
     *          @OA\Schema(type="integer")
     *      ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/FaqBulkSelectedAddToCategoryRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Resource updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     */
    public function bulkAddSelectedToCategory(FaqBulkSelectedAddToCategoryRequest $request, Category $category): JsonResponse
    {
        $validated = $request->validated();

        $this->repo->bulkAddSelectedToCategory($validated['faq_ids'], $category);

        return response()->json([
            'message' => LangService::instance()
                ->setDefault('FAQs added to list successfully!')
                ->getLang('faqs_added_to_list'),
        ]);
    }
}
