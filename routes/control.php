<?php

use App\Enum\RoleEnum;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\Auth\LoginController;
use App\Http\Controllers\Admin\Auth\LogoutController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TranslationController;
use App\Http\Controllers\LocalTranslationsController;
use App\Http\Middleware\RouteLogMiddleware;
use Illuminate\Support\Facades\Route;

Route::middleware(['general_access:admin', RouteLogMiddleware::class])->prefix('control')->group(callback: static function () {
    Route::post("login", [LoginController::class, 'login']);

    Route::group(['middleware' => ['auth:sanctum']], static function () {
        Route::group(['prefix' => 'profile'], static function () {
            Route::get("check-logged-in", [LoginController::class, 'checkLoggedIn']);
            Route::post("change-password", [LoginController::class, 'changePassword']);
        });

        Route::post("logout", [LogoutController::class, 'logout']);
        Route::post("logout-all", [LogoutController::class, 'logoutAll']);

        Route::group(['prefix' => 'local-translations'], static function () {
            Route::get('languages/list', [LocalTranslationsController::class, 'getLanguages'])->withoutMiddleware(['auth:sanctum']);
            Route::get('{lang}', [LocalTranslationsController::class, 'getTranslations'])->withoutMiddleware(['auth:sanctum']);
        });

        Route::group(['prefix' => 'admins', 'middleware' => ['role:' . RoleEnum::ADMIN->value]], static function () {
            Route::get('load', [AdminController::class, 'index']);
            Route::get('show/{admin}', [AdminController::class, 'show']);
            Route::post('add', [AdminController::class, 'store']);
            Route::post('update/{admin}', [AdminController::class, 'update']);
            Route::delete('delete/{admin}', [AdminController::class, 'destroy']);
        });

        Route::group(['prefix' => 'roles', 'middleware' => ['role:' . RoleEnum::ADMIN->value]], static function () {
            Route::get('list', [RoleController::class, 'list']);
        });

        Route::group(['prefix' => 'translations', 'middleware' => ['role:' . RoleEnum::ADMIN->value]], static function () {
            Route::get('load', [TranslationController::class, 'index']);
            Route::get('filters', [TranslationController::class, 'filters']);
            Route::get('show/{group}/{key}', [TranslationController::class, 'show']);
            Route::post('update/{group}/{key}', [TranslationController::class, 'update']);
            Route::get('create', [TranslationController::class, 'create']);
            Route::post('add', [TranslationController::class, 'store']);
            Route::delete('delete/{group}/{key}', [TranslationController::class, 'destroy']);
        });

        Route::group(['prefix' => 'settings', 'middleware' => ['role:' . RoleEnum::ADMIN->value]], static function () {
            Route::get('load', [SettingController::class, 'index']);
            Route::get('list', [SettingController::class, 'list']);
            Route::get('show/{key}', [SettingController::class, 'show']);
            Route::post('add', [SettingController::class, 'store']);
            Route::post('update/{key}', [SettingController::class, 'update']);
            Route::delete('delete/{key}', [SettingController::class, 'destroy']);
        });
    });
});
