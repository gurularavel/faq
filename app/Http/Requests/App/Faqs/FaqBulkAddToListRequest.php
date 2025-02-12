<?php

namespace App\Http\Requests\App\Faqs;

use App\Enum\FaqListTypeEnum;
use App\Models\Faq;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="FaqBulkAddToListRequest",
 *     type="object",
 *     title="FAQ Bulk Add To List Request",
 *     description="Request body for adding multiple FAQs to a list",
 *     @OA\Property(
 *         property="faq_ids",
 *         type="array",
 *         description="Array of FAQ IDs",
 *         @OA\Items(type="integer", example=1)
 *     ),
 *     @OA\Property(
 *         property="list_type",
 *         type="string",
 *         description="Type of the list",
 *         enum={"search"},
 *         example="search"
 *     )
 * )
 */
class FaqBulkAddToListRequest extends FormRequest
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
            'list_type' => ['required', 'string', new Enum(FaqListTypeEnum::class)],
        ];
    }
}
