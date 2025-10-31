<?php

namespace App\Http\Resources\Admin\FaqExports;

use App\Enum\FaqExportStatusEnum;
use App\Http\Resources\Admin\Languages\LanguagesListResource;
use App\Services\LangService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="FaqExportsResource",
 *     type="object",
 *     title="Faq Excels Resource",
 *     description="Faq Excels Resource",
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         description="ID of the FAQ Excel"
 *     ),
 *          @OA\Property(
 *          property="status_key",
 *          type="string",
 *          description="Status key of the FAQ Excel"
 *      ),
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
class FaqExportsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array
     */
    public function toArray(Request $request): array
    {
//        $downloadUrl = null;
//
//        if ($this->status === FaqExportStatusEnum::DONE->value) {
//            $downloadUrl = URL::temporarySignedRoute(
//                'faq-exports.download',
//                now()->addMinutes(15),
//                ['export' => $this->id]
//            );
//        }
//
//        return [
//            'id' => $this->id,
//            'status_key' => $this->status,
//            'status' => LangService::instance()->setDefault(Str::title($this->status))->getLang('faq_exports_status_' . $this->status),
//            'messages' => $this->messages ?? [],
//            'file_download_url' => $downloadUrl,
//            'created_user' => $this->whenLoaded('creatable', function () {
//                return $this->creatable?->username;
//            }),
//            'created_date' => $this->created_at?->toDateTimeString(),
//        ];

        $file = null;

        if ($this->status === FaqExportStatusEnum::DONE->value) {
            $file = $this->whenLoaded('media', function () {
                return $this->file;
            }, null);
        }

        return [
            'id' => $this->id,
            'status_key' => $this->status,
            'status' => LangService::instance()->setDefault(Str::title($this->status))->getLang('faq_exports_status_' . $this->status),
            'messages' => $this->messages ?? [],
            'file' => $file,
            'language' => LanguagesListResource::make($this->whenLoaded('language')),
            'created_user' => $this->whenLoaded('creatable', function () {
                return $this->creatable?->username;
            }),
            'created_date' => $this->created_at?->toDateTimeString(),
        ];
    }
}
