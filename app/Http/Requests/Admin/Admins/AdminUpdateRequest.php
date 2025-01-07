<?php

namespace App\Http\Requests\Admin\Admins;

use App\Models\Admin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use OpenApi\Annotations as OA;
use Spatie\Permission\Models\Role;

/**
 * @OA\Schema(
 *     schema="AdminUpdateRequest",
 *     type="object",
 *     title="Admin Update Request",
 *     description="Request body for updating an existing admin",
 *     required={"username", "email", "roles"},
 *     @OA\Property(property="username", type="string", maxLength=100, example="admin"),
 *     @OA\Property(property="email", type="string", format="email", maxLength=150, example="admin@example.com"),
 *     @OA\Property(property="password", type="string", format="password", example="P@ssw0rd!"),
 *     @OA\Property(property="roles", type="array", @OA\Items(type="integer", example=1)),
 *     @OA\Property(property="name", type="string", maxLength=255, example="John"),
 *     @OA\Property(property="surname", type="string", maxLength=255, example="Doe")
 * )
 */

class AdminUpdateRequest extends FormRequest
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
            'username' => ['required', 'string', 'max:100', Rule::unique(Admin::class, 'username')->ignore($this->route('admin'))],
            'email' => ['required', 'string', 'email', 'max:150', Rule::unique(Admin::class, 'email')->ignore($this->route('admin'))],
            'password' => ['nullable', Password::min(8)->letters()->mixedCase()->numbers()->symbols()],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['required', 'integer', 'distinct', Rule::exists(Role::class, 'id')],
            'name' => ['nullable', 'string', 'max:255'],
            'surname' => ['nullable', 'string', 'max:255'],
        ];
    }
}
