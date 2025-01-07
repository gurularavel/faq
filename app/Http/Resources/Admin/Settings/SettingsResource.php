<?php

namespace App\Http\Resources\Admin\Settings;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="SettingsResource",
 *     type="object",
 *     title="Settings Resource",
 *     description="Resource representation of a setting",
 *     @OA\Property(property="key", type="string", description="The key of the setting"),
 *     @OA\Property(property="value", type="string", description="The value of the setting"),
 *     @OA\Property(property="created_user", type="string", description="The username of the user who created the setting"),
 *     @OA\Property(property="created_date", type="string", format="date-time", description="The date and time when the setting was created")
 * )
 *
 * @property mixed $created_at
 * @property mixed $creatable
 * @property mixed $key
 * @property mixed $value
 */
class SettingsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array
     */

    public function toArray(Request $request): array
    {
        return [
            'key' => $this->key,
            'value' => $this->value,
            'created_user' => $this->whenLoaded('creatable', function () {
                return $this->creatable?->username;
            }),
            'created_date' => $this->created_at?->toDateTimeString(),
        ];
    }
}
