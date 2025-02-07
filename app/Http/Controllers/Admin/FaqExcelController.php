<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Faqs\FaqImportRequest;
use App\Http\Resources\Admin\FaqExcels\FaqExcelsResource;
use App\Http\Resources\GeneralResource;
use App\Models\FaqExcel;
use App\Repositories\FaqExcelRepository;
use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

class FaqExcelController extends Controller
{
    private FaqExcelRepository $repo;

    public function __construct(FaqExcelRepository $repo)
    {
        $this->repo = $repo;
    }

    /**
     * @OA\Get(
     *     path="/api/control/faqs/excels/load",
     *     summary="Get list of last 10 FAQ excels",
     *     tags={"FaqExcel"},
     *     security={
     *            {
     *                "ApiToken": {},
     *                "SanctumBearerToken": {}
     *            }
     *       },
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/FaqExcelsResource"))
     *     )
     * )
     */
    public function index(): AnonymousResourceCollection
    {
        return FaqExcelsResource::collection($this->repo->load());
    }

    /**
     * @OA\Post(
     *     path="/api/control/faqs/excels/import",
     *     summary="Import new items",
     *               tags={"FaqExcel"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *          @OA\RequestBody(
     *          required=true,
     *          content={
     *              @OA\MediaType(
     *                  mediaType="multipart/form-data",
     *                  @OA\Schema(ref="#/components/schemas/FaqImportRequest")
     *              )
     *          }
     *      ),
     *     @OA\Response(
     *         response=201,
     *         description="Resource created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     *
     * Store a newly created resource in storage.
     *
     * @param FaqImportRequest $request
     * @return JsonResponse
     */
    public function import(FaqImportRequest $request): JsonResponse
    {
        $this->repo->import($request);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Import started successfully!')
                ->getLang('faq_import_started_successfully'),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/faqs/excels/rollback/{faqExcel}",
     *     summary="Rollback data",
     *               tags={"FaqExcel"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="faqExcel",
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
    public function rollback(FaqExcel $faqExcel): JsonResponse
    {
        $this->repo->rollback($faqExcel);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Rollback successfully!')
                ->getLang('Rollback successfully!'),
        ]));
    }
}
