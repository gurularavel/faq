<?php

namespace App\Http\Requests\Admin\Settings;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="SettingStoreRequest",
 *     type="object",
 *     title="Setting Store Request",
 *     description="Request body for storing a new setting",
 *     required={"key", "value"},
 *     @OA\Property(property="key", type="string", maxLength=150, example="site_name"),
 *     @OA\Property(property="value", type="string", maxLength=1000, example="My Website")
 * )
 */
class SettingStoreRequest extends FormRequest
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
            'key' => ['required', 'string', 'max:150'],
            'value' => ['required', 'string', 'max:1000'],
        ];
    }
}
