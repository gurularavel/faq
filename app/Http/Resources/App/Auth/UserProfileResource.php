<?php

namespace App\Http\Resources\App\Auth;

use App\Http\Resources\Admin\Departments\DepartmentsListResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="UserProfileResource",
 *     type="object",
 *     title="User Profile Resource",
 *     description="User profile resource representation",
 *     @OA\Property(property="id", type="integer", description="User ID"),
 *     @OA\Property(property="email", type="string", description="User email"),
 *     @OA\Property(property="username", type="string", description="User username"),
 *     @OA\Property(property="is_expired", type="boolean", description="User account expiration status"),
 *            @OA\Property(
 *            property="last_login_date",
 *            type="string",
 *            format="date-time",
 *            description="Last Login Date"
 *        ),
 *     @OA\Property(property="name", type="string", description="User first name"),
 *     @OA\Property(property="surname", type="string", description="User last name"),
 *     @OA\Property(property="department", ref="#/components/schemas/DepartmentsListResource", description="User department details"),
 *     @OA\Property(property="token", type="string", description="User authentication token")
 * )
 * @property mixed $id
 * @property mixed $email
 * @property mixed $name
 * @property mixed $surname
 * @property mixed $token
 * @property mixed $samaccountname
 * @property mixed $accountexpires
 * @property mixed $last_login_at
 * @method isExpired()
 */
class UserProfileResource extends JsonResource
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
            'username' => $this->samaccountname,
            'is_expired' => $this->isExpired(),
            'last_login_date' => $this->last_login_at?->toDateTimeString(),
            'name' => $this->name,
            'surname' => $this->surname,
            'department' => DepartmentsListResource::make($this->whenLoaded('department')),
        ];
    }

    public function with($request): array
    {
        return [
            'token' => $this->token,
        ];
    }
}
