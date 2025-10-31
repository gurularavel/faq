<?php

namespace App\Enum;

use Illuminate\Support\Str;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="FaqExportStatusEnum",
 *     type="string",
 *     title="Faq Export Status Enum",
 *     description="Enumeration of Faq Export Statuses",
 *     enum={"queued", "processing", "done", "failed"}
 * )
 */
enum FaqExportStatusEnum: string
{
    case QUEUED = 'queued';
    case PROCESSING = 'processing';
    case DONE = 'done';
    case FAILED = 'failed';

    public static function getList(): array
    {
        $array = [];

        foreach (self::cases() as $case) {
            $array[] = [
                'id' => $case,
                'title' => Str::title($case->value),
            ];
        }

        return $array;
    }
}
