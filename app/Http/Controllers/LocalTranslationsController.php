<?php

namespace App\Http\Controllers;

use App\Http\Requests\Translations\SetDefaultTranslationRequest;
use App\Http\Resources\GeneralResource;
use App\Models\Language;
use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class LocalTranslationsController extends Controller
{
    public function getLanguages(): JsonResponse
    {
        return response()->json([
            'data' => LangService::instance()->getLanguages(),
            'versions' => json_decode(Storage::disk('public')->get('versions.json')),
        ]);
    }

    public function getTranslations(string $lang): JsonResponse
    {
        Language::query()->where('key', $lang)->firstOrFail();

        $version = 0;

        $versions_json = Storage::disk('public')->get('versions.json');
        if ($versions_json) {
            $versions = json_decode($versions_json, true);

            if (is_array($versions)) {
                $version = $versions['lang_version'] ?? 0;
            }
        }

        return response()->json([
            'data' => [
                'version' => $version,
                'translations' => LangService::instance()->setLanguage($lang)->getStaticTranslations(),
            ]
        ]);
    }

    public function setDefaultValue(SetDefaultTranslationRequest $request, string $group): JsonResponse
    {
        $validated = $request->validated();

        $default = LangService::instance()
            ->setGroup($group)
            ->setDefault($validated['text'])
            ->setDefaultTranslation($validated['keyword'], true);

        LangService::instance()->changeTranslationVersion();

        return response()->json(GeneralResource::make([
            'message' => 'OK',
            'default_value' => $default,
        ]));
    }
}
