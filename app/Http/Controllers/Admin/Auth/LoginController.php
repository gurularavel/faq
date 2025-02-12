<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Auth\ChangePasswordRequest;
use App\Http\Requests\Admin\Auth\LoginRequest;
use App\Http\Resources\Admin\Auth\UserResource;
use App\Http\Resources\GeneralResource;
use App\Services\AdminService;
use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use OpenApi\Annotations as OA;

class LoginController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/control/login",
     *     operationId="controlLogin",
     *     tags={"Authentication"},
     *     summary="Login for Control Panel",
     *     description="Control Panel Login API",
     *
     *     security={
     *           {
     *               "ApiToken": {},
     *           }
     *      },
     *
     *     @OA\RequestBody(
     *         required=true,
     *         description="Credentials and device information",
     *         @OA\JsonContent(
     *             required={"device_type", "username", "password"},
     *             @OA\Property(
     *                 property="device_type",
     *                 type="string",
     *                 enum={"android", "ios", "web"},
     *                 description="Type of device requesting the token",
     *                 example="web"
     *             ),
     *             @OA\Property(
     *                 property="username",
     *                 type="string",
     *                 maxLength=100,
     *                 description="Username or email address",
     *                 example="sahib@fermanli.net"
     *             ),
     *             @OA\Property(
     *                 property="password",
     *                 type="string",
     *                 format="password",
     *                 minLength=8,
     *                 maxLength=100,
     *                 description="Account password",
     *                 example="12345678"
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Successful login",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 description="User information",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="username", type="string", example="adminUser"),
     *                 @OA\Property(property="email", type="string", example="admin@example.com"),
     *                 @OA\Property(property="name", type="string", example="John"),
     *                 @OA\Property(property="surname", type="string", example="Doe"),
     *                 @OA\Property(
     *                     property="role_ids",
     *                     type="array",
     *                     @OA\Items(type="integer"),
     *                     description="List of role IDs",
     *                     example={1}
     *                 ),
     *                 @OA\Property(
     *                     property="roles",
     *                     type="array",
     *                     description="Detailed roles data",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="name", type="string", example="admin")
     *                     )
     *                 )
     *             ),
     *             @OA\Property(
     *                 property="token",
     *                 type="string",
     *                 description="Authentication token",
     *                 example="2|abcdefgh1234..."
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=401,
     *         description="Invalid credentials",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="message",
     *                 type="string",
     *                 example="Invalid username or password!"
     *             )
     *         )
     *     )
     * )
     */
    public function login(LoginRequest $request): UserResource
    {
        $fields = $request->validated();

        return AdminService::instance()->createToken(
            AdminService::instance()->checkUser($fields),
            $fields['device_type']
        );
    }


    /**
     * @OA\Get(
     *     path="/api/control/profile/check-logged-in",
     *     operationId="checkLoggedIn",
     *     tags={"Authentication"},
     *     summary="Check if user is logged in",
     *     description="Returns a simple 'LoggedIn' message if user is authenticated.",
     *
     *     security={
     *          {
     *              "ApiToken": {},
     *              "SanctumBearerToken": {}
     *          }
     *      },
     *
     *     @OA\Response(
     *         response=200,
     *         description="User is logged in",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="message",
     *                 type="string",
     *                 description="Status of the user",
     *                 example="LoggedIn"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function checkLoggedIn(): JsonResponse
    {
        return response()->json([
            'message' => 'LoggedIn',
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/control/profile/change-password",
     *     operationId="changePassword",
     *     tags={"Authentication"},
     *     summary="Change user password",
     *     description="Allows an authenticated user to change their password.",
     *
     *     security={
     *           {
     *               "ApiToken": {},
     *               "SanctumBearerToken": {}
     *           }
     *      },
     *          @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(ref="#/components/schemas/ChangePasswordRequest")
     *      ),
     *     @OA\Response(
     *         response=200,
     *         description="Password changed successfully",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="message",
     *                 type="string",
     *                 example="Your password has been changed! You are logged out of other devices."
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=400,
     *         description="Invalid request",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="message",
     *                 type="string",
     *                 example="Invalid request data"
     *             )
     *         )
     *     )
     * )
     */
    public function changePassword(ChangePasswordRequest $request): GeneralResource
    {
        AdminService::instance()->changePassword($request->validated());

        return GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Your password has been changed! You are logged out of other devices.')
                ->getLang('admin_password_changed'),
        ]);
    }
}
