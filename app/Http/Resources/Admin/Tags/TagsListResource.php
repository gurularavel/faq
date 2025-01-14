<?php

namespace App\Http\Resources\Admin\Tags;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="TagsListResource",
 *     type="object",
 *     title="Tags List Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID of the tag"
 *     ),
 *     @OA\Property(
 *         property="title",
 *         type="string",
 *         description="Title of the tag"
 *     )
 * )
 *
 * @property mixed $title
 * @property mixed $id
 */
class TagsListResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
        ];
    }
}
