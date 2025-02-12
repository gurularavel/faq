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
 *     schema="FaqAddToListRequest",
 *     type="object",
 *     title="FAQ Add To List Request",
 *     description="Request body for adding FAQ to a list",
 *     @OA\Property(
 *         property="faq_id",
 *         type="integer",
 *         description="ID of the FAQ",
 *         example=1
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
class FaqAddToListRequest extends FormRequest
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
            'list_type' => ['required', 'string', new Enum(FaqListTypeEnum::class)],
        ];
    }
}
