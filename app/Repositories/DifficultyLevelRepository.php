<?php

namespace App\Repositories;

use App\Models\DifficultyLevel;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class DifficultyLevelRepository
{
    public function load(array $validated): LengthAwarePaginator
    {
        return DifficultyLevel::query()
            ->with([
                'translatable',
                'creatable',
            ])
            ->orderByDesc('id')
            ->paginate($validated['limit'] ?? 10);
    }

    public function list(): Collection
    {
        return DifficultyLevel::query()
            ->with([
                'translatable',
            ])
            ->orderBy('id')
            ->get();
    }

    public function loadRelations(DifficultyLevel $difficultyLevel): void
    {
        $difficultyLevel
            ->load([
                'translatable',
                'creatable',
            ]);
    }

    public function store(array $validated): DifficultyLevel
    {
        return DB::transaction(static function () use ($validated) {
            $translations = $validated['translations'];
            unset($validated['translations']);

            $difficultyLevel = DifficultyLevel::query()->create($validated);

            $default = $translations[0];
            foreach ($translations as $translation) {
                $difficultyLevel->setLang('title', $translation['title'] ?? $default['title'], $translation['language_id']);
            }

            $difficultyLevel->saveLang();

            return $difficultyLevel;
        });
    }

    public function update(DifficultyLevel $difficultyLevel, array $validated): DifficultyLevel
    {
        return DB::transaction(static function () use ($difficultyLevel, $validated) {
            $translations = $validated['translations'];
            unset($validated['translations']);

            //$difficultyLevel->update($validated);

            foreach ($translations as $translation) {
                $difficultyLevel->setLang('title', $translation['title'], $translation['language_id']);
            }

            $difficultyLevel->saveLang();

            return $difficultyLevel;
        });
    }

    public function destroy(DifficultyLevel $difficultyLevel): void
    {
        DB::transaction(static function () use ($difficultyLevel) {
            $difficultyLevel->delete();
        });
    }
}
