<?php

namespace App\Http\Requests\Admin\Settings;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="SettingUpdateRequest",
 *     type="object",
 *     title="Setting Update Request",
 *     description="Request body for updating a setting",
 *     required={"value"},
 *     @OA\Property(property="value", type="string", maxLength=1000, example="Updated Value")
 * )
 */
class SettingUpdateRequest extends FormRequest
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
            'value' => ['required', 'string', 'max:1000'],
        ];
    }
}
