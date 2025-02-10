<?php

namespace App\Http\Resources\App\Exams;

use App\Models\Exam;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="ExamQuestionsListResource",
 *     type="object",
 *     title="Questions List Resource",
 *     description="Questions List Resource",
 *     @OA\Property(property="uuid", type="string", description="UUID of the question"),
 *     @OA\Property(property="title", type="string", description="Title of the question"),
 *     @OA\Property(property="answers", type="array", @OA\Items(ref="#/components/schemas/ExamAnswersListResource"), description="List of answers")
 * )
 * @property mixed $uuid
 * @method getLang(string $string)
 */
class QuestionsListResource extends JsonResource
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
            'uuid' => $this->uuid,
            'timer_seconds' => Exam::QUESTION_TIME_SECONDS,
            'title' => $this->getLang('title'),
            'answers' => AnswersListResource::collection($this->whenLoaded('answers')),
        ];
    }
}
