<?php

namespace App\Http\Resources\Admin\Users;

use App\Http\Resources\Admin\Departments\DepartmentsListResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="UserResource",
 *     type="object",
 *     title="User Resource",
 *     description="User Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID of the user"
 *     ),
 *     @OA\Property(
 *         property="email",
 *         type="string",
 *         description="Email of the user"
 *     ),
 *          @OA\Property(
 *          property="samaccountname",
 *          type="string",
 *          description="samaccountname of the user"
 *      ),
 *     @OA\Property(
 *         property="name",
 *         type="string",
 *         description="Name of the user"
 *     ),
 *     @OA\Property(
 *         property="surname",
 *         type="string",
 *         description="Surname of the user"
 *     ),
 *      @OA\Property(
 *          property="is_active",
 *          type="boolean",
 *          description="Is Active"
 *      ),
 *     @OA\Property(
 *         property="department",
 *         ref="#/components/schemas/DepartmentsListResource",
 *         description="Department of the user"
 *     )
 * )
 *
 * @property mixed $id
 * @property mixed $email
 * @property mixed $name
 * @property mixed $surname
 * @property mixed $creatable
 * @property mixed $created_at
 * @property mixed $is_active
 * @property mixed $samaccountname
 */
class UserResource extends JsonResource
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
            'email' => $this->email,
            'samaccountname' => $this->samaccountname,
            'name' => $this->name,
            'surname' => $this->surname,
            'is_active' => $this->is_active,
            'department' => DepartmentsListResource::make($this->whenLoaded('department')),
        ];
    }
}
