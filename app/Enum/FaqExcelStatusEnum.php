<?php

namespace App\Enum;

use Illuminate\Support\Str;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="FaqExcelStatusEnum",
 *     type="string",
 *     title="Faq Excel Status Enum",
 *     description="Enumeration of Faq Excel Statuses",
 *     enum={"pending", "processing", "imported", "failed", "rollback"}
 * )
 */
enum FaqExcelStatusEnum: string
{
    case PENDING = 'pending';
    case PROCESSING = 'processing';
    case IMPORTED = 'imported';
    case FAILED = 'failed';
    case ROLLBACK = 'rollback';

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
