<?php

namespace App\Http\Controllers;

use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use OpenApi\Annotations as OA;

class LocalTranslationsController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/control/local-translations/languages/list",
     *     operationId="getLanguages",
     *     tags={"LocalTranslations"},
     *     summary="Get available languages",
     *     description="Returns a list of available languages and versions.",
     *
     *     security={
     *            {
     *                "ApiToken": {}
     *            }
     *       },
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successful response",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(type="object")
     *             ),
     *             @OA\Property(
     *                 property="versions",
     *                 type="object"
     *             )
     *         )
     *     )
     * )
     */
    public function getLanguages(): JsonResponse
    {
        return response()->json([
            'data' => LangService::instance()->getLanguages(),
            'versions' => json_decode(LangService::instance()->getVersionsJson()),
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/control/local-translations/{lang}",
     *     operationId="getTranslations",
     *     tags={"LocalTranslations"},
     *     summary="Get translations for a language",
     *     description="Returns translations for the specified language.",
     *
     *     security={
     *            {
     *                "ApiToken": {}
     *            }
     *       },
     *
     *     @OA\Parameter(
     *         name="lang",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful response",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="version", type="integer"),
     *                 @OA\Property(
     *                     property="translations",
     *                     type="object"
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Language not found"
     *     )
     * )
     */
    public function getTranslations(string $lang): JsonResponse
    {
        LangService::instance()->getLanguageByKey($lang);

        return response()->json([
            'data' => [
                'version' => LangService::instance()->getVersion(),
                'translations' => LangService::instance()->setLanguage($lang)->getStaticTranslations(),
            ]
        ]);
    }
}
