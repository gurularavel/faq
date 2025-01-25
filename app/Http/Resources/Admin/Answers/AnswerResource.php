<?php

namespace App\Http\Resources\Admin\Answers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="AnswerResource",
 *     type="object",
 *     title="Answer Resource",
 *     description="Answer Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID of the answer"
 *     ),
 *     @OA\Property(
 *         property="uuid",
 *         type="string",
 *         format="uuid",
 *         description="UUID of the answer"
 *     ),
 *     @OA\Property(
 *         property="is_correct",
 *         type="boolean",
 *         description="Indicates if the answer is correct"
 *     ),
 *     @OA\Property(
 *         property="translations",
 *         type="array",
 *         @OA\Items(
 *             type="object",
 *             @OA\Property(property="language_id", type="integer", description="ID of the language"),
 *             @OA\Property(property="title", type="string", description="Title of the answer")
 *         ),
 *         description="Translations for the answer"
 *     )
 * )
 *
 * @property mixed $id
 * @property mixed $translations
 * @property mixed $is_correct
 * @property mixed $uuid
 */
class AnswerResource extends JsonResource
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
            'uuid' => $this->uuid,
            'is_correct' => $this->is_correct,
            'translations' => $this->translations,
        ];
    }
}
