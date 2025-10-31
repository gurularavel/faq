<?php

namespace App\Http\Requests\App\Faqs;

use App\Models\Faq;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="FaqBulkSelectedAddToCategoryRequest",
 *     type="object",
 *     title="FAQ Bulk Add selected To category Request",
 *     description="Request body for adding multiple FAQs selected to a category",
 *     @OA\Property(
 *         property="faq_ids",
 *         type="array",
 *         description="Array of FAQ IDs",
 *         @OA\Items(type="integer", example=1)
 *     )
 * )
 */
class FaqBulkSelectedAddToCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
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
            'faq_ids' => ['required', 'array', 'min:1'],
            'faq_ids.*' => ['required', 'integer', Rule::exists(Faq::class, 'id')->whereNull('deleted_at')],
        ];
    }
}
