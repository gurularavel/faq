<?php

namespace App\Http\Resources\App\Faqs;

use App\Http\Resources\App\Tags\TagsSearchResource;
use App\Services\SmartFuzzyHighlighterService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="FaqsSearchResource",
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
 *          @OA\Property(
 *          property="seen_count",
 *          type="integer",
 *          description="Seen count"
 *      ),
 *      @OA\Property(
 *          property="tags",
 *          type="array",
 *          @OA\Items(ref="#/components/schemas/TagsSearchResource"),
 *          description="Tags associated with the FAQ"
 *      )
 * )
 *
 * @property mixed $id
 * @property mixed $seen_count
 * @method getLang(string $string)
 */
class FaqsSearchResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array
     */

    public function toArray(Request $request): array
    {
        $search = $request->input('search');

        return [
            'id' => $this->id,
            'question' => SmartFuzzyHighlighterService::instance()->highlightSmart($this->getLang('question'), $search),
            'answer' => SmartFuzzyHighlighterService::instance()->highlightSmart($this->getLang('answer'), $search),
            'seen_count' => $this->seen_count,
            'tags' => TagsSearchResource::collection($this->whenLoaded('tags')),
        ];
    }
}
