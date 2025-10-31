<?php

use Illuminate\Support\Facades\Route;

Route::get('/', static function () {
    $settings = \App\Services\SettingService::instance()->get();
    dd($settings);
    return 'Access denied!';
});
