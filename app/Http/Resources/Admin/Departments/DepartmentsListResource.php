<?php

namespace App\Http\Resources\Admin\Departments;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="DepartmentsListResource",
 *     type="object",
 *     title="Departments List Resource",
 *     description="Departments List Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="Department ID"
 *     ),
 *     @OA\Property(
 *         property="title",
 *         type="string",
 *         description="Department Title"
 *     ),
 *     @OA\Property(
 *         property="subs",
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/DepartmentsListResource"),
 *         description="Subdepartments"
 *     ),
 *      @OA\Property(
 *          property="parent",
 *          ref="#/components/schemas/DepartmentsListResource",
 *          description="Parent Department"
 *      )
 * )
 *
 * @property mixed $id
 * @method getLang(string $string)
 */
class DepartmentsListResource extends JsonResource
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
            'subs' => DepartmentsListResource::collection($this->whenLoaded('subs')),
            'parent' => DepartmentsListResource::make($this->whenLoaded('parent')),
        ];
    }
}
