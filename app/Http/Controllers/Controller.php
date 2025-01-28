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
 *      description="ApiToken required for all end points of control panel",
 *  )
 *
 * @OA\SecurityScheme(
 *      securityScheme="SanctumBearerToken",
 *      type="http",
 *      scheme="bearer",
 *      description="Sanctum Bearer Token required after user logs in (Authorization: Bearer <token>) for control panel",
 *  )
 *
 * @OA\SecurityScheme(
 *       securityScheme="AppApiToken",
 *       type="apiKey",
 *       in="header",
 *       name="Token",
 *       description="ApiToken required for all end points of app",
 *   )
 *
 * @OA\SecurityScheme(
 *       securityScheme="AppSanctumBearerToken",
 *       type="http",
 *       scheme="bearer",
 *       description="Sanctum Bearer Token required after user logs in (Authorization: Bearer <token>) for app",
 *   )
 */
abstract class Controller
{
    //
}
