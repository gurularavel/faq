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
 *     @OA\Property(property="id", type="integer", description="ID of the exam"),
 *     @OA\Property(property="is_active", type="boolean", description="Active status of the exam"),
 *     @OA\Property(property="start_date", type="string", format="date-time", description="Start date of the exam"),
 *     @OA\Property(property="end_date", type="string", format="date-time", description="End date of the exam"),
 *     @OA\Property(property="user", ref="#/components/schemas/UserProfileResource", description="User profile details"),
 *     @OA\Property(property="question_group", ref="#/components/schemas/QuestionsListResource", description="Question group details")
 * )
 * @property mixed $start_date
 * @property mixed $end_date
 * @property mixed $id
 * @method isStarted()
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
            'start_date' => $this->start_date?->toDateTimeString(),
            'end_date' => $this->end_date?->toDateTimeString(),
            'user' => UserProfileResource::make($this->whenLoaded('user')),
            'question_group' => QuestionsListResource::make($this->whenLoaded('questionGroup')),
        ];
    }
}
