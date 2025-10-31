<?php

namespace App\Http\Requests\App\Faqs;

use App\Models\Faq;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="FaqAddSelectedToCategoryRequest",
 *     type="object",
 *     title="FAQ Add selected To category Request",
 *     description="Request body for adding FAQ selected to a category",
 *     @OA\Property(
 *         property="faq_id",
 *         type="integer",
 *         description="ID of the FAQ",
 *         example=1
 *     )
 * )
 */
class FaqAddSelectedToCategoryRequest extends FormRequest
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
            'faq_id' => ['required', 'integer', Rule::exists(Faq::class, 'id')->whereNull('deleted_at')],
        ];
    }
}
