<?php

namespace App\Http\Resources\Admin\Users;

use App\Http\Resources\Admin\Departments\DepartmentsListResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="UsersResource",
 *     type="object",
 *     title="Users Resource",
 *     description="Users Resource",
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
 *       @OA\Property(
 *           property="last_login_date",
 *           type="string",
 *           format="date-time",
 *           description="Last Login Date"
 *       ),
 *          @OA\Property(
 *          property="score",
 *          type="integer",
 *          description="Total exam point score of the user"
 *      ),
 *      @OA\Property(
 *          property="is_active",
 *          type="boolean",
 *          description="Is Active"
 *      ),
 *     @OA\Property(
 *         property="department",
 *         ref="#/components/schemas/DepartmentsListResource",
 *         description="Department of the user"
 *     ),
 *      @OA\Property(
 *          property="created_user",
 *          type="string",
 *          description="Created User"
 *      ),
 *      @OA\Property(
 *          property="created_date",
 *          type="string",
 *          format="date-time",
 *          description="Created Date"
 *      )
 * )
 *
 * @property mixed $id
 * @property mixed $email
 * @property mixed $name
 * @property mixed $surname
 * @property mixed $creatable
 * @property mixed $created_at
 * @property mixed $is_active
 * @property mixed $questions_sum_point
 * @property mixed $last_login_at
 */
class UsersResource extends JsonResource
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
            'name' => $this->name,
            'surname' => $this->surname,
            'last_login_date' => $this->last_login_at?->toDateTimeString(),
            'score' => (int) ($this->questions_sum_point ?? 0),
            'is_active' => $this->is_active,
            'department' => DepartmentsListResource::make($this->whenLoaded('department')),
            'created_user' => $this->whenLoaded('creatable', function () {
                return $this->creatable?->username;
            }),
            'created_date' => $this->created_at?->toDateTimeString(),
        ];
    }
}
