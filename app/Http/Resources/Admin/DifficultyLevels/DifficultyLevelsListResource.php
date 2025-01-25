<?php

namespace App\Http\Resources\Admin\DifficultyLevels;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="DifficultyLevelsListResource",
 *     type="object",
 *     title="Difficulty Levels List Resource",
 *     description="Difficulty Levels List Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID of the difficulty level"
 *     ),
 *     @OA\Property(
 *         property="title",
 *         type="string",
 *         description="Title of the difficulty level"
 *     )
 * )
 *
 * @property mixed $id
 * @method getLang(string $string)
 */
class DifficultyLevelsListResource extends JsonResource
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
