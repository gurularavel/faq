<?php

namespace App\Http\Resources\Admin\Settings;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
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
