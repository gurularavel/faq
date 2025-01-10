<?php

namespace App\Http\Resources\Admin\Categories;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="CategoriesResource",
 *     type="object",
 *     title="Categories Resource",
 *     description="Categories Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="Category ID"
 *     ),
 *     @OA\Property(
 *         property="title",
 *         type="string",
 *         description="Category Title"
 *     ),
 *     @OA\Property(
 *         property="is_active",
 *         type="boolean",
 *         description="Is Active"
 *     ),
 *     @OA\Property(
 *         property="parent_id",
 *         type="integer",
 *         description="Parent Category ID"
 *     ),
 *     @OA\Property(
 *         property="parent",
 *         ref="#/components/schemas/CategoriesResource",
 *         description="Parent Category"
 *     ),
 *     @OA\Property(
 *         property="subs",
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/CategoriesResource"),
 *         description="Subcategories"
 *     ),
 *     @OA\Property(
 *         property="subs_count",
 *         type="integer",
 *         description="Subcategories Count"
 *     ),
 *     @OA\Property(
 *         property="created_user",
 *         type="string",
 *         description="Created User"
 *     ),
 *     @OA\Property(
 *         property="created_date",
 *         type="string",
 *         format="date-time",
 *         description="Created Date"
 *     )
 * )
 *
 * @property mixed $created_at
 * @property mixed $id
 * @property mixed $creatable
 * @property mixed $is_active
 * @property mixed $category_id
 * @method getLang(string $string)
 */
class CategoriesResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array
     */

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->getLang('title'),
            'is_active' => $this->is_active ?? true,
            'parent_id' => $this->category_id,
            'parent' => CategoriesResource::make($this->whenLoaded('parent')),
            'subs' => CategoriesResource::collection($this->whenLoaded('subs')),
            'subs_count' => $this->whenCounted('subs'),
            'created_user' => $this->whenLoaded('creatable', function () {
                return $this->creatable?->username;
            }),
            'created_date' => $this->created_at?->toDateTimeString(),
        ];
    }
}
