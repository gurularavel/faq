<?php

namespace App\Http\Requests\Admin\Tags;

use App\Models\Tag;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="TagUpdateRequest",
 *     type="object",
 *     title="Tag Update Request",
 *     required={"title"},
 *     @OA\Property(
 *         property="title",
 *         type="string",
 *         description="Title of the tag",
 *         example="Test",
 *         maxLength=150
 *     )
 * )
 */
class TagUpdateRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:150', Rule::unique(Tag::class, 'title')->whereNull('deleted_at')->ignore($this->route('tag'))],
        ];
    }
}
