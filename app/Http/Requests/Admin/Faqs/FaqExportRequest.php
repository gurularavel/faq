<?php

namespace App\Http\Requests\Admin\Faqs;

use Illuminate\Foundation\Http\FormRequest;

/**
 * @OA\Schema(
 *     schema="FaqExportRequest",
 *     type="object",
 *     title="FAQ Export Request",
 *     description="Request schema for exporting FAQs with optional category filter",
 *     @OA\Property(
 *         property="category",
 *         type="integer",
 *         description="ID of the category",
 *         example=1
 *     )
 * )
 */
class FaqExportRequest extends FormRequest
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
            'category' => ['nullable', 'integer'],
        ];
    }
}
