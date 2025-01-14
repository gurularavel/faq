<?php

use App\Enum\RoleEnum;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\Auth\LoginController;
use App\Http\Controllers\Admin\Auth\LogoutController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\LanguageController;
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

        Route::group(['prefix' => 'languages'], static function () {
            Route::get('load', [LanguageController::class, 'index']);
            Route::get('list', [LanguageController::class, 'list']);
            Route::get('show/{language}', [LanguageController::class, 'show']);
            Route::post('add', [LanguageController::class, 'store']);
            Route::post('update/{language}', [LanguageController::class, 'update']);
            Route::post('change-active-status/{language}', [LanguageController::class, 'changeActiveStatus']);
            Route::delete('delete/{language}', [LanguageController::class, 'destroy']);
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

        Route::group(['prefix' => 'categories'], static function () {
            Route::get('load', [CategoryController::class, 'index']);
            Route::get('list', [CategoryController::class, 'list']);
            Route::get('show/{category}', [CategoryController::class, 'show']);
            Route::get('subs/{category}', [CategoryController::class, 'loadSubs']);
            Route::post('add', [CategoryController::class, 'store']);
            Route::post('update/{category}', [CategoryController::class, 'update']);
            Route::post('change-active-status/{category}', [CategoryController::class, 'changeActiveStatus']);
            Route::delete('delete/{category}', [CategoryController::class, 'destroy']);
        });

        Route::group(['prefix' => 'departments'], static function () {
            Route::get('load', [DepartmentController::class, 'index']);
            Route::get('list', [DepartmentController::class, 'list']);
            Route::get('show/{department}', [DepartmentController::class, 'show']);
            Route::get('subs/{department}', [DepartmentController::class, 'loadSubs']);
            Route::post('add', [DepartmentController::class, 'store']);
            Route::post('update/{department}', [DepartmentController::class, 'update']);
            Route::post('change-active-status/{department}', [DepartmentController::class, 'changeActiveStatus']);
            Route::delete('delete/{department}', [DepartmentController::class, 'destroy']);
        });
    });
});
