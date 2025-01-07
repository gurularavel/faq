<?php

namespace App\Http\Resources\Admin\Settings;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="SettingResource",
 *     type="object",
 *     title="Setting Resource",
 *     description="Resource representation of a setting",
 *     @OA\Property(property="key", type="string", description="The key of the setting"),
 *     @OA\Property(property="value", type="string", description="The value of the setting")
 * )
 *
 * @property mixed $key
 * @property mixed $value
 */
class SettingResource extends JsonResource
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
        ];
    }
}
