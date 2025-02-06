<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Faqs\FaqsLoadRequest;
use App\Http\Requests\Admin\Faqs\FaqStoreRequest;
use App\Http\Requests\Admin\Faqs\FaqUpdateRequest;
use App\Http\Resources\Admin\Faqs\FaqsListResource;
use App\Http\Resources\Admin\Faqs\FaqsResource;
use App\Http\Resources\Admin\Faqs\FaqResource;
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
        $this->repo->loadRelations($faq);

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
        $faq = $this->repo->store($request->validated());

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
        $faq = $this->repo->update($faq, $request->validated());

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
}
