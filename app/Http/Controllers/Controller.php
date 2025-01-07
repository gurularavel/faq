<?php

namespace App\Http\Controllers;

use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *     title="FAQ API",
 *     version="1.0.0"
 * )
 *
 * @OA\SecurityScheme(
 *      securityScheme="ApiToken",
 *      type="apiKey",
 *      in="header",
 *      name="Token",
 *      description="ApiToken required for all end points",
 *  )
 *
 * @OA\SecurityScheme(
 *      securityScheme="SanctumBearerToken",
 *      type="http",
 *      scheme="bearer",
 *      description="Sanctum Bearer Token required after user logs in (Authorization: Bearer <token>)"
 *  )
 */
abstract class Controller
{
    //
}
