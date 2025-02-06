<?php

namespace App\Http\Requests\Admin\Users;

use App\Http\Requests\GeneralListRequest;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="UsersLoadRequest",
 *     type="object",
 *     title="Users Load Request",
 *     description="Request parameters for loading Users",
 *     @OA\Property(
 *         property="category",
 *         type="integer",
 *         description="ID of the category",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="status",
 *         type="integer",
 *         description="Status of the User (1 - active, 2 - deactive)",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="search",
 *         type="string",
 *         description="Search term for Users",
 *         example="example search term"
 *     ),
 *     @OA\Property(
 *         property="limit",
 *         type="integer",
 *         description="Number of Users to load",
 *         example=10
 *     )
 * )
 */
class UsersLoadRequest extends GeneralListRequest
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
                'category' => ['nullable', 'integer'],
                'status' => ['nullable', 'integer', 'in:1,2'], // 1 - active, 2 - deactive
            ];
    }
}
