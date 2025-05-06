<?php

namespace App\Providers;

use App\Services\LoggerService;
use Elasticsearch\Client;
use Elasticsearch\ClientBuilder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(Client::class, function () {
            return ClientBuilder::create()
                ->setHosts([[
                    'host'   => env('ELASTICSEARCH_HOST'),
                    'port'   => env('ELASTICSEARCH_PORT'),
                    'scheme' => 'http',
                    'user'   => env('ELASTICSEARCH_USER'),
                    'pass'   => env('ELASTICSEARCH_PASS'),
                ]])
                ->build();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('logger.sql_debug')) {
            DB::listen(static function ($query) {
                LoggerService::instance()->log($query->sql, $query->bindings);
            });
        }
    }
}
