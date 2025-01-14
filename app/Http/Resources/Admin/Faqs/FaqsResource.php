<?php

namespace App\Http\Resources\Admin\Faqs;

use App\Http\Resources\Admin\Categories\CategoriesListResource;
use App\Http\Resources\Admin\Tags\TagsListResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="FaqsResource",
 *     type="object",
 *     title="FAQs Resource",
 *     description="FAQs Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID of the FAQ"
 *     ),
 *     @OA\Property(
 *         property="question",
 *         type="string",
 *         description="Question text"
 *     ),
 *     @OA\Property(
 *         property="is_active",
 *         type="boolean",
 *         description="Status of the FAQ"
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
 *         property="created_user",
 *         type="string",
 *         description="Username of the creator"
 *     ),
 *     @OA\Property(
 *         property="created_date",
 *         type="string",
 *         format="date-time",
 *         description="Creation date of the FAQ"
 *     )
 * )
 *
 * @property mixed $created_at
 * @property mixed $id
 * @property mixed $creatable
 * @property mixed $is_active
 * @method getLang(string $string)
 */
class FaqsResource extends JsonResource
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
            'question' => $this->getLang('question'),
            'is_active' => $this->is_active ?? true,
            'category' => CategoriesListResource::make($this->whenLoaded('category')),
            'tags' => TagsListResource::collection($this->whenLoaded('tags')),
            'created_user' => $this->whenLoaded('creatable', function () {
                return $this->creatable?->username;
            }),
            'created_date' => $this->created_at?->toDateTimeString(),
        ];
    }
}
