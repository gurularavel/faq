<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Settings\SettingStoreRequest;
use App\Http\Requests\Admin\Settings\SettingUpdateRequest;
use App\Http\Requests\GeneralListRequest;
use App\Http\Resources\Admin\Settings\SettingResource;
use App\Http\Resources\Admin\Settings\SettingsListResource;
use App\Http\Resources\Admin\Settings\SettingsResource;
use App\Http\Resources\GeneralResource;
use App\Repositories\SettingRepository;
use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use OpenApi\Annotations as OA;

class SettingController extends Controller
{
    private SettingRepository $repo;

    public function __construct(SettingRepository $repo)
    {
        $this->repo = $repo;
    }

    /**
     * @OA\Get(
     *     path="/api/control/settings/load",
     *     summary="Display a listing of the resource",
     *          tags={"Settings"},
     *      security={
     *          {"ApiToken": {}},
     *          {"SanctumBearerToken": {}}
     *      },
     *     @OA\Parameter(
     *         name="limit",
     *         in="query",
     *         required=false,
     *         @OA\Schema(type="integer", minimum=5, maximum=100)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/SettingsResource"))
     *     )
     * )
     */
    public function index(GeneralListRequest $request): AnonymousResourceCollection
    {
        $validated = $request->validated();

        return SettingsResource::collection($this->repo->load($validated));
    }

    /**
     * @OA\Get(
     *     path="/api/control/settings/list",
     *     summary="List all settings",
     *          tags={"Settings"},
     *      security={
     *          {"ApiToken": {}},
     *          {"SanctumBearerToken": {}}
     *      },
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/SettingsListResource"))
     *     )
     * )
     */
    public function list(): AnonymousResourceCollection
    {
        return SettingsListResource::collection($this->repo->list());
    }

    /**
     * @OA\Get(
     *     path="/api/control/settings/show/{key}",
     *     summary="Show a specific setting",
     *          tags={"Settings"},
     *      security={
     *          {"ApiToken": {}},
     *          {"SanctumBearerToken": {}}
     *      },
     *     @OA\Parameter(
     *         name="key",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/SettingResource")
     *     )
     * )
     */
    public function show(string $key): SettingResource|JsonResponse
    {
        $setting = $this->repo->findByKey($key);

        if (!$setting) {
            return response()->json(GeneralResource::make([
                'message' => LangService::instance()
                    ->setDefault('This key not found! Key: @key')
                    ->getLang('setting_key_not_found', ['@key' => $key]),
                'key' => $key,
            ]), 404);
        }

        return SettingResource::make($setting);
    }

    /**
     * @OA\Post(
     *     path="/api/control/settings/add",
     *     summary="Store a newly created resource in storage",
     *          tags={"Settings"},
     *      security={
     *          {"ApiToken": {}},
     *          {"SanctumBearerToken": {}}
     *      },
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/SettingStoreRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Resource created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     * Store a newly created resource in storage.
     *
     * @param SettingStoreRequest $request
     * @return JsonResponse
     */
    public function store(SettingStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $validated['key'] = Str::snake($validated['key']);

        if ($this->repo->findByKey($validated['key'])) {
            return response()->json(GeneralResource::make([
                'message' => LangService::instance()
                    ->setDefault('This key is already in use! Key: @key')
                    ->getLang('setting_key_already_in_use', ['@key' => $validated['key']]),
                'key' => $validated['key'],
            ]), 400);
        }

        $setting = $this->repo->store($validated);

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
     * @OA\Post(
     *     path="/api/control/settings/update/{key}",
     *     summary="Update a specific setting",
     *          tags={"Settings"},
     *      security={
     *          {"ApiToken": {}},
     *          {"SanctumBearerToken": {}}
     *      },
     *     @OA\Parameter(
     *         name="key",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/SettingUpdateRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Resource updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     */
    public function update(SettingUpdateRequest $request, string $key): JsonResponse
    {
        $validated = $request->validated();

        $oldSetting = $this->repo->findByKey($key);

        if (!$oldSetting) {
            return response()->json(GeneralResource::make([
                'message' => LangService::instance()
                    ->setDefault('This key not found! Key: @key')
                    ->getLang('setting_key_not_found', ['@key' => $key]),
                'key' => $key,
            ]), 404);
        }

        $validated['key'] = $key;

        $setting = $this->repo->update($oldSetting, $validated);

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
     * @OA\Delete(
     *     path="/api/control/settings/delete/{key}",
     *     summary="Remove the specified resource from storage",
     *          tags={"Settings"},
     *      security={
     *          {"ApiToken": {}},
     *          {"SanctumBearerToken": {}}
     *      },
     *     @OA\Parameter(
     *         name="key",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Resource deleted successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     * Remove the specified resource from storage.
     *
     * @param string $key
     * @return JsonResponse
     */
    public function destroy(string $key): JsonResponse
    {
        $setting = $this->repo->findByKey($key);

        if (!$setting) {
            return response()->json(GeneralResource::make([
                'message' => LangService::instance()
                    ->setDefault('This key not found! Key: @key')
                    ->getLang('setting_key_not_found', ['@key' => $key]),
                'key' => $key,
            ]), 404);
        }

        $this->repo->destroy($setting);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Deleted successfully!')
                ->getLang('setting_deleted_successfully'),
        ]));
    }
}
