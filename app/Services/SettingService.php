<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class SettingService
{
    private static ?SettingService $instance = null;
    private string $key = 'settings';

    private function __construct() {

    }

    public static function instance(): SettingService
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function get()
    {
        return json_decode($this->getCache(), false);
    }

    public function getCache()
    {
        if (! Cache::has($this->key)) {
            $this->setCache();
        }

        return Cache::get($this->key);
    }

    public function setCache(): void
    {
        $this->clearCache();

        $settings = Setting::query()
            ->select([
                'key',
                'value',
            ])
            ->get();

        Cache::rememberForever($this->key, function () use ($settings) {
            return json_encode($settings->pluck('value', 'key')->toArray());
        });

        LoggerService::instance()->log($this->key . ": cache cleared", [], true);
    }

    public function clearCache(): void
    {
        if (Cache::has($this->key)) {
            Cache::forget($this->key);
        }
    }
}
