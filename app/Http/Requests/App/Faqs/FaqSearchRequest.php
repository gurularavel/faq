<?php

namespace App\Http\Requests\App\Faqs;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="FaqSearchRequest",
 *     type="object",
 *     title="FAQ Search Request",
 *     description="Request body for searching FAQs",
 *     required={"search"},
 *     @OA\Property(property="search", type="string", description="Search term for FAQs"),
 *      @OA\Property(property="limit", type="integer", minimum=5, maximum=100, description="Number of items per page", example="10"),
 * )
 */
class FaqSearchRequest extends FormRequest
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
            'search' => ['required', 'string'],
            'limit' => ['filled', 'int', 'min:5', 'max:100'],
        ];
    }
}
