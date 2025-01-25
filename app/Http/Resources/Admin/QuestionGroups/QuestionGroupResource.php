<?php

namespace App\Http\Resources\Admin\QuestionGroups;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="QuestionGroupResource",
 *     type="object",
 *     title="Question Group Resource",
 *     description="Question Group Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID of the question group"
 *     ),
 *     @OA\Property(
 *         property="translations",
 *         type="array",
 *         @OA\Items(
 *             type="object",
 *             @OA\Property(property="language_id", type="integer", description="ID of the language"),
 *             @OA\Property(property="title", type="string", description="Title of the question group")
 *         ),
 *         description="Translations for the question group"
 *     )
 * )
 *
 * @property mixed $id
 * @property mixed $translations
 */
class QuestionGroupResource extends JsonResource
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
            'translations' => $this->translations,
        ];
    }
}
