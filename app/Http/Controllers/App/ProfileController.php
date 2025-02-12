<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\App\Profile\UpdateProfileRequest;
use App\Http\Resources\App\Auth\UserProfileResource;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use OpenApi\Annotations as OA;

class ProfileController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/app/profile/info",
     *     tags={"Profile"},
     *     summary="Get user profile information",
     *     description="Returns the profile information of the authenticated user",
     *               security={
     *            {
     *                "AppApiToken": {},
     *                "AppSanctumBearerToken": {}
     *            }
     *        },
     *     @OA\Response(
     *         response=200,
     *         description="Successful response",
     *         @OA\JsonContent(ref="#/components/schemas/UserProfileResource")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function getUserInfo(): UserProfileResource
    {
        return UserService::instance()->getProfile();
    }

    /**
     * @OA\Post(
     *     path="/api/app/profile/update",
     *     tags={"Profile"},
     *     summary="Update user profile",
     *     description="Updates the profile information of the authenticated user",
     *               security={
     *            {
     *                "AppApiToken": {},
     *                "AppSanctumBearerToken": {}
     *            }
     *        },
     *               @OA\RequestBody(
     *           required=true,
     *           content={
     *               @OA\MediaType(
     *                   mediaType="multipart/form-data",
     *                   @OA\Schema(ref="#/components/schemas/UpdateProfileRequest")
     *               )
     *           }
     *       ),
     *     @OA\Response(
     *         response=200,
     *         description="Profile updated successfully",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", ref="#/components/schemas/UserProfileResource"),
     *             @OA\Property(property="message", type="string", example="Profile updated successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        return UserService::instance()->updateProfile($request);
    }
}
