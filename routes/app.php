<?php

use App\Http\Controllers\LocalTranslationsController;
use App\Http\Middleware\RouteLogMiddleware;
use Illuminate\Support\Facades\Route;

Route::middleware(['general_access:app', RouteLogMiddleware::class])->prefix('app')->group(static function () {
    Route::group(['prefix' => 'local-translations'], static function () {
        Route::get('languages/list', [LocalTranslationsController::class, 'getLanguages']);
        Route::get('{lang}', [LocalTranslationsController::class, 'getTranslations']);
    });
});
