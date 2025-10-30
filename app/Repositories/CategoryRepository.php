<?php

namespace App\Repositories;

use App\Models\Category;
use App\Services\FileUpload;
use App\Services\LangService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Http\FormRequest;
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
                'media',
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
                    'subs.media',
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
                'media',
            ])
            ->when(($validated['with_subs'] ?? 'no') === 'yes', function ($query) {
                $query->with([
                    'subs',
                    'subs.translatable',
                    'subs.media',
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
                'media',
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
                'media',
                'parent',
                'parent.translatable',
                'parent.media',
            ])
            ->loadCount([
                'subs',
            ]);
    }

    public function store(FormRequest $request): Category
    {
        return DB::transaction(static function () use ($request) {
            $validated = $request->validated();

            $translations = $validated['translations'];
            unset($validated['translations']);

            $default = $translations[0];
            $slug = Str::slug($default['title']);

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

            FileUpload::upload($request, 'icon', 'categories', $category);

            return $category;
        });
    }

    public function update(Category $category, FormRequest $request): Category
    {
        return DB::transaction(static function () use ($category, $request) {
            $validated = $request->validated();

            $translations = $validated['translations'];
            unset($validated['translations']);

            $category->update([
                'category_id' => $validated['parent_id'] ?? null,
            ]);

            foreach ($translations as $translation) {
                $category->setLang('title', $translation['title'], $translation['language_id']);
            }

            $category->saveLang();

            FileUpload::upload($request, 'icon', 'categories', $category);

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
