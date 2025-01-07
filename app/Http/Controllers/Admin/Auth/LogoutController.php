<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\GeneralResource;
use App\Services\AdminService;
use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use OpenApi\Annotations as OA;

class LogoutController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/control/logout",
     *     operationId="logout",
     *     tags={"Authentication"},
     *     summary="Logout from current device",
     *     description="Logs out the authenticated user from the current device.",
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
        AdminService::instance()->logout();

        return response()->json(GeneralResource::make([
            'code' => 200,
            'message' => LangService::instance()
                ->setDefault('Logged out from current device.')
                ->getLang('admin_logged_out_from_current_device'),
        ]));
    }

    /**
     * @OA\Post(
     *     path="/api/control/logout-all",
     *     operationId="logoutAll",
     *     tags={"Authentication"},
     *     summary="Logout from all devices",
     *     description="Logs out the authenticated user from all devices.",
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
        AdminService::instance()->logoutAll();

        return response()->json(GeneralResource::make([
            'code' => 200,
            'message' => LangService::instance()
                ->setDefault('Logged out from all devices.')
                ->getLang('admin_logged_out_from_all_devices'),
        ]));
    }
}
