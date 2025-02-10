<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Resources\App\Notifications\NotificationsListResource;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

class NotificationController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/app/notifications/list",
     *     summary="Get list of notifications",
     *     tags={"Notifications"},
     *          security={
     *           {
     *               "AppApiToken": {},
     *               "AppSanctumBearerToken": {}
     *           }
     *       },
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/NotificationsListResource"))
     *     )
     * )
     */
    public function list(): AnonymousResourceCollection
    {
        return NotificationsListResource::collection(NotificationService::instance()->getUserNotifications());
    }

    /**
     * @OA\Get(
     *     path="/api/app/notifications/{notification}/show",
     *     summary="Show a specific notification",
     *     tags={"Notifications"},
     *          security={
     *           {
     *               "AppApiToken": {},
     *               "AppSanctumBearerToken": {}
     *           }
     *       },
     *     @OA\Parameter(
     *         name="notification",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/NotificationsListResource")
     *     )
     * )
     */
    public function show(Notification $notification): NotificationsListResource
    {
        return NotificationsListResource::make(NotificationService::instance()->getNotification($notification));
    }
}
