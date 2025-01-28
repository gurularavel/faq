<?php

namespace App\Http\Controllers\App\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\GeneralResource;
use App\Services\UserService;
use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use OpenApi\Annotations as OA;

class LogoutController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/app/logout",
     *     operationId="appLogout",
     *     tags={"AppAuthentication"},
     *     summary="Logout from current device",
     *     description="Logs out the authenticated user from the current device.",
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
     *         description="Logged out from current device",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="code",
     *                 type="integer",
     *                 example=200
     *             ),
     *             @OA\Property(
     *                 property="message",
     *                 type="string",
     *                 example="Logged out from current device."
     *             )
     *         )
     *     )
     * )
     */
    public function logout(): JsonResponse
    {
        UserService::instance()->logout();

        return response()->json(GeneralResource::make([
            'code' => 200,
            'message' => LangService::instance()
                ->setDefault('Logged out from current device.')
                ->getLang('user_logged_out_from_current_device'),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/app/logout-all",
     *     operationId="appLogoutAll",
     *     tags={"AppAuthentication"},
     *     summary="Logout from all devices",
     *     description="Logs out the authenticated user from all devices.",
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
     *         description="Logged out from all devices",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="code",
     *                 type="integer",
     *                 example=200
     *             ),
     *             @OA\Property(
     *                 property="message",
     *                 type="string",
     *                 example="Logged out from all devices."
     *             )
     *         )
     *     )
     * )
     */
    public function logoutAll(): JsonResponse
    {
        UserService::instance()->logoutAll();

        return response()->json(GeneralResource::make([
            'code' => 200,
            'message' => LangService::instance()
                ->setDefault('Logged out from all devices.')
                ->getLang('user_logged_out_from_all_devices'),
        ]));
    }
}
