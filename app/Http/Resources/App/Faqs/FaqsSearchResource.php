<?php

namespace App\Http\Resources\App\Faqs;

use App\Http\Resources\Admin\Categories\CategoriesListResource;
use App\Services\HtmlSafeHighlighterService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="FaqsSearchResource",
 *     type="object",
 *     title="FAQs List Resource",
 *     description="Resource representing a single FAQ item",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID of the FAQ",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="question",
 *         type="string",
 *         description="Question text",
 *         example="What is the return policy?"
 *     ),
 *     @OA\Property(
 *         property="answer",
 *         type="string",
 *         description="Answer text",
 *         example="You can return items within 30 days."
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
 *         @OA\Items(ref="#/components/schemas/TagsSearchResource")
 *     ),
 *     @OA\Property(
 *         property="score",
 *         type="number",
 *         format="float",
 *         description="Relevance score of the FAQ",
 *         example=0.95
 *     ),
 *          @OA\Property(
 *          property="category",
 *          type="object",
 *          description="Category associated with the FAQ",
 *          ref="#/components/schemas/CategoriesListResource"
 *      )
 * )
 *
 * @property mixed $id
 * @property mixed $seen_count
 * @property mixed $tags
 * @property mixed $score
 * @property mixed $question
 * @property mixed $answer
 * @property mixed $category
 * @property mixed $updated_at
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
        $search = $request->input('search', '');

        return [
            'id' => $this->id,
            'question' => HtmlSafeHighlighterService::instance()->highlight($this->question, $search),
            'answer'   => HtmlSafeHighlighterService::instance()->highlight($this->answer, $search),
            'seen_count' => $this->seen_count,
            'tags' => $this->tags,
            'score' => $this->score,
            'category' => $this->category,
            'updated_date' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
