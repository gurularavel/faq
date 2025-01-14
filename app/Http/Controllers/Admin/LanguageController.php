<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Admins\AdminStoreRequest;
use App\Http\Requests\Admin\Languages\LanguageStoreRequest;
use App\Http\Requests\GeneralListRequest;
use App\Http\Resources\Admin\Languages\LanguageResource;
use App\Http\Resources\Admin\Languages\LanguagesListResource;
use App\Http\Resources\Admin\Languages\LanguagesResource;
use App\Http\Resources\GeneralResource;
use App\Models\Language;
use App\Repositories\LanguageRepository;
use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

class LanguageController extends Controller
{
    private LanguageRepository $repo;

    public function __construct(LanguageRepository $repo)
    {
        $this->repo = $repo;
    }

    /**
     * @OA\Get(
     *     path="/api/control/languages/load",
     *     summary="Get list of languages",
     *     tags={"Language"},
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
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/LanguagesResource"))
     *     )
     * )
     */
    public function index(GeneralListRequest $request): AnonymousResourceCollection
    {
        return LanguagesResource::collection($this->repo->load($request->validated()));
    }

    /**
     * @OA\Get(
     *     path="/api/control/languages/list",
     *     summary="Get list of roles",
     *     tags={"Language"},
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
        return LanguagesListResource::collection($this->repo->list());
    }

    /**
     * @OA\Get(
     *     path="/api/control/languages/show/{id}",
     *     summary="Get admin by ID",
     *     tags={"Language"},
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
     *         @OA\JsonContent(ref="#/components/schemas/LanguageResource")
     *     )
     * )
     */
    public function show(Language $language): LanguageResource
    {
        return LanguageResource::make($language);
    }

    /**
     * @OA\Post(
     *     path="/api/control/languages/add",
     *     summary="Create a new language",
     *     tags={"Language"},
     *          security={
     *            {
     *                "ApiToken": {},
     *                "SanctumBearerToken": {}
     *            }
     *       },
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/LanguageStoreRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Language created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/LanguagesResource")
     *     )
     * )
     */
    public function store(LanguageStoreRequest $request): JsonResponse
    {
        $language = $this->repo->store($request->validated());

        $this->repo->loadRelations($language);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('admin_form_saved_successfully'),
            'data' => LanguageResource::make($language),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/languages/update/{id}",
     *     summary="Update an existing language",
     *     tags={"Language"},
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
     *         @OA\JsonContent(ref="#/components/schemas/LanguageStoreRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Language updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/LanguagesResource")
     *     )
     * )
     */
    public function update(LanguageStoreRequest $request, Language $language): JsonResponse
    {
        $updatedLanguage = $this->repo->update($language, $request->validated());

        $this->repo->loadRelations($updatedLanguage);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Saved successfully!')
                ->getLang('admin_form_saved_successfully'),
            'data' => LanguageResource::make($updatedLanguage),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/languages/change-active-status/{id}",
     *     summary="Change the active status of the specified resource",
     *               tags={"Language"},
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
    public function changeActiveStatus(Language $language): JsonResponse
    {
        $this->repo->changeActiveStatus($language);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Status changed successfully!')
                ->getLang('admin_status_changed_successfully'),
        ]));
    }

    /**
     * @OA\Delete(
     *     path="/api/control/languages/delete/{id}",
     *     summary="Delete an admin",
     *     tags={"Language"},
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
    public function destroy(Language $language): JsonResponse
    {
        $this->repo->destroy($language);

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Deleted successfully!')
                ->getLang('admin_deleted_successfully'),
        ]));
    }
}
