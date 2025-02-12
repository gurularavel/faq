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
 *     @OA\Property(property="success_rate", type="integer", description="Success rate"),
 *     @OA\Property(property="point", type="integer", description="User point"),
 *     @OA\Property(property="total_time_spent_formatted", type="string", description="Total time spent formatted"),
 *     @OA\Property(property="total_time_spent_seconds", type="integer", description="Total time spent in seconds"),
 *     @OA\Property(property="user", ref="#/components/schemas/UserProfileResource", description="User profile resource"),
 *     @OA\Property(property="question_group", ref="#/components/schemas/QuestionsListResource", description="Question group resource")
 * )
 * @property mixed $start_date
 * @property mixed $end_date
 * @property mixed $id
 * @property mixed $questions_sum_point
 * @property mixed $questions
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
        $spentTimeFormatted = '';
        $totalTimeSpent = 0;

        if ($this->whenLoaded('questions')) {
            $firstSentDate = $this->questions?->min('sent_date');
            $lastAnsweredDate = $this->questions?->max('answered_at');

            if ($firstSentDate && $lastAnsweredDate) {
                $totalTimeSpent = $firstSentDate->diffInSeconds($lastAnsweredDate);
            }
            $minutes = floor($totalTimeSpent / 60);
            $seconds = $totalTimeSpent % 60;
            $spentTimeFormatted = sprintf('%02d:%02d', $minutes, $seconds);
        }

        $correctQuestionsCount = $this->correct_questions_count ?? 0;
        $totalQuestionsCount = $this->questions_count ?? 0;

        return [
            'id' => $this->id,
            'is_active' => !$this->isStarted(),
            'is_ended' => $this->isEnded(),
            'start_date' => $this->start_date?->toDateTimeString(),
            'end_date' => $this->end_date?->toDateTimeString(),
            'questions_count' => $this->whenCounted('questions'),
            'correct_questions_count' => $this->whenCounted('correct_questions'),
            'incorrect_questions_count' => $this->whenCounted('incorrect_questions'),
            'success_rate' => $totalQuestionsCount === 0 ? 0 : round(($correctQuestionsCount / $totalQuestionsCount) * 100),
            'point' => (int) ($this->questions_sum_point ?? 0),
            'total_time_spent_formatted' => $spentTimeFormatted,
            'total_time_spent_seconds' => $totalTimeSpent,
            'user' => UserProfileResource::make($this->whenLoaded('user')),
            'question_group' => QuestionsListResource::make($this->whenLoaded('questionGroup')),
        ];
    }
}
