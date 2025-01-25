<?php

namespace App\Http\Resources\Admin\Questions;

use App\Http\Resources\Admin\DifficultyLevels\DifficultyLevelsListResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="QuestionsResource",
 *     type="object",
 *     title="Questions Resource",
 *     description="Questions Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID of the question"
 *     ),
 *     @OA\Property(
 *         property="difficulty_levels",
 *         ref="#/components/schemas/DifficultyLevelsListResource",
 *         description="Difficulty level of the question"
 *     ),
 *     @OA\Property(
 *         property="title",
 *         type="string",
 *         description="Title of the question"
 *     ),
 *     @OA\Property(
 *         property="is_active",
 *         type="boolean",
 *         description="Indicates if the question is active"
 *     ),
 *     @OA\Property(
 *         property="answers_count",
 *         type="integer",
 *         description="Count of answers for the question"
 *     ),
 *     @OA\Property(
 *         property="created_user",
 *         type="string",
 *         description="Username of the user who created the question"
 *     ),
 *     @OA\Property(
 *         property="created_date",
 *         type="string",
 *         format="date-time",
 *         description="Date when the question was created"
 *     )
 * )
 *
 * @property mixed $created_at
 * @property mixed $id
 * @property mixed $creatable
 * @property mixed $is_active
 * @method getLang(string $string)
 */
class QuestionsResource extends JsonResource
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
            'difficulty_levels' => DifficultyLevelsListResource::make($this->whenLoaded('difficultyLevel')),
            'title' => $this->getLang('title'),
            'is_active' => $this->is_active ?? true,
            'answers_count' => $this->whenCounted('answers'),
            'created_user' => $this->whenLoaded('creatable', function () {
                return $this->creatable?->username;
            }),
            'created_date' => $this->created_at?->toDateTimeString(),
        ];
    }
}
