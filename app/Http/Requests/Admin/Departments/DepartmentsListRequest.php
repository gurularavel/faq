<?php

namespace App\Http\Requests\Admin\Departments;

use App\Http\Requests\GeneralListRequest;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="DepartmentsListRequest",
 *     type="object",
 *     title="Departments List Request",
 *     description="Request parameters for listing departments",
 *     allOf={
 *         @OA\Schema(ref="#/components/schemas/GeneralListRequest"),
 *         @OA\Schema(
 *             @OA\Property(property="with_subs", type="string", enum={"yes", "no"}, description="Include subdepartments")
 *         )
 *     }
 * )
 */
class DepartmentsListRequest extends GeneralListRequest
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
        return parent::rules() + [
                'with_subs' => ['nullable', 'in:yes,no'],
            ];
    }
}
