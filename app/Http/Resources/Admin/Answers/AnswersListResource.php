<?php

namespace App\Http\Resources\Admin\Answers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="AnswersListResource",
 *     type="object",
 *     title="Answers List Resource",
 *     description="Answers List Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID of the answer"
 *     ),
 *          @OA\Property(
 *          property="uuid",
 *          type="string",
 *          format="uuid",
 *          description="UUID of the answer"
 *      ),
 *     @OA\Property(
 *         property="title",
 *         type="string",
 *         description="Title of the answer"
 *     )
 * )
 *
 * @property mixed $id
 * @property mixed $uuid
 * @method getLang(string $string)
 */
class AnswersListResource extends JsonResource
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
            'uuid' => $this->uuid,
            'title' => $this->getLang('title'),
        ];
    }
}
