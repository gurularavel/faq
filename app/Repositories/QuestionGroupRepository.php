<?php

namespace App\Repositories;

use App\Models\QuestionGroup;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class QuestionGroupRepository
{
    public function load(array $validated): LengthAwarePaginator
    {
        return QuestionGroup::query()
            ->with([
                'translatable',
                'creatable',
            ])
            ->orderByDesc('id')
            ->paginate($validated['limit'] ?? 10);
    }

    public function list(): Collection
    {
        return QuestionGroup::query()
            ->active()
            ->with([
                'translatable',
            ])
            ->orderBy('id')
            ->get();
    }

    public function loadRelations(QuestionGroup $questionGroup): void
    {
        $questionGroup
            ->load([
                'translatable',
                'creatable',
            ]);
    }

    public function store(array $validated): QuestionGroup
    {
        return DB::transaction(static function () use ($validated) {
            $translations = $validated['translations'];
            unset($validated['translations']);

            $questionGroup = QuestionGroup::query()->create($validated);

            $default = $translations[0];
            foreach ($translations as $translation) {
                $questionGroup->setLang('title', $translation['title'] ?? $default['title'], $translation['language_id']);
            }

            $questionGroup->saveLang();

            return $questionGroup;
        });
    }

    public function update(QuestionGroup $questionGroup, array $validated): QuestionGroup
    {
        return DB::transaction(static function () use ($questionGroup, $validated) {
            $translations = $validated['translations'];
            unset($validated['translations']);

            //$questionGroup->update($validated);

            foreach ($translations as $translation) {
                $questionGroup->setLang('title', $translation['title'], $translation['language_id']);
            }

            $questionGroup->saveLang();

            return $questionGroup;
        });
    }

    public function destroy(QuestionGroup $questionGroup): void
    {
        DB::transaction(static function () use ($questionGroup) {
            $questionGroup->delete();
        });
    }

    public function changeActiveStatus(QuestionGroup $questionGroup): void
    {
        DB::transaction(static function () use ($questionGroup) {
            $questionGroup->is_active = !$questionGroup->is_active;
            $questionGroup->save();
        });
    }
}
