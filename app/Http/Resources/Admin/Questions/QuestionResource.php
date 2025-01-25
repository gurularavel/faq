<?php

namespace App\Http\Resources\Admin\Questions;

use App\Http\Resources\Admin\Answers\AnswerResource;
use App\Http\Resources\Admin\DifficultyLevels\DifficultyLevelsListResource;
use App\Http\Resources\Admin\QuestionGroups\QuestionGroupsListResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="QuestionResource",
 *     type="object",
 *     title="Question Resource",
 *     description="Question Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID of the question"
 *     ),
 *     @OA\Property(
 *         property="question_group",
 *         ref="#/components/schemas/QuestionGroupsListResource",
 *         description="Question group of the question"
 *     ),
 *     @OA\Property(
 *         property="difficulty_levels",
 *         ref="#/components/schemas/DifficultyLevelsListResource",
 *         description="Difficulty level of the question"
 *     ),
 *     @OA\Property(
 *         property="translations",
 *         type="array",
 *         @OA\Items(
 *             type="object",
 *             @OA\Property(property="language_id", type="integer", description="ID of the language"),
 *             @OA\Property(property="title", type="string", description="Title of the question")
 *         ),
 *         description="Translations for the question"
 *     ),
 *     @OA\Property(
 *         property="answers",
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/AnswerResource"),
 *         description="Answers for the question"
 *     )
 * )
 *
 * @property mixed $id
 * @property mixed $translations
 */
class QuestionResource extends JsonResource
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
            'question_group' => QuestionGroupsListResource::make($this->whenLoaded('questionGroup')),
            'difficulty_levels' => DifficultyLevelsListResource::make($this->whenLoaded('difficultyLevel')),
            'translations' => $this->translations,
            'answers' => AnswerResource::collection($this->whenLoaded('answers')),
        ];
    }
}
