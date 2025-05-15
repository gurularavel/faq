<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Resources\App\Notifications\NotificationsListResource;
use App\Http\Resources\GeneralResource;
use App\Models\Notification;
use App\Services\LangService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
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

    /**
     * @OA\Post(
     *     path="/api/app/notifications/seen-bulk",
     *     summary="Mark all notifications as seen",
     *     tags={"Notifications"},
     *     security={
     *         {"AppApiToken": {}},
     *         {"AppSanctumBearerToken": {}}
     *     },
     *     @OA\Response(
     *         response=200,
     *         description="Notifications marked as seen",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="message",
     *                 type="string",
     *                 example="Notifications marked as seen!"
     *             )
     *         )
     *     )
     * )
     */
    public function setSeenBulk(): JsonResponse
    {
        NotificationService::instance()->setSeenBulk();

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Notifications marked as seen!')
                ->getLang('notifications_marked_as_seen'),
        ]));
    }
}
