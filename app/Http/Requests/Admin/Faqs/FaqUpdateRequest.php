<?php

namespace App\Http\Requests\Admin\Faqs;

use App\Models\Category;
use App\Models\Tag;
use App\Services\LangService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="FaqUpdateRequest",
 *     type="object",
 *     title="FAQ Update Request",
 *     description="Request body for updating an existing FAQ",
 *     required={"category_id", "translations"},
 *     @OA\Property(
 *         property="category_id",
 *         type="integer",
 *         description="ID of the category",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="translations",
 *         type="array",
 *         @OA\Items(
 *             type="object",
 *             required={"language_id", "question", "answer"},
 *             @OA\Property(property="language_id", type="integer", description="ID of the language", example=1),
 *             @OA\Property(property="question", type="string", description="Question text", example="What is your name?"),
 *             @OA\Property(property="answer", type="string", description="Answer text", example="My name is John Doe.")
 *         ),
 *         description="Translations for the FAQ"
 *     ),
 *          @OA\Property(
 *          property="tags",
 *          type="array",
 *          @OA\Items(
 *              type="integer",
 *              description="ID of the tag",
 *              example=1
 *          ),
 *          description="Tags associated with the FAQ"
 *      )
 * )
 */
class FaqUpdateRequest extends FormRequest
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
            'category_id' => ['required', 'integer', Rule::exists(Category::class, 'id')->whereNotNull('category_id')->whereNull('deleted_at')],
            'translations' => ['required', 'array', 'size:' . count(LangService::instance()->getLanguages())],
            'translations.*.language_id' => ['required', 'integer', 'distinct', Rule::in(data_get(LangService::instance()->getLanguages(), '*.id'))],
            'translations.*.question' => ['required'],
            'translations.*.answer' => ['required'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['required', 'integer', Rule::exists(Tag::class, 'id')->where('is_active', true)->whereNull('deleted_at')],
        ];
    }
}
