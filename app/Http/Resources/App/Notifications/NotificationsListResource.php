<?php

namespace App\Http\Resources\App\Notifications;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *      schema="NotificationsListResource",
 *      type="object",
 *      @OA\Property(property="id", type="integer"),
 *      @OA\Property(property="title", type="string"),
 *      @OA\Property(property="message", type="string"),
 *      @OA\Property(property="type", type="string"),
 *      @OA\Property(property="model_id", type="integer"),
 *      @OA\Property(property="is_seen", type="boolean")
 *  )
 * @property mixed $id
 * @property mixed $type
 * @property mixed $typeable_id
 * @property mixed $reads_exists
 * @method getLang(string $string)
 */
class NotificationsListResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->getLang('title'),
            'message' => $this->getLang('message'),
            'type' => $this->type,
            'model_id' => $this->typeable_id,
            'is_seen' => $this->whenExistsLoaded('reads'),
        ];
    }
}
