<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Departments\DepartmentsListRequest;
use App\Http\Requests\Admin\Departments\DepartmentStoreRequest;
use App\Http\Requests\Admin\Departments\DepartmentUpdateRequest;
use App\Http\Requests\GeneralListRequest;
use App\Http\Resources\Admin\Departments\DepartmentsListResource;
use App\Http\Resources\Admin\Departments\DepartmentsResource;
use App\Http\Resources\Admin\Departments\DepartmentResource;
use App\Http\Resources\GeneralResource;
use App\Models\Department;
use App\Repositories\DepartmentRepository;
use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

class DepartmentController extends Controller
{
    private DepartmentRepository $repo;

    public function __construct(DepartmentRepository $repo)
    {
        $this->repo = $repo;
    }

    /**
     * @OA\Get(
     *     path="/api/control/departments/load",
     *     summary="Display a listing of the resource",
     *          tags={"Department"},
     *      security={
     *             {
     *                 "ApiToken": {},
     *                 "SanctumBearerToken": {}
     *             }
     *        },
     *          @OA\Parameter(
     *          name="parameters",
     *          in="query",
     *          description="List request parameters",
     *          required=false,
     *          @OA\Schema(ref="#/components/schemas/DepartmentsListRequest")
     *      ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/DepartmentsResource"))
     *     )
     * )
     * Display a listing of the resource.
     *
     * @param DepartmentsListRequest $request
     * @return AnonymousResourceCollection
     */
    public function index(DepartmentsListRequest $request): AnonymousResourceCollection
    {
        return DepartmentsResource::collection($this->repo->load($request->validated()));
    }

    /**
     * @OA\Get(
     *     path="/api/control/departments/list",
     *     summary="List departments",
     *               tags={"Department"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *               @OA\Parameter(
     *           name="parameters",
     *           in="query",
     *           description="List request parameters",
     *           required=false,
     *           @OA\Schema(ref="#/components/schemas/DepartmentsListRequest")
     *       ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/DepartmentsListResource"))
     *     )
     * )
     */
    public function list(DepartmentsListRequest $request): AnonymousResourceCollection
    {
        return DepartmentsListResource::collection($this->repo->list($request->validated()));
    }

    /**
     * @OA\Get(
     *     path="/api/control/departments/subs/{department}",
     *     summary="Load subdepartments",
     *               tags={"Department"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="department",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *               @OA\Parameter(
     *           name="parameters",
     *           in="query",
     *           description="List request parameters",
     *           required=false,
     *           @OA\Schema(ref="#/components/schemas/GeneralListRequest")
     *       ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/DepartmentsResource"))
     *     )
     * )
     */
    public function loadSubs(GeneralListRequest $request, Department $department): AnonymousResourceCollection
    {
        return DepartmentsResource::collection($this->repo->loadSubs($department, $request->validated()));
    }

    /**
     * @OA\Get(
     *     path="/api/control/departments/show/{department}",
     *     summary="Show department",
     *               tags={"Department"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="department",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/DepartmentResource")
     *     )
     * )
     */
    public function show(Department $department): DepartmentResource
    {
        return DepartmentResource::make($department);
    }

    /**
     * @OA\Post(
     *     path="/api/control/departments/add",
     *     summary="Store a newly created resource in storage",
     *               tags={"Department"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/DepartmentStoreRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Resource created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     *
     * Store a newly created resource in storage.
     *
     * @param DepartmentStoreRequest $request
     * @return JsonResponse
     */
    public function store(DepartmentStoreRequest $request): JsonResponse
    {
        $department = $this->repo->store($request->validated());

        $this->repo->loadRelations($department);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('department_form_saved_successfully'),
            'data' => DepartmentsResource::make($department),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/departments/update/{department}",
     *     summary="Update the specified resource in storage",
     *               tags={"Department"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="department",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/DepartmentUpdateRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Resource updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     */
    public function update(DepartmentUpdateRequest $request, Department $department): JsonResponse
    {
        $department = $this->repo->update($department, $request->validated());

        $this->repo->loadRelations($department);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('department_form_saved_successfully'),
            'data' => DepartmentsResource::make($department),
        ]));
    }

    /**
     * @OA\Delete(
     *     path="/api/control/departments/delete/{department}",
     *     summary="Remove the specified resource from storage",
     *               tags={"Department"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="department",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Resource deleted successfully",
     *         @OA\JsonContent(ref="#/components/schemas/GeneralResource")
     *     )
     * )
     *
     * Remove the specified resource from storage.
     *
     * @param Department $department
     * @return JsonResponse
     */
    public function destroy(Department $department): JsonResponse
    {
        $this->repo->destroy($department);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Deleted successfully!')
                ->getLang('department_deleted_successfully'),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/departments/change-active-status/{department}",
     *     summary="Change the active status of the specified resource",
     *               tags={"Department"},
     *       security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *     @OA\Parameter(
     *         name="department",
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
    public function changeActiveStatus(Department $department): JsonResponse
    {
        $this->repo->changeActiveStatus($department);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Status changed successfully!')
                ->getLang('admin_status_changed_successfully'),
        ]));
    }
}
