<?php

namespace App\Http\Resources\Admin\FaqExcels;

use App\Services\LangService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="FaqExcelsResource",
 *     type="object",
 *     title="Faq Excels Resource",
 *     description="Faq Excels Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID of the FAQ Excel"
 *     ),
 *     @OA\Property(
 *         property="status",
 *         type="string",
 *         description="Status of the FAQ Excel"
 *     ),
 *     @OA\Property(
 *         property="file",
 *         type="string",
 *         description="File associated with the FAQ Excel"
 *     ),
 *     @OA\Property(
 *         property="messages",
 *         type="array",
 *         @OA\Items(type="string"),
 *         description="Messages related to the FAQ Excel"
 *     ),
 *     @OA\Property(
 *         property="categories_count",
 *         type="integer",
 *         description="Count of categories"
 *     ),
 *     @OA\Property(
 *         property="faqs_count",
 *         type="integer",
 *         description="Count of FAQs"
 *     ),
 *     @OA\Property(
 *         property="created_user",
 *         type="string",
 *         description="User who created the FAQ Excel"
 *     ),
 *     @OA\Property(
 *         property="created_date",
 *         type="string",
 *         format="date-time",
 *         description="Date when the FAQ Excel was created"
 *     )
 * )
 *
 * @property mixed $created_at
 * @property mixed $id
 * @property mixed $creatable
 * @property mixed $status
 * @property mixed $file
 * @property mixed $messages
 */
class FaqExcelsResource extends JsonResource
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
            'status' => LangService::instance()->setDefault(Str::title($this->status))->getLang($this->status),
            'file' => $this->file,
            'messages' => $this->messages ?? [],
            'categories_count' => $this->whenCounted('categories'),
            'faqs_count' => $this->whenCounted('faqs'),
            'created_user' => $this->whenLoaded('creatable', function () {
                return $this->creatable?->username;
            }),
            'created_date' => $this->created_at?->toDateTimeString(),
        ];
    }
}
