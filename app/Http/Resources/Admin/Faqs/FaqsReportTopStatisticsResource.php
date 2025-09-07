<?php

namespace App\Http\Resources\Admin\Faqs;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="FaqsReportTopStatisticsResource",
 *     type="object",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="FAQ ID",
 *         example=123
 *     ),
 *     @OA\Property(
 *         property="question",
 *         type="string",
 *         description="FAQ question text",
 *         example="How do I reset my password?"
 *     ),
 *     @OA\Property(
 *         property="views",
 *         type="integer",
 *         description="Number of views",
 *         example=42
 *     )
 * )
 *
 * @property mixed $id
 * @property mixed $text
 * @property mixed $views
 */
class FaqsReportTopStatisticsResource extends JsonResource
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
            'question' => $this->text,
            'views' => $this->views,
        ];
    }
}
