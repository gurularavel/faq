<?php

namespace App\Repositories;

use App\Enum\FaqListTypeEnum;
use App\Enum\NotificationTypeEnum;
use App\Models\Admin;
use App\Models\Faq;
use App\Models\FaqList;
use App\Models\User;
use App\Services\LangService;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

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
            ->withExists([
                'lists as in_most_searched' => static function (Builder $query) {
                    $query->where('list_type', FaqListTypeEnum::SEARCH->value);
                },
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
                $builder->where('is_active', ((int)$validated['status']) === 1);
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

    public function loadTranslations(Faq $faq): void
    {
        $faq->load([
            'translatable',
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

            $userIds = User::query()->pluck('id')->toArray();
            NotificationService::instance()->sendToUsers($userIds, NotificationTypeEnum::FAQ, $faq);

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

    public function addToList(Faq $faq, FaqListTypeEnum $type): void
    {
        $faq->lists()->firstOrCreate([
            'list_type' => $type->value,
        ]);
    }

    public function removeFromList(Faq $faq, FaqListTypeEnum $type): void
    {
        $list = $faq->lists()->where('list_type', $type->value)->first();

        if ($list) {
            $list->delete();
        }
    }

    public function bulkAddToList(array $faqIds, FaqListTypeEnum $type): void
    {
        /** @var Admin $user */
        $user = auth('admin')->user();

        $exists = FaqList::query()
            ->whereIn('faq_id', $faqIds)
            ->where('list_type', $type->value)
            ->get()
            ->pluck('faq_id')
            ->toArray();

        $faqIds = array_diff($faqIds, $exists);

        $now = Carbon::now();
        $data = [];

        foreach ($faqIds as $faqId) {
            $data[] = [
                'faq_id' => $faqId,
                'list_type' => $type->value,
                'created_at' => $now,
                'creatable_id' => $user->id,
                'creatable_type' => $user->getMorphClass(),
            ];
        }

        FaqList::query()->insert($data);
    }

    public function getFaqFromList(FaqListTypeEnum $type, int $limit = 10)
    {
        return Faq::query()
            ->active()
            ->whereHas('lists', function (Builder $query) use ($type) {
                $query->where('list_type', $type->value);
            })
            ->with([
                'translatable',
            ])
            ->limit($limit)
            ->inRandomOrder()
            ->get();
    }

    public function getMostSearchedItems(int $limit = 10)
    {
        return Faq::query()
            ->active()
            ->with([
                'translatable',
            ])
            ->limit($limit)
            ->orderByDesc('seen_count')
            ->orderBy('id')
            ->get();
    }

    public function open(Faq $faq): void
    {
        $faq->update([
            'seen_count' => $faq->seen_count + 1,
        ]);
    }

    public function fuzzySearch(array $validated): LengthAwarePaginator
    {
        $search = $validated['search'];

        return Faq::search($search)
            ->query(function ($builder) {
                $builder->active();
                $builder->with('translatable');
            })
            ->paginate($validated['limit'] ?? 10);
    }

    public function checkIsActive(Faq $faq): void
    {
        if (!$faq->isActive()) {
            throw new BadRequestHttpException(
                LangService::instance()
                    ->setDefault('FAQ is not active')
                    ->getLang('faq_is_not_active')
            );
        }
    }
}
