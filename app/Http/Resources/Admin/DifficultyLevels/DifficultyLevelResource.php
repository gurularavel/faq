<?php

namespace App\Http\Resources\Admin\DifficultyLevels;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="DifficultyLevelResource",
 *     type="object",
 *     title="Difficulty Level Resource",
 *     description="Difficulty Level Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID of the difficulty level"
 *     ),
 *     @OA\Property(
 *         property="translations",
 *         type="array",
 *         @OA\Items(
 *             type="object",
 *             @OA\Property(property="language_id", type="integer", description="ID of the language"),
 *             @OA\Property(property="title", type="string", description="Title of the difficulty level")
 *         ),
 *         description="Translations for the difficulty level"
 *     )
 * )
 *
 * @property mixed $translations
 * @property mixed $id
 */
class DifficultyLevelResource extends JsonResource
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
            'translations' => $this->translations,
        ];
    }
}
