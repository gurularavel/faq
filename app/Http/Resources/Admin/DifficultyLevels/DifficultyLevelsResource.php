<?php

namespace App\Http\Resources\Admin\DifficultyLevels;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="DifficultyLevelsResource",
 *     type="object",
 *     title="Difficulty Levels Resource",
 *     description="Difficulty Levels Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID of the difficulty level"
 *     ),
 *     @OA\Property(
 *         property="title",
 *         type="string",
 *         description="Title of the difficulty level"
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
 *         description="Creation date of the difficulty level"
 *     )
 * )
 *
 * @property mixed $created_at
 * @property mixed $id
 * @property mixed $creatable
 * @method getLang(string $string)
 */
class DifficultyLevelsResource extends JsonResource
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
            'created_user' => $this->whenLoaded('creatable', function () {
                return $this->creatable?->username;
            }),
            'created_date' => $this->created_at?->toDateTimeString(),
        ];
    }
}
