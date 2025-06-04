<?php

namespace App\Http\Requests\Admin\Users;

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="UserUpdateRequest",
 *     type="object",
 *     title="User Update Request",
 *     description="Request parameters for updating a user",
 *     required={"email", "name", "surname", "department_id"},
 *     @OA\Property(property="email", type="string", maxLength=150, example="user@example.com"),
 *     @OA\Property(property="samaccountname", type="string", maxLength=150, example="john.doe"),
 *     @OA\Property(property="name", type="string", maxLength=255, example="John"),
 *     @OA\Property(property="surname", type="string", maxLength=255, example="Doe"),
 *     @OA\Property(property="department_id", type="integer", example=1)
 * )
 */
class UserUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'max:150', Rule::unique(User::class, 'email')->whereNull('deleted_at')->ignore($this->route('user'))],
            'samaccountname' => ['required', 'string', 'max:150', Rule::unique(User::class, 'samaccountname')->whereNull('deleted_at')->ignore($this->route('user'))],
            'name' => ['required', 'string', 'max:255'],
            'surname' => ['required', 'string', 'max:255'],
            'department_id' => ['required', 'integer', Rule::exists(Department::class, 'id')->where('is_active', true)->whereNotNull('department_id')->whereNull('deleted_at')],
        ];
    }
}
