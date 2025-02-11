<?php

namespace App\Enum;

use Illuminate\Support\Str;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="FaqListTypeEnum",
 *     type="string",
 *     title="FAQ List Type Enum",
 *     description="Enumeration of FAQ List Types",
 *     enum={"search"}
 * )
 */
enum FaqListTypeEnum: string
{
    //case MESSAGE = 'message';
    case SEARCH = 'search';

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
