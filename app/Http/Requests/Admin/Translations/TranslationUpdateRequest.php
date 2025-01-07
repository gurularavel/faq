<?php

namespace App\Http\Requests\Admin\Translations;

use App\Services\LangService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="TranslationUpdateRequest",
 *     type="object",
 *     title="Translation Update Request",
 *     description="Request body for updating a translation",
 *     required={"translations"},
 *     @OA\Property(
 *         property="translations",
 *         type="array",
 *         @OA\Items(
 *             type="object",
 *             required={"group", "key", "text", "language_id"},
 *             @OA\Property(property="group", type="string", maxLength=30, example="general"),
 *             @OA\Property(property="key", type="string", maxLength=255, example="welcome_message"),
 *             @OA\Property(property="text", type="string", example="Welcome"),
 *             @OA\Property(property="language_id", type="integer", example=1)
 *         )
 *     )
 * )
 */
class TranslationUpdateRequest extends FormRequest
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
            'translations' => ['required', 'array', 'size:' . count(LangService::instance()->getLanguages())],
            'translations.*.group' => ['required', 'string', 'max:30'],
            'translations.*.key' => ['required', 'string', 'max:255'],
            'translations.*.text' => ['required', 'string'],
            'translations.*.language_id' => ['required', 'integer', 'distinct', Rule::in(data_get(LangService::instance()->getLanguages(), '*.id'))],
        ];
    }
}
