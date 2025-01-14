<?php

namespace App\Http\Resources\Admin\Departments;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="DepartmentResource",
 *     type="object",
 *     title="Department Resource",
 *     description="Department Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="Department ID"
 *     ),
 *     @OA\Property(
 *         property="parent_id",
 *         type="integer",
 *         description="Parent Department ID"
 *     ),
 *     @OA\Property(
 *         property="translations",
 *         type="array",
 *         @OA\Items(type="object"),
 *         description="Translations"
 *     )
 * )
 *
 * @property mixed $id
 * @property mixed $translations
 * @property mixed $department_id
 */
class DepartmentResource extends JsonResource
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
            'parent_id' => $this->department_id,
            'translations' => $this->translations,
        ];
    }
}
