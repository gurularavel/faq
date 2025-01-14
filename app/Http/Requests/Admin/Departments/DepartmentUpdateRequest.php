<?php

namespace App\Http\Requests\Admin\Departments;

use App\Models\Department;
use App\Services\LangService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="DepartmentUpdateRequest",
 *     type="object",
 *     title="Department Update Request",
 *     description="Request parameters for updating a department",
 *     @OA\Property(
 *         property="parent_id",
 *         type="integer",
 *              nullable=true,
 *         description="Parent Department ID"
 *     ),
 *     @OA\Property(
 *         property="translations",
 *         type="array",
 *         @OA\Items(
 *             type="object",
 *             @OA\Property(
 *                 property="language_id",
 *                 type="integer",
 *                 description="Language ID"
 *             ),
 *             @OA\Property(
 *                 property="title",
 *                 type="string",
 *                 description="Department Title"
 *             )
 *         ),
 *         description="Translations"
 *     )
 * )
 */
class DepartmentUpdateRequest extends FormRequest
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
            'parent_id' => ['nullable', 'integer', Rule::exists(Department::class, 'id')->whereNull('department_id')->whereNull('deleted_at')],
            'translations' => ['required', 'array', 'size:' . count(LangService::instance()->getLanguages())],
            'translations.*.language_id' => ['required', 'integer', 'distinct', Rule::in(data_get(LangService::instance()->getLanguages(), '*.id'))],
            'translations.*.title' => ['required', 'max:300'],
        ];
    }
}
