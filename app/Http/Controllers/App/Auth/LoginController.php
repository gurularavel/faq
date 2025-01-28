<?php

namespace App\Http\Controllers\App\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\App\Auth\LoginRequest;
use App\Http\Resources\App\Auth\UserProfileResource;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use OpenApi\Annotations as OA;

class LoginController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/app/login",
     *     operationId="appLogin",
     *     tags={"AppAuthentication"},
     *     summary="Login for App",
     *     description="App Login API",
     *
     *     security={
     *           {
     *               "AppApiToken": {},
     *           }
     *      },
     *
     *     @OA\RequestBody(
     *         required=true,
     *         description="Credentials and device information",
     *         @OA\JsonContent(
     *             required={"device_type", "email", "password"},
     *             @OA\Property(
     *                 property="device_type",
     *                 type="string",
     *                 enum={"android", "ios", "web"},
     *                 description="Type of device requesting the token",
     *                 example="web"
     *             ),
     *             @OA\Property(
     *                 property="email",
     *                 type="string",
     *                 maxLength=150,
     *                 description="Email address",
     *                 example="elchinmammadov@eko.local"
     *             ),
     *             @OA\Property(
     *                 property="password",
     *                 type="string",
     *                 format="password",
     *                 minLength=8,
     *                 maxLength=100,
     *                 description="Account password",
     *                 example="Ee123456"
     *             )
     *         )
     *     ),
     *
     * @OA\Response(
     *          response=200,
     *          description="Successful login",
     *          @OA\JsonContent(ref="#/components/schemas/UserProfileResource")
     *      ),
     *
     * @OA\Response(
     *          response=401,
     *          description="Invalid credentials",
     *          @OA\JsonContent(
     *              @OA\Property(
     *                  property="message",
     *                  type="string",
     *                  example="Invalid username or password!"
     *              )
     *          )
     *      )
     * )
     */
    public function login(LoginRequest $request): UserProfileResource
    {
        $fields = $request->validated();

        return UserService::instance()->createToken(
            UserService::instance()->checkUser($fields),
            $fields['device_type']
        );
    }


    /**
     * @OA\Get(
     *     path="/api/app/profile/check-logged-in",
     *     operationId="appCheckLoggedIn",
     *     tags={"AppAuthentication"},
     *     summary="Check if user is logged in",
     *     description="Returns a simple 'LoggedIn' message if user is authenticated.",
     *
     *     security={
     *          {
     *              "AppApiToken": {},
     *              "AppSanctumBearerToken": {}
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
}
