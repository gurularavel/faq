<?php

namespace App\Http\Resources\App\Tags;

use App\Services\SmartFuzzyHighlighterService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="TagsSearchResource",
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
class TagsSearchResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $search = $request->input('search');

        return [
            'id' => $this->id,
            'title' => SmartFuzzyHighlighterService::instance()->highlightSmart($this->title, $search),
        ];
    }
}
