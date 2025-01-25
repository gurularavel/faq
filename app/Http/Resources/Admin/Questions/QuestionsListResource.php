<?php

namespace App\Http\Resources\Admin\Questions;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="QuestionsListResource",
 *     type="object",
 *     title="Questions List Resource",
 *     description="Questions List Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID of the question"
 *     ),
 *     @OA\Property(
 *         property="title",
 *         type="string",
 *         description="Title of the question"
 *     )
 * )
 *
 * @property mixed $id
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
            'id' => $this->id,
            'title' => $this->getLang('title'),
        ];
    }
}
