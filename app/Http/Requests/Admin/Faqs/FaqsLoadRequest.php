<?php

namespace App\Http\Requests\Admin\Faqs;

use App\Http\Requests\GeneralListRequest;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="FaqsLoadRequest",
 *     type="object",
 *     title="FAQs Load Request",
 *     description="Request parameters for loading FAQs",
 *          @OA\Property(
 *          property="sort",
 *          type="string",
 *          description="Sort column for FAQs (id, seen_count)",
 *          example="id"
 *      ),
 *          @OA\Property(
 *          property="sort_type",
 *          type="string",
 *          description="Sort type for FAQs (desc, asc)",
 *          example="desc"
 *      ),
 *     @OA\Property(
 *         property="category",
 *         type="integer",
 *         description="ID of the category",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="status",
 *         type="integer",
 *         description="Status of the FAQ (1 - active, 2 - deactive)",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="search",
 *         type="string",
 *         description="Search term for FAQs",
 *         example="example search term"
 *     ),
 *     @OA\Property(
 *         property="limit",
 *         type="integer",
 *         description="Number of FAQs to load",
 *         example=10
 *     )
 * )
 */
class FaqsLoadRequest extends GeneralListRequest
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
        return parent::rules() + [
                'sort' => ['nullable', 'string', 'in:id,seen_count'],
                'sort_type' => ['nullable', 'string', 'in:asc,desc'],
                'category' => ['nullable', 'integer'],
                'status' => ['nullable', 'integer', 'in:1,2'], // 1 - active, 2 - deactive
            ];
    }
}
