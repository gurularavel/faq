<?php

namespace App\Http\Requests\Admin\DifficultyLevels;

use App\Services\LangService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="DifficultyLevelUpdateRequest",
 *     type="object",
 *     title="Difficulty Level Update Request",
 *     description="Request body for updating an existing difficulty level",
 *     required={"translations"},
 *     @OA\Property(
 *         property="translations",
 *         type="array",
 *         @OA\Items(
 *             type="object",
 *             required={"language_id", "title"},
 *             @OA\Property(property="language_id", type="integer", description="ID of the language", example=1),
 *             @OA\Property(property="title", type="string", description="Title of the difficulty level", example="Easy")
 *         ),
 *         description="Translations for the difficulty level"
 *     )
 * )
 */
class DifficultyLevelUpdateRequest extends FormRequest
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
            'translations.*.language_id' => ['required', 'integer', 'distinct', Rule::in(data_get(LangService::instance()->getLanguages(), '*.id'))],
            'translations.*.title' => ['required', 'max:100'],
        ];
    }
}
