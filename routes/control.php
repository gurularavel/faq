<?php

use App\Enum\RoleEnum;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\Auth\LoginController;
use App\Http\Controllers\Admin\Auth\LogoutController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\DifficultyLevelController;
use App\Http\Controllers\Admin\ExamController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\FaqExcelController;
use App\Http\Controllers\Admin\LanguageController;
use App\Http\Controllers\Admin\QuestionController;
use App\Http\Controllers\Admin\QuestionGroupController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TagController;
use App\Http\Controllers\Admin\TranslationController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\LocalTranslationsController;
use App\Http\Middleware\RouteLogMiddleware;
use Illuminate\Support\Facades\Route;

Route::middleware(['general_access:admin', RouteLogMiddleware::class])->prefix('control')->group(callback: static function () {
    Route::post("login", [LoginController::class, 'login'])->withoutMiddleware(RouteLogMiddleware::class);

    Route::group(['middleware' => ['auth:admin']], static function () {
        Route::group(['prefix' => 'profile'], static function () {
            Route::get("check-logged-in", [LoginController::class, 'checkLoggedIn']);
            Route::post("change-password", [LoginController::class, 'changePassword']);
        });

        Route::post("logout", [LogoutController::class, 'logout']);
        Route::post("logout-all", [LogoutController::class, 'logoutAll']);

        Route::group(['prefix' => 'local-translations'], static function () {
            Route::get('languages/list', [LocalTranslationsController::class, 'getLanguages'])->withoutMiddleware(['auth:admin']);
            Route::get('{lang}', [LocalTranslationsController::class, 'getTranslations'])->withoutMiddleware(['auth:admin']);
        });

        Route::group(['prefix' => 'admins', 'middleware' => ['role:' . RoleEnum::ADMIN->value]], static function () {
            Route::get('load', [AdminController::class, 'index']);
            Route::get('show/{admin}', [AdminController::class, 'show']);
            Route::post('add', [AdminController::class, 'store'])->withoutMiddleware(RouteLogMiddleware::class);
            Route::post('update/{admin}', [AdminController::class, 'update'])->withoutMiddleware(RouteLogMiddleware::class);
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

        Route::group(['prefix' => 'tags'], static function () {
            Route::get('load', [TagController::class, 'index']);
            Route::get('list', [TagController::class, 'list']);
            Route::get('show/{tag}', [TagController::class, 'show']);
            Route::get('find/{title}', [TagController::class, 'findByTitle']);
            Route::post('add', [TagController::class, 'store']);
            Route::post('update/{tag}', [TagController::class, 'update']);
            Route::post('change-active-status/{tag}', [TagController::class, 'changeActiveStatus']);
            Route::delete('delete/{tag}', [TagController::class, 'destroy']);
        });

        Route::group(['prefix' => 'faqs'], static function () {
            Route::get('load', [FaqController::class, 'index']);
            Route::get('list', [FaqController::class, 'list']);
            Route::get('show/{faq}', [FaqController::class, 'show']);
            Route::post('add', [FaqController::class, 'store']);
            Route::post('update/{faq}', [FaqController::class, 'update']);
            Route::post('change-active-status/{faq}', [FaqController::class, 'changeActiveStatus']);
            Route::delete('delete/{faq}', [FaqController::class, 'destroy']);
            Route::post('lists/add', [FaqController::class, 'addToList']);
            Route::post('lists/remove', [FaqController::class, 'removeFromList']);
            Route::post('lists/bulk-add', [FaqController::class, 'bulkAddToList']);

            Route::group(['prefix' => 'excels'], static function () {
                Route::get('load', [FaqExcelController::class, 'index']);
                Route::post('import', [FaqExcelController::class, 'import']);
                Route::post('rollback/{faqExcel}', [FaqExcelController::class, 'rollback']);
            });
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

        Route::group(['prefix' => 'users'], static function () {
            Route::get('load', [UserController::class, 'index']);
            Route::get('list', [UserController::class, 'list']);
            Route::get('show/{user}', [UserController::class, 'show']);
            Route::post('add', [UserController::class, 'store']);
            Route::post('update/{user}', [UserController::class, 'update']);
            Route::post('change-active-status/{user}', [UserController::class, 'changeActiveStatus']);
            Route::delete('delete/{user}', [UserController::class, 'destroy']);

            Route::group(['prefix' => '{user}/exams'], static function () {
                Route::get('list', [ExamController::class, 'list']);
            });
        });

        Route::group(['prefix' => 'difficulty-levels'], static function () {
            Route::get('load', [DifficultyLevelController::class, 'index']);
            Route::get('list', [DifficultyLevelController::class, 'list']);
            Route::get('show/{difficultyLevel}', [DifficultyLevelController::class, 'show']);
            Route::post('add', [DifficultyLevelController::class, 'store']);
            Route::post('update/{difficultyLevel}', [DifficultyLevelController::class, 'update']);
            Route::delete('delete/{difficultyLevel}', [DifficultyLevelController::class, 'destroy']);
        });

        Route::group(['prefix' => 'question-groups'], static function () {
            Route::get('load', [QuestionGroupController::class, 'index']);
            Route::get('list', [QuestionGroupController::class, 'list']);
            Route::get('show/{questionGroup}', [QuestionGroupController::class, 'show']);
            Route::post('add', [QuestionGroupController::class, 'store']);
            Route::post('update/{questionGroup}', [QuestionGroupController::class, 'update']);
            Route::post('change-active-status/{questionGroup}', [QuestionGroupController::class, 'changeActiveStatus']);
            Route::delete('delete/{questionGroup}', [QuestionGroupController::class, 'destroy']);
            Route::get('get-assigned-ids/{questionGroup}', [QuestionGroupController::class, 'getAssignedIds']);
            Route::post('assign/{questionGroup}', [QuestionGroupController::class, 'assign']);

            Route::group(['prefix' => '{questionGroup}/exams'], static function () {
                Route::get('export', [QuestionGroupController::class, 'exportExams']);
            });

            Route::group(['prefix' => '{questionGroup}/questions'], static function () {
                Route::get('load', [QuestionController::class, 'index']);
                Route::get('list', [QuestionController::class, 'list']);
                Route::get('show/{question}', [QuestionController::class, 'show']);
                Route::post('add', [QuestionController::class, 'store']);
                Route::post('update/{question}', [QuestionController::class, 'update']);
                Route::post('change-active-status/{question}', [QuestionController::class, 'changeActiveStatus']);
                Route::delete('delete/{question}', [QuestionController::class, 'destroy']);
            });
        });

        Route::group(['prefix' => 'reports'], static function () {
            Route::group(['prefix' => 'faqs'], static function () {
                Route::get('top-statistics', [FaqController::class, 'topStatistics']);
                Route::get('time-series', [FaqController::class, 'timeSeries']);
            });
        });
    });
});
