<?php

use App\Http\Controllers\App\Auth\LoginController;
use App\Http\Controllers\App\Auth\LogoutController;
use App\Http\Controllers\App\ExamController;
use App\Http\Controllers\App\NotificationController;
use App\Http\Controllers\LocalTranslationsController;
use App\Http\Middleware\CheckUserExpiredMiddleware;
use App\Http\Middleware\RouteLogMiddleware;
use Illuminate\Support\Facades\Route;

Route::middleware(['general_access:app', RouteLogMiddleware::class])->prefix('app')->group(static function () {
    Route::group(['prefix' => 'local-translations'], static function () {
        Route::get('languages/list', [LocalTranslationsController::class, 'getLanguages']);
        Route::get('{lang}', [LocalTranslationsController::class, 'getTranslations']);
    });

    Route::post('login', [LoginController::class, 'login']);

    Route::group(['middleware' => ['auth:user', CheckUserExpiredMiddleware::class]], static function () {
        Route::group(['prefix' => 'profile'], static function () {
            Route::get('check-logged-in', [LoginController::class, 'checkLoggedIn']);
        });

        Route::post('logout', [LogoutController::class, 'logout']);
        Route::post('logout-all', [LogoutController::class, 'logoutAll']);

        Route::group(['prefix' => 'notifications'], static function () {
            Route::get('list', [NotificationController::class, 'list']);
            Route::get('{notification}/show', [NotificationController::class, 'show']);
        });

        Route::group(['prefix' => 'exams'], static function () {
            Route::get('list', [ExamController::class, 'list']);
            Route::post('{exam}/start', [ExamController::class, 'start']);
            Route::post('{exam}/choose-answer', [ExamController::class, 'chooseAnswer']);
        });
    });
});
