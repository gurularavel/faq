<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Settings\SettingStoreRequest;
use App\Http\Requests\Admin\Settings\SettingUpdateRequest;
use App\Http\Requests\GeneralListRequest;
use App\Http\Resources\Admin\Settings\SettingsListResource;
use App\Http\Resources\Admin\Settings\SettingsResource;
use App\Http\Resources\Admin\Settings\SettingResource;
use App\Http\Resources\GeneralResource;
use App\Models\Setting;
use App\Services\LangService;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SettingController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param GeneralListRequest $request
     * @return AnonymousResourceCollection
     */
    public function index(GeneralListRequest $request): AnonymousResourceCollection
    {
        $validated = $request->validated();

        $items = Setting::query()
            ->with([
                'creatable',
            ])
            ->orderBy('key')
            ->paginate($validated['limit'] ?? 10);

        return SettingsResource::collection($items);
    }

    public function list(): AnonymousResourceCollection
    {
        $items = Setting::query()
            ->orderBy('key')
            ->get();

        return SettingsListResource::collection($items);
    }

    public function show(string $key): SettingResource
    {
        $setting = Setting::query()->where('key', $key)->firstOrFail();

        return SettingResource::make($setting);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param SettingStoreRequest $request
     * @return JsonResponse
     */
    public function store(SettingStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $validated['key'] = Str::snake($validated['key']);

        if (Setting::query()->where('key', $validated['key'])->exists()) {
            return response()->json(GeneralResource::make([
                'message' => LangService::instance()
                    ->setDefault('This key is already in use! Key: @key')
                    ->getLang('setting_key_already_in_use', ['@key' => $validated['key']]),
                'key' => $validated['key'],
            ]), 400);
        }

        $setting = DB::transaction(static function () use ($validated) {
            $setting = Setting::query()->create($validated);

            SettingService::instance()->setCache();

            return $setting;
        });

        $setting->load([
            'creatable',
        ]);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('setting_form_saved_successfully'),
            'data' => SettingsResource::make($setting),
        ]));
    }

    public function update(SettingUpdateRequest $request, string $key): JsonResponse
    {
        $validated = $request->validated();

        $oldSetting = Setting::query()->where('key', $key)->firstOrFail();

        $validated['key'] = $key;

        $setting = DB::transaction(static function () use ($validated, $oldSetting) {
            $oldSetting->delete();

            $setting = Setting::query()->create($validated);

            SettingService::instance()->setCache();

            return $setting;
        });

        $setting->load([
            'creatable',
        ]);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('setting_form_saved_successfully'),
            'data' => SettingsResource::make($setting),
        ]));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param string $key
     * @return JsonResponse
     */
    public function destroy(string $key): JsonResponse
    {
        $setting = Setting::query()->where('key', $key)->firstOrFail();

        DB::transaction(static function () use ($setting) {
            $setting->delete();

            SettingService::instance()->setCache();
        });

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Deleted successfully!')
                ->getLang('setting_deleted_successfully'),
        ]));
    }
}
