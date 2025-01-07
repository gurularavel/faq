<?php

namespace App\Http\Resources\Admin\Roles;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @property mixed $id
 * @property mixed $name
 * @property mixed $guard_name
 *
 * @OA\Schema(
 *     schema="RolesListResource",
 *     type="object",
 *     title="Roles List Resource",
 *     description="Roles list resource representation",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Admin"),
 *     @OA\Property(property="guard_name", type="string", example="web")
 * )
 */

class RolesListResource extends JsonResource
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
            'name' => $this->name,
            'guard_name' => $this->guard_name,
        ];
    }
}
