<?php

namespace App\Http\Resources\Admin\Faqs;

use App\Http\Resources\Admin\Categories\CategoriesListResource;
use App\Http\Resources\Admin\Tags\TagsListResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="FaqResource",
 *     type="object",
 *     title="FAQ Resource",
 *     description="FAQ Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID of the FAQ"
 *     ),
 *     @OA\Property(
 *         property="category",
 *         ref="#/components/schemas/CategoriesListResource",
 *         description="Category of the FAQ"
 *     ),
 *     @OA\Property(
 *         property="tags",
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/TagsListResource"),
 *         description="Tags associated with the FAQ"
 *     ),
 *     @OA\Property(
 *         property="translations",
 *         type="array",
 *         @OA\Items(type="object"),
 *         description="Translations of the FAQ"
 *     )
 * )
 *
 * @property mixed $id
 * @property mixed $translations
 */
class FaqResource extends JsonResource
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
            'category' => CategoriesListResource::make($this->whenLoaded('category')),
            'tags' => TagsListResource::collection($this->whenLoaded('tags')),
            'translations' => $this->translations,
        ];
    }
}
