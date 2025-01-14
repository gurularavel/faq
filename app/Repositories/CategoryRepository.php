<?php

namespace App\Repositories;

use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class CategoryRepository
{
    public function load(array $validated): LengthAwarePaginator
    {
        return Category::query()
            ->with([
                'translatable',
                'creatable',
                'parent',
                'parent.translatable',
            ])
            ->when(($validated['with_subs'] ?? 'no') === 'yes', function ($query) {
                $query->with([
                    'subs',
                    'subs.translatable',
                ]);
            })
            ->withCount([
                'subs',
            ])
            ->orderByDesc('id')
            ->paginate($validated['limit'] ?? 10);
    }

    public function list(array $validated): Collection
    {
        return Category::query()
            ->active()
            ->with([
                'translatable',
            ])
            ->when(($validated['with_subs'] ?? 'no') === 'yes', function ($query) {
                $query->with([
                    'subs',
                    'subs.translatable',
                ]);
            })
            ->orderByDesc('id')
            ->get();
    }

    public function loadSubs(Category $category, array $validated): LengthAwarePaginator
    {
        return $category->subs()
            ->with([
                'translatable',
                'creatable',
            ])
            ->orderByDesc('id')
            ->paginate($validated['limit'] ?? 10);
    }

    public function loadRelations(Category $category): void
    {
        $category
            ->load([
                'translatable',
                'creatable',
                'parent',
                'parent.translatable',
            ])
            ->loadCount([
                'subs',
            ]);
    }

    public function store(array $validated): Category
    {
        return DB::transaction(static function () use ($validated) {
            $translations = $validated['translations'];
            unset($validated['translations']);

            $category = Category::query()->create([
                'category_id' => $validated['parent_id'] ?? null,
            ]);

            $default = $translations[0];
            foreach ($translations as $translation) {
                $category->setLang('title', $translation['title'] ?? $default['title'], $translation['language_id']);
            }

            $category->saveLang();

            return $category;
        });
    }

    public function update(Category $category, array $validated): Category
    {
        return DB::transaction(static function () use ($category, $validated) {
            $translations = $validated['translations'];
            unset($validated['translations']);

            $category->update([
                'category_id' => $validated['parent_id'] ?? null,
            ]);

            foreach ($translations as $translation) {
                $category->setLang('title', $translation['title'], $translation['language_id']);
            }

            $category->saveLang();

            return $category;
        });
    }

    public function destroy(Category $category): void
    {
        DB::transaction(static function () use ($category) {
            $category->delete();
        });
    }

    public function changeActiveStatus(Category $category): void
    {
        $category->is_active = ! $category->is_active;
        $category->save();
    }
}
