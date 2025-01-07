<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\Roles\RolesListResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return AnonymousResourceCollection
     */
    public function list(): AnonymousResourceCollection
    {
        return RolesListResource::collection(Role::query()->orderBy('name')->get());
    }
}
