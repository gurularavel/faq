<?php

namespace App\Repositories;

use App\Enum\FaqListTypeEnum;
use App\Models\Faq;
use App\Services\LangService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class FaqRepository
{
    public function load(array $validated): LengthAwarePaginator
    {
        return Faq::query()
            ->with([
                'translatable',
                'creatable',
                'tags',
                'category',
                'category.translatable',
                'category.parent',
                'category.parent.translatable',
            ])
            ->when($validated['search'] ?? null, function (Builder $builder) use ($validated) {
                $builder->where(function (Builder $builder) use ($validated) {
                    $builder->whereHas('translatable', function (Builder $query) use ($validated) {
                        $query->where(function (Builder $q) use ($validated) {
                            $q->where('column', 'question');
                            $q->where('text', 'like', '%' . $validated['search'] . '%');
                        });
                        $query->orWhere(function (Builder $q) use ($validated) {
                            $q->where('column', 'answer');
                            $q->where('text', 'like', '%' . $validated['search'] . '%');
                        });
                    });
                });
            })
            ->when($validated['category'] ?? null, function (Builder $builder) use ($validated) {
                $builder->where(function (Builder $query) use ($validated) {
                    $query->where('category_id', $validated['category']);
                    $query->orWhereHas('category', function (Builder $q) use ($validated) {
                        $q->where('categories.category_id', $validated['category']);
                    });
                });
            })
            ->when($validated['status'] ?? null, function (Builder $builder) use ($validated) {
                $builder->where('is_active', ((int) $validated['status']) === 1);
            })
            ->orderByDesc('id')
            ->paginate($validated['limit'] ?? 10);
    }

    public function list(): Collection
    {
        return Faq::query()
            ->active()
            ->with([
                'translatable',
            ])
            ->orderByDesc('id')
            ->get();
    }

    public function loadRelations(Faq $faq): void
    {
        $faq
            ->load([
                'translatable',
                'creatable',
                'tags',
                'category',
                'category.translatable',
                'category.parent',
                'category.parent.translatable',
            ]);
    }

    public function store(array $validated): Faq
    {
        return DB::transaction(static function () use ($validated) {
            $translations = $validated['translations'];
            unset($validated['translations']);

            if (isset($validated['tags'])) {
                $tags = $validated['tags'];
                unset($validated['tags']);
            } else {
                $tags = [];
            }

            $faq = Faq::query()->create([
                'category_id' => $validated['category_id'],
            ]);

            $default = $translations[0];
            foreach ($translations as $translation) {
                $faq->setLang('question', $translation['question'] ?? $default['question'], $translation['language_id']);
                $faq->setLang('answer', $translation['answer'] ?? $default['answer'], $translation['language_id']);
            }

            $faq->saveLang();

            $faq->tags()->sync($tags);

            return $faq;
        });
    }

    public function update(Faq $faq, array $validated): Faq
    {
        return DB::transaction(static function () use ($faq, $validated) {
            $translations = $validated['translations'];
            unset($validated['translations']);

            if (isset($validated['tags'])) {
                $tags = $validated['tags'];
                unset($validated['tags']);
            } else {
                $tags = [];
            }

            $faq->update([
                'category_id' => $validated['category_id'],
            ]);

            foreach ($translations as $translation) {
                $faq->setLang('question', $translation['question'], $translation['language_id']);
                $faq->setLang('answer', $translation['answer'], $translation['language_id']);
            }

            $faq->saveLang();

            $faq->tags()->sync($tags);

            return $faq;
        });
    }

    public function destroy(Faq $faq): void
    {
        DB::transaction(static function () use ($faq) {
            $faq->delete();
        });
    }

    public function changeActiveStatus(Faq $faq): void
    {
        DB::transaction(static function () use ($faq) {
            $faq->is_active = !$faq->is_active;
            $faq->save();
        });
    }

    public function getFaqFromList(FaqListTypeEnum $type, int $limit = 10)
    {
        return Faq::query()
            ->active()
            ->with([
                'translatable',
            ])
            ->limit($limit)
            ->inRandomOrder()
            ->get();
    }

    public function fuzzySearch(array $validated): LengthAwarePaginator
    {
        $search = $validated['search'];
        $languageId = LangService::instance()->getCurrentLangId();

        return Faq::query()
            ->active()
            ->with([
                'translatable',
            ])
            ->whereHas('translatable', function (Builder $query) use ($search, $languageId) {
                $query->where('language_id', $languageId);
                $query->where('column', 'question');
                $query->where('text', 'like', '%' . $search . '%');
            })
            ->orWhereHas('translatable', function (Builder $query) use ($search, $languageId) {
                $query->where('language_id', $languageId);
                $query->where('column', 'answer');
                $query->where('text', 'like', '%' . $search . '%');
            })
            ->paginate($validated['limit'] ?? 10);
    }
}
