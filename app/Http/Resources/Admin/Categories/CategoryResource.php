<?php

namespace App\Http\Resources\Admin\Categories;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="CategoryResource",
 *     type="object",
 *     title="Category Resource",
 *     description="Category Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="Category ID"
 *     ),
 *     @OA\Property(
 *         property="parent_id",
 *         type="integer",
 *         description="Parent Category ID"
 *     ),
 *     @OA\Property(
 *         property="translations",
 *         type="array",
 *         @OA\Items(type="object"),
 *         description="Translations"
 *     )
 * )
 *
 * @property mixed $id
 * @property mixed $translations
 * @property mixed $category_id
 * @property mixed $icon
 */
class CategoryResource extends JsonResource
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
            'parent_id' => $this->category_id,
            'translations' => $this->translations,
            'icon' => $this->whenLoaded('media', function () {
                return $this->icon;
            }),
        ];
    }
}
