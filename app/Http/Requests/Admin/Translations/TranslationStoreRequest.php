<?php

namespace App\Http\Requests\Admin\Translations;

use App\Rules\FirstTranslationRequired;
use App\Services\LangService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="TranslationStoreRequest",
 *     type="object",
 *     title="Translation Store Request",
 *     description="Request body for storing a new translation",
 *     required={"group", "key", "translations"},
 *     @OA\Property(property="group", type="string", maxLength=30, example="general"),
 *     @OA\Property(property="key", type="string", maxLength=255, example="welcome_message"),
 *     @OA\Property(
 *         property="translations",
 *         type="array",
 *         @OA\Items(
 *             type="object",
 *             required={"language_id", "text"},
 *             @OA\Property(property="language_id", type="integer", example=1),
 *             @OA\Property(property="text", type="string", example="Welcome")
 *         )
 *     )
 * )
 */
class TranslationStoreRequest extends FormRequest
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
            'group' => ['required', 'string', 'max:30'],
            'key' => ['required', 'string', 'max:255'],
            'translations' => ['required', 'array', 'size:' . count(LangService::instance()->getLanguages())],
            'translations.*.text' => [new FirstTranslationRequired('text')],
            'translations.*.language_id' => ['required', 'integer', 'distinct', Rule::in(data_get(LangService::instance()->getLanguages(), '*.id'))],
        ];
    }
}
