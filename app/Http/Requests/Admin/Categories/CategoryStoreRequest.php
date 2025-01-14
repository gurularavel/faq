<?php

namespace App\Http\Requests\Admin\Categories;

use App\Models\Category;
use App\Rules\FirstTranslationRequired;
use App\Services\LangService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="CategoryStoreRequest",
 *     type="object",
 *     title="Category Store Request",
 *     description="Request parameters for storing a category",
 *     @OA\Property(
 *         property="parent_id",
 *         type="integer",
 *              nullable=true,
 *         description="Parent Category ID"
 *     ),
 *     @OA\Property(
 *         property="translations",
 *         type="array",
 *         @OA\Items(
 *             type="object",
 *             @OA\Property(
 *                 property="language_id",
 *                 type="integer",
 *                 description="Language ID"
 *             ),
 *             @OA\Property(
 *                 property="title",
 *                 type="string",
 *                 description="Category Title"
 *             ),
 *         ),
 *         description="Translations"
 *     )
 * )
 */
class CategoryStoreRequest extends FormRequest
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
            'parent_id' => ['nullable', 'integer', Rule::exists(Category::class, 'id')->whereNull('category_id')->whereNull('deleted_at')],
            'translations' => ['required', 'array', 'size:' . count(LangService::instance()->getLanguages())],
            'translations.*.language_id' => ['required', 'integer', 'distinct', Rule::in(data_get(LangService::instance()->getLanguages(), '*.id'))],
            'translations.*.title' => [new FirstTranslationRequired('title'), 'max:300'],
        ];
    }
}
