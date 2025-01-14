<?php

namespace App\Http\Resources\Admin\Tags;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="TagResource",
 *     type="object",
 *     title="Tag Resource",
 *     description="Tag Resource",
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
 *     )
 * )
 *
 * @property mixed $id
 * @property mixed $title
 */
class TagResource extends JsonResource
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
        ];
    }
}
