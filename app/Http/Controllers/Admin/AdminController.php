<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Admins\AdminStoreRequest;
use App\Http\Requests\Admin\Admins\AdminUpdateRequest;
use App\Http\Requests\GeneralListRequest;
use App\Http\Resources\Admin\Admins\AdminResource;
use App\Http\Resources\Admin\Admins\AdminsResource;
use App\Http\Resources\GeneralResource;
use App\Models\Admin;
use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param GeneralListRequest $request
     * @return AnonymousResourceCollection
     */
    public function index(GeneralListRequest $request): AnonymousResourceCollection
    {
        $data = $request->validated();

        $admins = Admin::query()
            ->with([
                'creatable',
                'roles',
            ])
            ->orderByDesc('id')
            ->paginate($data['limit'] ?? 10);

        return AdminsResource::collection($admins);
    }

    public function show(Admin $admin): AdminResource
    {
        return AdminResource::make($admin);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param AdminStoreRequest $request
     * @return JsonResponse
     */
    public function store(AdminStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $roles = $validated['roles'] ?? [];
        unset($validated['roles']);

        $admin = DB::transaction(static function () use ($validated, $roles) {
            $admin = Admin::query()->create($validated);

            $admin->roles()->sync($roles);

            return $admin;
        });

        $admin->load([
            'creatable',
            'roles',
        ]);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('admin_form_saved_successfully'),
            'data' => AdminsResource::make($admin),
        ]));
    }

    public function update(AdminUpdateRequest $request, Admin $admin): JsonResponse
    {
        $validated = $request->validated();

        $roles = $validated['roles'] ?? [];
        unset($validated['roles']);

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        DB::transaction(static function () use ($validated, $roles, $admin) {
            $admin->update($validated);

            $admin->roles()->sync($roles);
        });

        $admin->load([
            'creatable',
            'roles',
        ]);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('admin_form_saved_successfully'),
            'data' => AdminsResource::make($admin),
        ]));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param Admin $admin
     * @return JsonResponse
     */
    public function destroy(Admin $admin): JsonResponse
    {
        $admin->delete();

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Deleted successfully!')
                ->getLang('admin_deleted_successfully'),
        ]));
    }
}
