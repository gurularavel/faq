<?php

namespace App\Enum;

use Illuminate\Support\Str;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="TranslationGroupEnum",
 *     type="string",
 *     title="Translation Group Enum",
 *     description="Enumeration of translation groups",
 *     enum={"all", "admin", "app"}
 * )
 */
enum TranslationGroupEnum: string
{
    case ALL = 'all';
    case ADMIN = 'admin';
    case APP = 'app';

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
