<?php

namespace App\Http\Resources\Admin\Faqs;

use App\Http\Resources\Admin\Categories\CategoriesListResource;
use App\Http\Resources\Admin\Tags\TagsListResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="FaqsListResource",
 *     type="object",
 *     title="FAQs List Resource",
 *     description="FAQs List Resource",
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
 *         property="answer",
 *         type="string",
 *         description="Answer text"
 *     ),
 *     @OA\Property(
 *         property="seen_count",
 *         type="integer",
 *         description="Number of times the FAQ has been viewed",
 *         example=42
 *     ),
 *     @OA\Property(
 *         property="tags",
 *         type="array",
 *         description="Tags associated with the FAQ",
 *         @OA\Items(ref="#/components/schemas/TagsListResource")
 *     ),
 *     @OA\Property(
 *         property="category",
 *         type="object",
 *         description="Category associated with the FAQ",
 *         ref="#/components/schemas/CategoriesListResource"
 *     )
 * )
 * @property mixed $id
 * @property mixed $seen_count
 * @method getLang(string $string)
 */
class FaqsListResource extends JsonResource
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
            'answer' => $this->getLang('answer'),
            'seen_count' => $this->seen_count,
            'tags' => TagsListResource::collection($this->whenLoaded('tags')),
            'category' => CategoriesListResource::make($this->whenLoaded('category')),
        ];
    }
}
