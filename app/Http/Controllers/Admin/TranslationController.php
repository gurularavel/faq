<?php

namespace App\Http\Controllers\Admin;

use App\Enum\TranslationGroupEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Translations\GetTranslationsRequest;
use App\Http\Requests\Admin\Translations\TranslationStoreRequest;
use App\Http\Requests\Admin\Translations\TranslationUpdateRequest;
use App\Http\Resources\GeneralResource;
use App\Models\Translation;
use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class TranslationController extends Controller
{
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

        $sql_arr = [];
        foreach ($languages as $language) {
            $sql_arr[] = 'MAX(CASE WHEN language_id = ' . $language['id'] . ' THEN text END) AS lang_' . $language['key'];
        }
        $sql = implode(', ', $sql_arr);

        $translations = Translation::query()
            ->when($validated['group'] ?? null, function ($query) use ($validated) {
                $query->where('group', $validated['group']);
            })
            ->when($validated['keyword'] ?? null, function ($query) use ($validated) {
                $query->where('key', 'like', '%' . $validated['keyword'] . '%');
            })
            ->when($validated['text'] ?? null, function ($query) use ($validated) {
                $query->where('text', 'like', '%' . $validated['text'] . '%');
            })
            ->groupBy(['group', 'key'])
            ->orderBy('key')
            ->orderBy('group')
            ->select([
                'group',
                'key',
                DB::raw($sql),
            ])
            ->get();

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
        $translations = Translation::query()
            ->leftJoin('languages', 'translations.language_id', '=', 'languages.id')
            ->where('translations.group', $group)
            ->where('translations.key', $key)
            ->select([
                'translations.language_id',
                'translations.group',
                'translations.key',
                'translations.text',
                'languages.title as language',
            ])
            ->get();

        if (count($translations) === 0) {
            return response()->json(GeneralResource::make([
                'message' => 'Translations not found!',
            ]), 404);
        }

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
        $translationsCount = Translation::query()
            ->where('group', $group)
            ->where('key', $key)
            ->select('id')
            ->count();

        if ($translationsCount === 0) {
            return response()->json(GeneralResource::make([
                'message' => 'Translations not found!',
            ]), 404);
        }

        $validated = $request->validated();
        $translations_data = $validated['translations'];

        DB::transaction(static function () use ($translations_data, $group, $key) {
            foreach ($translations_data as $translation) {
                if ($translation['group'] !== $group) {
                    DB::rollBack();
                    throw new BadRequestHttpException(
                        LangService::instance()
                            ->setDefault('Wrong translation group!')
                            ->getLang('wrong_translation_group')
                    );
                }

                if ($translation['key'] !== $key) {
                    DB::rollBack();
                    throw new BadRequestHttpException(
                        LangService::instance()
                            ->setDefault('Wrong key word!')
                            ->getLang('wrong_translation_key_word')
                    );
                }

                Translation::query()
                    ->where('group', $group)
                    ->where('key', $key)
                    ->where('language_id', $translation['language_id'])
                    ->update([
                        'text' => $translation['text'],
                    ]);

                LangService::instance()->setTranslationsCache($group, $translation['language_id'], false);
            }
        });

        LangService::instance()->changeTranslationVersion();

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
        $translations = [];

        $languages = LangService::instance()->getLanguages();
        $required = true;

        foreach ($languages as $language) {
            $translations[] = [
                'language_id' => $language['id'],
                'language' => $language['key'],
                'text' => '',
                'required' => $required
            ];

            if ($required) {
                $required = false;
            }
        }

        return response()->json([
            'data' => [
                'input' => [
                    'key' => '',
                    'group' => '',
                    'translations' => $translations,
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

        $default_text = $validated['translations'][0]['text'];
        $key = Str::slug($validated['key'], '_');

        $check_unique = Translation::query()
            ->where([
                'group' => $validated['group'],
                'key' => $key,
            ])
            ->whereIn('language_id', data_get($validated['translations'], '*.language_id'))
            ->exists();

        if ($check_unique) {
            return response()->json(GeneralResource::make([
                'message' => LangService::instance()
                    ->setDefault('This translation is exits!')
                    ->getLang('translation_is_exits'),
                'key' => $key,
            ]), 400);
        }

        DB::transaction(static function () use ($validated, $default_text, $key) {
            foreach ($validated['translations'] as $translation) {
                Translation::query()
                    ->create([
                        'group' => $validated['group'],
                        'language_id' => $translation['language_id'],
                        'key' => $key,
                        'text' => $translation['text'] ?? $default_text,
                    ]);

                LangService::instance()->setTranslationsCache($validated['group'], $translation['language_id'], false);
            }
        });

        LangService::instance()->changeTranslationVersion();

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
        $translations = Translation::query()
            ->where('group', $group)
            ->where('key', $key)
            ->get();

        if (count($translations) === 0) {
            return response()->json(GeneralResource::make([
                'message' => 'Translations not found!',
            ]), 404);
        }

        DB::transaction(static function () use ($translations) {
            foreach ($translations as $translation) {
                $group = $translation->group;
                $language_id = $translation->language_id;

                $translation->delete();

                LangService::instance()->setTranslationsCache($group, $language_id, false);
            }
        });

        LangService::instance()->changeTranslationVersion();

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Deleted successfully!')
                ->getLang('admin_deleted_successfully'),
        ]));
    }
}
