<?php

namespace App\Enum;

use Illuminate\Support\Str;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="NotificationTypeEnum",
 *     type="string",
 *     title="Notification Type Enum",
 *     description="Enumeration of Notification Types",
 *     enum={"exam"}
 * )
 */
enum NotificationTypeEnum: string
{
    //case MESSAGE = 'message';
    case EXAM = 'exam';

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
