<?php

namespace App\Http\Resources\Admin\Faqs;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="FaqsReportTimeSeriesResource",
 *     type="object",
 *     @OA\Property(
 *         property="bucket",
 *         type="string",
 *         description="Time bucket label (e.g., date or period)",
 *         example="2024-06-01"
 *     ),
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
 *         description="Number of views in the bucket",
 *         example=42
 *     )
 * )
 *
 * @property mixed $id
 * @property mixed $text
 * @property mixed $views
 * @property mixed $bucket
 */
class FaqsReportTimeSeriesResource extends JsonResource
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
            'bucket' => $this->bucket,
            'id' => $this->id,
            'question' => $this->text,
            'views' => $this->views,
        ];
    }
}
