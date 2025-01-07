<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="GeneralListRequest",
 *     type="object",
 *     title="General List Request",
 *     description="Request parameters for listing resources",
 *     @OA\Property(property="sort", type="string", description="Field to sort by"),
 *     @OA\Property(property="sort_type", type="string", enum={"asc", "desc"}, description="Sort direction"),
 *     @OA\Property(property="limit", type="integer", minimum=5, maximum=100, description="Number of items per page"),
 *     @OA\Property(property="search", type="string", maxLength=100, description="Search term")
 * )
 */
class GeneralListRequest extends FormRequest
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
            'sort' => ['filled', 'string'],
            'sort_type' => ['filled', 'string', 'in:asc,desc'],
            'limit' => ['filled', 'integer', 'min:5', 'max:100'],
            'search' => ['nullable', 'string', 'max:100'],
        ];
    }
}
