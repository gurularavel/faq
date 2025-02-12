<?php

namespace App\Http\Resources\App\Exams;

use App\Http\Resources\Admin\Questions\QuestionsListResource;
use App\Http\Resources\App\Auth\UserProfileResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="ExamsListResource",
 *     type="object",
 *     title="Exams List Resource",
 *     description="Exams List Resource",
 *     @OA\Property(property="id", type="integer", description="Exam ID"),
 *     @OA\Property(property="is_active", type="boolean", description="Is the exam active"),
 *     @OA\Property(property="is_ended", type="boolean", description="Is the exam ended"),
 *     @OA\Property(property="start_date", type="string", format="date-time", description="Start date of the exam"),
 *     @OA\Property(property="end_date", type="string", format="date-time", description="End date of the exam"),
 *     @OA\Property(property="questions_count", type="integer", description="Total number of questions"),
 *     @OA\Property(property="correct_questions_count", type="integer", description="Number of correct questions"),
 *     @OA\Property(property="incorrect_questions_count", type="integer", description="Number of incorrect questions"),
 *     @OA\Property(property="user", ref="#/components/schemas/UserProfileResource", description="User profile resource"),
 *     @OA\Property(property="question_group", ref="#/components/schemas/QuestionsListResource", description="Question group resource")
 * )
 * @property mixed $start_date
 * @property mixed $end_date
 * @property mixed $id
 * @method isStarted()
 * @method isEnded()
 */
class ExamsListResource extends JsonResource
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
            'is_active' => !$this->isStarted(),
            'is_ended' => $this->isEnded(),
            'start_date' => $this->start_date?->toDateTimeString(),
            'end_date' => $this->end_date?->toDateTimeString(),
            'questions_count' => $this->whenCounted('questions'),
            'correct_questions_count' => $this->whenCounted('correct_questions'),
            'incorrect_questions_count' => $this->whenCounted('incorrect_questions'),
            'user' => UserProfileResource::make($this->whenLoaded('user')),
            'question_group' => QuestionsListResource::make($this->whenLoaded('questionGroup')),
        ];
    }
}
