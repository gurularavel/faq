<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('versions', static function () {
    return Storage::disk('public')->get('versions.json');
});

require_once 'control.php';
require_once 'app.php';
