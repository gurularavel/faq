<?php

namespace App\Http\Resources\App\Exams;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="ExamAnswersListResource",
 *     type="object",
 *     title="Answers List Resource",
 *     description="Answers List Resource",
 *     @OA\Property(property="uuid", type="string", description="UUID of the answer"),
 *     @OA\Property(property="title", type="string", description="Title of the answer")
 * )
 * @method getLang(string $string)
 * @property mixed $uuid
 */
class AnswersListResource extends JsonResource
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
            'title' => $this->getLang('title'),
        ];
    }
}
