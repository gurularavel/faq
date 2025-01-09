<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\Roles\RolesListResource;
use App\Repositories\RoleRepository;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

class RoleController extends Controller
{
    private RoleRepository $repo;

    public function __construct(RoleRepository $repo)
    {
        $this->repo = $repo;
    }

    /**
     * @OA\Get(
     *     path="/api/control/roles/list",
     *     summary="Get list of roles",
     *     tags={"Role"},
     *     security={
     *         {"ApiToken": {}},
     *         {"SanctumBearerToken": {}}
     *     },
     *     @OA\Response(
     *         response=200,
     *         description="Roles list retrieved successfully",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/RolesListResource"))
     *     )
     * )
     *
     * Display a listing of the resource.
     *
     * @return AnonymousResourceCollection
     */
    public function list(): AnonymousResourceCollection
    {
        return RolesListResource::collection($this->repo->list());
    }
}
