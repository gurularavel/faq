<?php

namespace App\Http\Resources\Admin\Admins;

use App\Http\Resources\Admin\Roles\RolesListResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @property mixed $username
 * @property mixed $roles
 * @property mixed $created_at
 * @property mixed $id
 * @property mixed $email
 * @property mixed $name
 * @property mixed $surname
 * @property mixed $creatable
 *
 * @OA\Schema(
 *     schema="AdminsResource",
 *     type="object",
 *     title="Admins Resource",
 *     description="Admins resource representation",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="username", type="string", example="admin"),
 *     @OA\Property(property="email", type="string", example="admin@example.com"),
 *     @OA\Property(property="name", type="string", example="John"),
 *     @OA\Property(property="surname", type="string", example="Doe"),
 *     @OA\Property(property="roles", type="array", @OA\Items(ref="#/components/schemas/RolesListResource")),
 *     @OA\Property(property="created_user", type="string", example="creator"),
 *     @OA\Property(property="created_date", type="string", format="date-time", example="2023-10-01T12:00:00Z")
 * )
 */

class AdminsResource extends JsonResource
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
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'name' => $this->name,
            'surname' => $this->surname,
            'roles' => RolesListResource::collection($this->roles),
            'created_user' => $this->creatable?->username,
            'created_date' => $this->created_at?->toDateTimeString(),
        ];
    }
}
