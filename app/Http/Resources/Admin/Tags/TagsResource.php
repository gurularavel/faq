<?php

namespace App\Http\Resources\Admin\Tags;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="TagsResource",
 *     type="object",
 *     title="Tags Resource",
 *     description="Tags Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID of the tag"
 *     ),
 *     @OA\Property(
 *         property="title",
 *         type="string",
 *         description="Title of the tag"
 *     ),
 *     @OA\Property(
 *         property="is_active",
 *         type="boolean",
 *         description="Is Active"
 *     ),
 *     @OA\Property(
 *         property="created_user",
 *         type="string",
 *         description="Created User"
 *     ),
 *     @OA\Property(
 *         property="created_date",
 *         type="string",
 *         format="date-time",
 *         description="Created Date"
 *     )
 * )
 *
 * @property mixed $created_at
 * @property mixed $id
 * @property mixed $creatable
 * @property mixed $is_active
 * @property mixed $title
 */
class TagsResource extends JsonResource
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
            'title' => $this->title,
            'is_active' => $this->is_active ?? true,
            'created_user' => $this->whenLoaded('creatable', function () {
                return $this->creatable?->username;
            }),
            'created_date' => $this->created_at?->toDateTimeString(),
        ];
    }
}
