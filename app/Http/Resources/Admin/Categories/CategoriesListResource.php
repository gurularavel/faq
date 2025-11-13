<?php

namespace App\Http\Resources\Admin\Categories;

use App\Http\Resources\Admin\Faqs\FaqsListResource;
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
 * @property mixed $icon
 * @property mixed $seen_count
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
            'icon' => $this->whenLoaded('media', function () {
                return $this->icon;
            }),
            'seen_count' => $this->seen_count,
            'subs' => CategoriesListResource::collection($this->whenLoaded('subs')),
            'parent' => CategoriesListResource::make($this->whenLoaded('parent')),
            'pinned_faq' => FaqsListResource::make($this->whenLoaded('pinnedFaq')),
        ];
    }
}
