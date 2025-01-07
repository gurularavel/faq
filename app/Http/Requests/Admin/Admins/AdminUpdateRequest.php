<?php

namespace App\Http\Requests\Admin\Admins;

use App\Models\Admin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

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
