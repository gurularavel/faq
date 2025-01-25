<?php

namespace App\Http\Resources\Admin\QuestionGroups;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="QuestionGroupsListResource",
 *     type="object",
 *     title="Question Groups List Resource",
 *     description="Question Groups List Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID of the question group"
 *     ),
 *     @OA\Property(
 *         property="title",
 *         type="string",
 *         description="Title of the question group"
 *     )
 * )
 *
 * @property mixed $id
 * @method getLang(string $string)
 */
class QuestionGroupsListResource extends JsonResource
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
