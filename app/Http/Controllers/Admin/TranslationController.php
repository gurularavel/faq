<?php

namespace App\Http\Controllers\Admin;

use App\Enum\TranslationGroupEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Translations\GetTranslationsRequest;
use App\Http\Requests\Admin\Translations\TranslationStoreRequest;
use App\Http\Requests\Admin\Translations\TranslationUpdateRequest;
use App\Http\Resources\GeneralResource;
use App\Repositories\TranslationRepository;
use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use OpenApi\Annotations as OA;

class TranslationController extends Controller
{
    private TranslationRepository $repo;

    public function __construct(TranslationRepository $repo)
    {
        $this->repo = $repo;
    }

    /**
     * @OA\Get(
     *     path="/api/control/translations/load",
     *     summary="Get list of translations",
     *     tags={"Translation"},
     *     security={
     *         {"ApiToken": {}},
     *         {"SanctumBearerToken": {}}
     *     },
     *     @OA\Parameter(
     *         name="group",
     *         in="query",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="keyword",
     *         in="query",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="text",
     *         in="query",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Translations list retrieved successfully",
     *         @OA\JsonContent(type="object")
     *     )
     * )
     *
     * Display a listing of the resource.
     *
     * @param GetTranslationsRequest $request
     * @return JsonResponse
     */
    public function index(GetTranslationsRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $languages = LangService::instance()->getLanguages();

        $translations = $this->repo->load($languages, $validated);

        return response()->json([
            'data' => [
                'translations' => $translations,
                'languages' => $languages,
            ]
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/control/translations/filters",
     *     summary="Get translation filters",
     *     tags={"Translation"},
     *     security={
     *         {"ApiToken": {}},
     *         {"SanctumBearerToken": {}}
     *     },
     *     @OA\Response(
     *         response=200,
     *         description="Filters retrieved successfully",
     *         @OA\JsonContent(type="object")
     *     )
     * )
     *
     * Get translation filters.
     *
     * @return JsonResponse
     */
    public function filters(): JsonResponse
    {
        return response()->json([
            'data' => [
                'groups' => TranslationGroupEnum::getList(),
            ]
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/control/translations/show/{group}/{key}",
     *     summary="Get translation by group and key",
     *     tags={"Translation"},
     *     security={
     *         {"ApiToken": {}},
     *         {"SanctumBearerToken": {}}
     *     },
     *     @OA\Parameter(
     *         name="group",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="key",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Translation retrieved successfully",
     *         @OA\JsonContent(type="object")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Translation not found",
     *         @OA\JsonContent(type="object")
     *     )
     * )
     *
     * Get translation by group and key.
     *
     * @param string $group
     * @param string $key
     * @return JsonResponse
     */
    public function show(string $group, string $key): JsonResponse
    {
        $translations = $this->repo->findByKey($group, $key);

        if (count($translations) === 0) {
            return response()->json(GeneralResource::make([
                'message' => 'Translations not found!',
            ]), 404);
        };

        return response()->json([
            'data' => [
                'translations' => $translations,
            ]
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/control/translations/update/{group}/{key}",
     *     summary="Update translation",
     *     tags={"Translation"},
     *     security={
     *         {"ApiToken": {}},
     *         {"SanctumBearerToken": {}}
     *     },
     *     @OA\Parameter(
     *         name="group",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="key",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/TranslationUpdateRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Translation updated successfully",
     *         @OA\JsonContent(type="object")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Translation not found",
     *         @OA\JsonContent(type="object")
     *     )
     * )
     *
     * Update translation.
     *
     * @param TranslationUpdateRequest $request
     * @param string $group
     * @param string $key
     * @return JsonResponse
     */
    public function update(TranslationUpdateRequest $request, string $group, string $key): JsonResponse
    {
        if (! $this->repo->checkByKey($group, $key)) {
            return response()->json(GeneralResource::make([
                'message' => 'Translations not found!',
            ]), 404);
        }

        $this->repo->update($group, $key, $request->validated());

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('admin_form_saved_successfully'),
        ]));
    }

    /**
     * @OA\Get(
     *     path="/api/control/translations/create",
     *     summary="Create new translation",
     *     tags={"Translation"},
     *     security={
     *         {"ApiToken": {}},
     *         {"SanctumBearerToken": {}}
     *     },
     *     @OA\Response(
     *         response=200,
     *         description="Translation creation data retrieved successfully",
     *         @OA\JsonContent(type="object")
     *     )
     * )
     *
     * Create new translation.
     *
     * @return JsonResponse
     */
    public function create(): JsonResponse
    {
        return response()->json([
            'data' => [
                'input' => [
                    'key' => '',
                    'group' => '',
                    'translations' => $this->repo->create(),
                ],
                'groups' => TranslationGroupEnum::getList(),
            ]
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/control/translations/add",
     *     summary="Create new translation",
     *     tags={"Translation"},
     *     security={
     *         {"ApiToken": {}},
     *         {"SanctumBearerToken": {}}
     *     },
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/TranslationStoreRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Translation created successfully",
     *         @OA\JsonContent(type="object")
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Translation already exists",
     *         @OA\JsonContent(type="object")
     *     )
     * )
     *
     * Store a newly created translation.
     *
     * @param TranslationStoreRequest $request
     * @return JsonResponse
     */
    public function store(TranslationStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $validated['key'] = Str::snake($validated['key']);

        if ($this->repo->isExists($validated['group'], $validated['key'], array_column($validated['translations'], 'language_id'))) {
            return response()->json(GeneralResource::make([
                'message' => LangService::instance()
                    ->setDefault('This translation is exits!')
                    ->getLang('translation_is_exits'),
                'key' => $validated['key'],
            ]), 400);
        }

        $this->repo->store($validated);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('admin_form_saved_successfully'),
        ]));
    }

    /**
     * @OA\Delete(
     *     path="/api/control/translations/delete/{group}/{key}",
     *     summary="Delete translation",
     *     tags={"Translation"},
     *     security={
     *         {"ApiToken": {}},
     *         {"SanctumBearerToken": {}}
     *     },
     *     @OA\Parameter(
     *         name="group",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="key",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Translation deleted successfully",
     *         @OA\JsonContent(type="object")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Translation not found",
     *         @OA\JsonContent(type="object")
     *     )
     * )
     *
     * Delete translation.
     *
     * @param string $group
     * @param string $key
     * @return JsonResponse
     */
    public function destroy(string $group, string $key): JsonResponse
    {
        $translations = $this->repo->getByKey($group, $key);

        if (count($translations) === 0) {
            return response()->json(GeneralResource::make([
                'message' => 'Translations not found!',
            ]), 404);
        }

        $this->repo->destroy($translations);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Deleted successfully!')
                ->getLang('admin_deleted_successfully'),
        ]));
    }
}
