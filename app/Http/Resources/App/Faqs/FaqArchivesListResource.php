<?php

namespace App\Http\Resources\App\Faqs;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="FaqArchivesListResource",
 *     type="object",
 *     title="FAQs List Resource",
 *     description="FAQs List Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID of the FAQ"
 *     ),
 *     @OA\Property(
 *         property="old_question",
 *         type="string",
 *         description="Question text"
 *     ),
 *     @OA\Property(
 *         property="old_answer",
 *         type="string",
 *         description="Answer text"
 *     ),
 *          @OA\Property(
 *          property="new_question",
 *          type="string",
 *          description="Question text"
 *      ),
 *      @OA\Property(
 *          property="new_answer",
 *          type="string",
 *          description="Answer text"
 *      ),
 *          @OA\Property(
 *          property="diff_question",
 *          type="string",
 *          description="Question text"
 *      ),
 *      @OA\Property(
 *          property="diff_answer",
 *          type="string",
 *          description="Answer text"
 *      ),
 *     @OA\Property(
 *         property="updated_date",
 *         type="string",
 *         description="date",
 *         example="2024-01-01 12:00:00"
 *     )
 * )
 * @property mixed $id
 * @property mixed $created_at
 * @method getLang(string $string)
 */
class FaqArchivesListResource extends JsonResource
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
            'old_question' => $this->getLang('old_question'),
            'old_answer' => $this->getLang('old_answer'),
            'new_question' => $this->getLang('new_question'),
            'new_answer' => $this->getLang('new_answer'),
            'diff_question' => $this->getLang('diff_question'),
            'diff_answer' => $this->getLang('diff_answer'),
            'updated_date' => $this->created_at?->toDateTimeString(),
        ];
    }
}
