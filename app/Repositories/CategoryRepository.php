<?php

namespace App\Repositories;

use App\Models\Category;
use App\Models\Faq;
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
                //'pinnedFaq',
                //'pinnedFaq.translatable',
            ])
            ->withCount([
                'subs',
            ])
            ->when(($validated['with_subs'] ?? 'no') === 'yes', function ($query) {
                $query->with([
                    'subs',
                    'subs.translatable',
                    'subs.media',
                    'subs.pinnedFaq',
                    'subs.pinnedFaq.translatable',
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
                'pinnedFaq',
                'pinnedFaq.translatable',
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

    public function show(Category $category): Category
    {
        return $category
            ->load([
                'pinnedFaq',
                'pinnedFaq.translatable',
            ]);
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
        $category->is_active = !$category->is_active;
        $category->save();
    }

    public function checkIsSub(Category $category): void
    {
        if ($category->category_id === null) {
            throw new BadRequestHttpException(
                LangService::instance()
                    ->setDefault('Only sub-categories are allowed for this operation.')
                    ->getLang('only_subcategories_allowed')
            );
        }
    }

    public function choosePinnedFaqForCategory(Category $category, Faq $faq): void
    {
        $this->checkIsSub($category);

        if ($category->pinned_faq_id === $faq->id) {
            throw new BadRequestHttpException(
                LangService::instance()
                    ->setDefault('This FAQ is already pinned for the selected category.')
                    ->getLang('faq_already_pinned_for_category')
            );
        }

        $category->pinned_faq_id = $faq->id;
        $category->save();
    }

    public function removePinnedFaqForCategory(Category $category): void
    {
        $this->checkIsSub($category);

        if ($category->pinned_faq_id === null) {
            throw new BadRequestHttpException(
                LangService::instance()
                    ->setDefault('No FAQ is currently pinned for the selected category.')
                    ->getLang('no_faq_pinned_for_category')
            );
        }

        $category->pinned_faq_id = null;
        $category->save();
    }

    public function showForApp(Category $category): Category
    {
        $this->checkIsSub($category);

        return $category
            ->load([
                'translatable',
                'media',
                'parent',
                'parent.translatable',
                'parent.media',
                'pinnedFaq',
                'pinnedFaq.translatable',
                'pinnedFaq.media',
                'pinnedFaq.tags' => function ($builder) {
                    $builder->limit(config('settings.faq.tags_limit'));
                },
                'pinnedFaq.categories',
                'pinnedFaq.categories.translatable',
                'pinnedFaq.categories.media',
                'pinnedFaq.categories.parent',
                'pinnedFaq.categories.parent.translatable',
                'pinnedFaq.categories.parent.media',
            ]);
    }
}
