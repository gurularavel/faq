<?php

namespace App\Http\Resources\Admin\QuestionGroups;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="QuestionGroupsResource",
 *     type="object",
 *     title="Question Groups Resource",
 *     description="Question Groups Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID of the question group"
 *     ),
 *     @OA\Property(
 *         property="title",
 *         type="string",
 *         description="Title of the question group"
 *     ),
 *     @OA\Property(
 *         property="is_active",
 *         type="boolean",
 *         description="Status of the question group"
 *     ),
 *     @OA\Property(
 *         property="created_user",
 *         type="string",
 *         description="Username of the creator"
 *     ),
 *     @OA\Property(
 *         property="created_date",
 *         type="string",
 *         format="date-time",
 *         description="Creation date of the question group"
 *     )
 * )
 *
 * @property mixed $created_at
 * @property mixed $id
 * @property mixed $creatable
 * @property mixed $is_active
 * @method getLang(string $string)
 */
class QuestionGroupsResource extends JsonResource
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
            'is_active' => $this->is_active ?? true,
            'created_user' => $this->whenLoaded('creatable', function () {
                return $this->creatable?->username;
            }),
            'created_date' => $this->created_at?->toDateTimeString(),
        ];
    }
}
