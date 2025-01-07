<?php

namespace App\Http\Requests\Admin\Translations;

use App\Enum\TranslationGroupEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="GetTranslationsRequest",
 *     type="object",
 *     title="Get Translations Request",
 *     description="Request parameters for getting translations",
 *     @OA\Property(property="group", type="string", enum={"all", "admin", "app"}, description="Translation group"),
 *     @OA\Property(property="keyword", type="string", maxLength=255, description="Keyword to search translations"),
 *     @OA\Property(property="text", type="string", maxLength=500, description="Text to search translations")
 * )
 */
class GetTranslationsRequest extends FormRequest
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
            'group' => ['nullable', 'string', new Enum(TranslationGroupEnum::class)],
            'keyword' => ['nullable', 'string', 'max:255'],
            'text' => ['nullable', 'string', 'max:500'],
        ];
    }
}
