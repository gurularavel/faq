<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Users\UserStoreRequest;
use App\Http\Requests\Admin\Users\UserUpdateRequest;
use App\Http\Requests\GeneralListRequest;
use App\Http\Resources\Admin\Users\UserResource;
use App\Http\Resources\Admin\Users\UsersListResource;
use App\Http\Resources\Admin\Users\UsersResource;
use App\Http\Resources\GeneralResource;
use App\Models\User;
use App\Repositories\UserRepository;
use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

class UserController extends Controller
{
    private UserRepository $repo;

    public function __construct(UserRepository $repo)
    {
        $this->repo = $repo;
    }

    /**
     * @OA\Get(
     *     path="/api/control/users/load",
     *     summary="Get list of users",
     *     tags={"User"},
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
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/UsersResource"))
     *     )
     * )
     */
    public function index(GeneralListRequest $request): AnonymousResourceCollection
    {
        return UsersResource::collection($this->repo->load($request->validated()));
    }

    /**
     * @OA\Get(
     *     path="/api/control/users/list",
     *     summary="Get list of roles",
     *     tags={"User"},
     *     security={
     *         {"ApiToken": {}},
     *         {"SanctumBearerToken": {}}
     *     },
     *     @OA\Response(
     *         response=200,
     *         description="Roles list retrieved successfully",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/UsersListResource"))
     *     )
     * )
     *
     * Display a listing of the resource.
     *
     * @return AnonymousResourceCollection
     */
    public function list(): AnonymousResourceCollection
    {
        return UsersListResource::collection($this->repo->list());
    }

    /**
     * @OA\Get(
     *     path="/api/control/users/show/{id}",
     *     summary="Get admin by ID",
     *     tags={"User"},
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
     *         @OA\JsonContent(ref="#/components/schemas/UserResource")
     *     )
     * )
     */

    public function show(User $user): UserResource
    {
        $this->repo->loadRelations($user);

        return UserResource::make($user);
    }

    /**
     * @OA\Post(
     *     path="/api/control/users/add",
     *     summary="Create a new user",
     *     tags={"User"},
     *          security={
     *            {
     *                "ApiToken": {},
     *                "SanctumBearerToken": {}
     *            }
     *       },
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/UserStoreRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="User created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/UsersResource")
     *     )
     * )
     */
    public function store(UserStoreRequest $request): JsonResponse
    {
        $user = $this->repo->store($request->validated());

        $this->repo->loadRelations($user);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('admin_form_saved_successfully'),
            'data' => UserResource::make($user),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/users/update/{id}",
     *     summary="Update an existing user",
     *     tags={"User"},
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
     *         @OA\JsonContent(ref="#/components/schemas/UserUpdateRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/UsersResource")
     *     )
     * )
     */

    public function update(UserUpdateRequest $request, User $user): JsonResponse
    {
        $updatedUser = $this->repo->update($user, $request->validated());

        $this->repo->loadRelations($updatedUser);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('admin_form_saved_successfully'),
            'data' => UserResource::make($updatedUser),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/users/change-active-status/{id}",
     *     summary="Change the active status of the specified resource",
     *               tags={"User"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="id",
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
    public function changeActiveStatus(User $user): JsonResponse
    {
        $this->repo->changeActiveStatus($user);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Status changed successfully!')
                ->getLang('admin_status_changed_successfully'),
        ]));
    }

    /**
     * @OA\Delete(
     *     path="/api/control/users/delete/{id}",
     *     summary="Delete an admin",
     *     tags={"User"},
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
    public function destroy(User $user): JsonResponse
    {
        $this->repo->destroy($user);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Deleted successfully!')
                ->getLang('admin_deleted_successfully'),
        ]));
    }
}
