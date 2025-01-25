<?php

namespace App\Http\Requests\Admin\QuestionGroups;

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="QuestionGroupAssignRequest",
 *     type="object",
 *     title="Question Group Assign Request",
 *     description="Request body for assigning departments and users to a question group.",
 *     @OA\Property(
 *         property="departments",
 *         type="array",
 *         @OA\Items(
 *             type="integer",
 *             description="ID of the department",
 *             example=1
 *         ),
 *         description="List of department IDs"
 *     ),
 *     @OA\Property(
 *         property="users",
 *         type="array",
 *         @OA\Items(
 *             type="integer",
 *             description="ID of the user",
 *             example=1
 *         ),
 *         description="List of user IDs"
 *     )
 * )
 */
class QuestionGroupAssignRequest extends FormRequest
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
            'departments' => ['filled', 'array'],
            'departments.*' => ['required', 'integer', 'distinct', Rule::exists(Department::class, 'id')->where('is_active', true)->whereNull('deleted_at')],
            'users' => ['filled', 'array'],
            'users.*' => ['required', 'integer', 'distinct', Rule::exists(User::class, 'id')->whereNull('deleted_at')],
        ];
    }
}
