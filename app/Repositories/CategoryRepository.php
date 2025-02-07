<?php

namespace App\Repositories;

use App\Models\Category;
use App\Services\LangService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class CategoryRepository
{
    public function load(array $validated): LengthAwarePaginator
    {
        return Category::query()
            ->parents()
            ->with([
                'translatable',
                'creatable',
                //'parent',
                //'parent.translatable',
            ])
            ->withCount([
                'subs',
            ])
            ->when(($validated['with_subs'] ?? 'no') === 'yes', function ($query) {
                $query->with([
                    'subs',
                    'subs.translatable',
                ]);
            })
            ->when($validated['search'] ?? null, function (Builder $builder) use ($validated) {
                $builder->where(function (Builder $builder) use ($validated) {
                    $builder->whereHas('translatable', function (Builder $query) use ($validated) {
                        $query->where(function (Builder $q) use ($validated) {
                            $q->where('column', 'title');
                            $q->where('text', 'like', '%' . $validated['search'] . '%');
                        });
                    });
                });
            })
            ->orderByDesc('id')
            ->paginate($validated['limit'] ?? 10);
    }

    public function list(array $validated): Collection
    {
        return Category::query()
            ->active()
            ->parents()
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
            ->when($validated['search'] ?? null, function (Builder $builder) use ($validated) {
                $builder->where(function (Builder $builder) use ($validated) {
                    $builder->whereHas('translatable', function (Builder $query) use ($validated) {
                        $query->where(function (Builder $q) use ($validated) {
                            $q->where('column', 'title');
                            $q->where('text', 'like', '%' . $validated['search'] . '%');
                        });
                    });
                });
            })
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

            $default = $translations[0];
            $slug = Str::slug($default);

            if (Category::query()->where('slug', $slug)->exists()) {
                throw new BadRequestHttpException(
                    LangService::instance()
                        ->setDefault('This slug is already in use! Slug: @slug')
                        ->getLang('slug_already_in_use', ['@slug' => $slug])
                );
            }

            $category = Category::query()->create([
                'category_id' => $validated['parent_id'] ?? null,
                'slug' => $slug,
            ]);

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
