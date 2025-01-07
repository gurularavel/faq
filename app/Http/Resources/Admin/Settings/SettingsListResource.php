<?php

namespace App\Http\Resources\Admin\Settings;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="SettingsListResource",
 *     type="object",
 *     title="Settings List Resource",
 *     description="Resource representation of a list of settings",
 *     @OA\Property(property="key", type="string", description="The key of the setting")
 * )
 *
 * @property mixed $key
 * @property mixed $value
 */
class SettingsListResource extends JsonResource
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
        ];
    }
}
