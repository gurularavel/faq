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
use OpenApi\Annotations as OA;

class AdminController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/control/admins/load",
     *     summary="Get list of admins",
     *     tags={"Admin"},
     *     security={
     *            {
     *                "ApiToken": {},
     *                "SanctumBearerToken": {}
     *            }
     *       },
     *     @OA\Parameter(
     *         name="limit",
     *         in="query",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/AdminsResource"))
     *     )
     * )
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

    /**
     * @OA\Get(
     *     path="/api/control/admins/show/{id}",
     *     summary="Get admin by ID",
     *     tags={"Admin"},
     *          security={
     *            {
     *                "ApiToken": {},
     *                "SanctumBearerToken": {}
     *            }
     *       },
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/AdminResource")
     *     )
     * )
     */
    public function show(Admin $admin): AdminResource
    {
        return AdminResource::make($admin);
    }

    /**
     * @OA\Post(
     *     path="/api/control/admins/add",
     *     summary="Create a new admin",
     *     tags={"Admin"},
     *          security={
     *            {
     *                "ApiToken": {},
     *                "SanctumBearerToken": {}
     *            }
     *       },
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/AdminStoreRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Admin created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/AdminsResource")
     *     )
     * )
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

    /**
     * @OA\Post(
     *     path="/api/control/admins/update/{id}",
     *     summary="Update an existing admin",
     *     tags={"Admin"},
     *          security={
     *            {
     *                "ApiToken": {},
     *                "SanctumBearerToken": {}
     *            }
     *       },
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/AdminUpdateRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Admin updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/AdminsResource")
     *     )
     * )
     */
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
     * @OA\Delete(
     *     path="/api/control/admins/delete/{id}",
     *     summary="Delete an admin",
     *     tags={"Admin"},
     *          security={
     *            {
     *                "ApiToken": {},
     *                "SanctumBearerToken": {}
     *            }
     *       },
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Admin deleted successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
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
