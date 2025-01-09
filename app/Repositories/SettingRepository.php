<?php

namespace App\Repositories;

use App\Models\Setting;
use App\Services\LangService;
use App\Services\SettingService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class SettingRepository
{
    public function load(array $validated): LengthAwarePaginator
    {
        return Setting::query()
            ->with([
                'creatable',
            ])
            ->orderBy('key')
            ->paginate($validated['limit'] ?? 10);
    }

    public function list(): Collection
    {
        return Setting::query()
            ->orderBy('key')
            ->get();
    }

    public function findByKey(string $key): ?Setting
    {
        return Setting::query()->where('key', $key)->first();
    }

    public function store(array $validated): Setting
    {
        return DB::transaction(static function () use ($validated) {
            $setting = Setting::query()->create($validated);

            SettingService::instance()->setCache();

            return $setting;
        });
    }

    public function update(Setting $oldSetting, array $validated): Setting
    {
        return DB::transaction(static function () use ($validated, $oldSetting) {
            $oldSetting->delete();

            $setting = Setting::query()->create($validated);

            SettingService::instance()->setCache();

            return $setting;
        });
    }

    public function destroy(Setting $setting): void
    {
        if ($setting->isForSystem()) {
            throw new BadRequestHttpException(
                LangService::instance()
                    ->setDefault('You cannot delete system settings!')
                    ->getLang('you_cannot_delete_system_settings')
            );
        }

        DB::transaction(static function () use ($setting) {
            $setting->delete();

            SettingService::instance()->setCache();
        });
    }
}
