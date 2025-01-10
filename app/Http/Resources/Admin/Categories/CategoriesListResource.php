<?php

namespace App\Http\Resources\Admin\Categories;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="CategoriesListResource",
 *     type="object",
 *     title="Categories List Resource",
 *     description="Categories List Resource",
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
 *         property="subs",
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/CategoriesListResource"),
 *         description="Subcategories"
 *     )
 * )
 *
 * @property mixed $id
 * @method getLang(string $string)
 */
class CategoriesListResource extends JsonResource
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
            'subs' => CategoriesListResource::collection($this->whenLoaded('subs')),
        ];
    }
}
