<?php

namespace App\Http\Requests\Admin\Questions;

use App\Http\Requests\GeneralListRequest;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="QuestionsLoadRequest",
 *     type="object",
 *     title="Questions Load Request",
 *     description="Request parameters for loading Questions",
 *     @OA\Property(
 *         property="category",
 *         type="integer",
 *         description="ID of the category",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="status",
 *         type="integer",
 *         description="Status of the Question (1 - active, 2 - deactive)",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="search",
 *         type="string",
 *         description="Search term for Questions",
 *         example="example search term"
 *     ),
 *     @OA\Property(
 *         property="limit",
 *         type="integer",
 *         description="Number of Questions to load",
 *         example=10
 *     )
 * )
 */
class QuestionsLoadRequest extends GeneralListRequest
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
                'difficulty_level' => ['nullable', 'integer'],
                'status' => ['nullable', 'integer', 'in:1,2'], // 1 - active, 2 - deactive
            ];
    }
}
