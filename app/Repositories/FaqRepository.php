<?php

namespace App\Repositories;

use App\Enum\FaqListTypeEnum;
use App\Enum\NotificationTypeEnum;
use App\Http\Resources\Admin\Categories\CategoriesListResource;
use App\Models\Admin;
use App\Models\Faq;
use App\Models\FaqList;
use App\Models\User;
use App\Services\FileUpload;
use App\Services\LangService;
use App\Services\LoggerService;
use App\Services\NotificationService;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Elasticsearch\Client;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Http\FormRequest;
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
            ->orderBy(
                $validated['sort'] ?? 'id',
                $validated['sort_type'] ?? 'desc'
            )
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

    public function show(Faq $faq): void
    {
        $faq
            ->load([
                'translatable',
                'media',
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

    public function store(FormRequest $request): Faq
    {
        return DB::transaction(static function () use ($request) {
            $validated = $request->validated();

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

            FileUpload::multipleUpload($request, 'files', 'faqs', $faq);

            $userIds = User::query()->pluck('id')->toArray();
            NotificationService::instance()->sendToUsers($userIds, NotificationTypeEnum::FAQ_NEW, $faq);

            (new FaqRepository())->indexFaq($faq);

            return $faq;
        });
    }

    public function update(Faq $faq, FormRequest $request): Faq
    {
        return DB::transaction(static function () use ($faq, $request) {
            $validated = $request->validated();

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

            FileUpload::multipleUpload($request, 'files', 'faqs', $faq);

            $userIds = User::query()->pluck('id')->toArray();
            NotificationService::instance()->sendToUsers($userIds, NotificationTypeEnum::FAQ, $faq);

            (new FaqRepository())->indexFaq($faq);

            return $faq;
        });
    }

    public function destroy(Faq $faq): void
    {
        DB::transaction(static function () use ($faq) {
            $faq->delete();

            (new FaqRepository())->deleteFromIndex($faq);
        });
    }

    public function deleteImage(Faq $faq, int $mediaId): void
    {
        DB::transaction(static function () use ($faq, $mediaId) {
            $faq->deleteMedia($mediaId);
        });
    }

    public function changeActiveStatus(Faq $faq): void
    {
        DB::transaction(static function () use ($faq) {
            $faq->is_active = !$faq->is_active;
            $faq->save();

            (new FaqRepository())->indexFaq($faq);
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
                'tags' => function ($builder) {
                    $builder->limit(config('settings.faq.tags_limit'));
                },
                'category',
                'category.translatable',
                'category.parent',
                'category.parent.translatable',
            ])
            ->limit($limit)
            ->orderByDesc('seen_count')
            ->orderBy('id')
            ->get();
    }

    public function open(Faq $faq): void
    {
        $faq->timestamps = false;

        $faq->update([
            'seen_count' => $faq->seen_count + 1,
        ]);

        /** @var User $user */
        $user = auth('user')->user();
        $faq->seenLogs()->create([
            'user_id' => $user->id,
        ]);

        $faq->timestamps = true;
    }

    public function fuzzySearch(array $validated): LengthAwarePaginator
    {
        $client = app(Client::class);

        $lang = LangService::instance()->getCurrentLang();
        $questionField = "question_{$lang}";
        $answerField = "answer_{$lang}";

        $perPage = $validated['limit'] ?? 10;
        $page = $validated['page'] ?? 1;

        $hasSearch = !empty($validated['search']);
        $hasCategory = !empty($validated['category_id']);
        $hasSubCategory = !empty($validated['sub_category_id']);

        if (!$hasSearch && !$hasCategory && !$hasSubCategory) {
            throw new BadRequestHttpException('At least one of search, category_id or sub_category_id is required.');
        }

        $filters = [];

        if ($hasSubCategory) {
            $filters[] = [
                'terms' => [
                    'category_id' => $validated['sub_category_id']
                ]
            ];
        }

        if ($hasCategory) {
            $filters[] = [
                'terms' => [
                    'parent_category_id' => $validated['category_id']
                ]
            ];
        }

        $query = [];

        if ($hasSearch) {
            $query['must'][] = [
                'bool' => [
                    'should' => [
                        [
                            'match_phrase' => [
                                'content' => $validated['search']
                            ]
                        ],
                        [
                            'multi_match' => [
                                'query'     => $validated['search'],
                                'fields'    => [
                                    "{$questionField}^3",
                                    "{$answerField}^2",
                                    "tags^4"
                                ],
                                'fuzziness' => 'AUTO',
                                'operator'  => 'and',
                            ]
                        ]
                    ],
                    'minimum_should_match' => 1
                ]
            ];
        }

        if (!empty($filters)) {
            $query['filter'] = $filters;
        }

        $response = $client->search([
            'index' => 'faq_index',
            'body' => [
                'from' => ($page - 1) * $perPage,
                'size' => $perPage,
                'query' => [
                    'bool' => $query,
                ],
                'highlight' => [
                    'pre_tags' => ['<span style="background: yellow;">'],
                    'post_tags'=> ['</span>'],
                    'fields' => [
                        $questionField => new \stdClass(),
                        $answerField   => new \stdClass(),
                        'tags'         => new \stdClass(),
                    ]
                ]
            ]
        ]);

        $hits = collect($response['hits']['hits']);

        $faqIds = data_get($hits, '*._source.id');
        $faqs = Faq::query()
            ->active()
            ->whereIn('id', $faqIds)
            ->with([
                'tags',
                'category',
                'category.translatable',
                'category.parent',
                'category.parent.translatable',
            ])
            ->get();

        $results = $hits->map(function ($hit) use ($faqs, $lang) {
            $source = $hit['_source'];
            $highlight = $hit['highlight'] ?? [];

            $faqModel = $faqs->where('id', $source['id'])->first();

            if (!$faqModel) {
                return null;
            }

            $question = $source["question_{$lang}"];
            if (!empty($highlight["question_{$lang}"][0])) {
                $highlighted = strip_tags($highlight["question_{$lang}"][0], '<span>');
                $term = strip_tags($highlight["question_{$lang}"][0]);
                $question = $this->mbStrReplace($term, $highlighted, $question);
            }

            $answer = $source["answer_{$lang}"];
            if (!empty($highlight["answer_{$lang}"][0])) {
                $highlighted = strip_tags($highlight["answer_{$lang}"][0], '<span>');
                $term = strip_tags($highlight["answer_{$lang}"][0]);
                $answer = $this->mbStrReplace($term, $highlighted, $answer);
            }

            $highlightedTag = null;
            if (!empty($highlight['tags'][0])) {
                $highlightedTag = [
                    'term' => strip_tags($highlight['tags'][0]),
                    'highlighted' => strip_tags($highlight['tags'][0], '<span>'),
                ];
            }

            $tags = $faqModel->tags->map(function ($tag) use ($highlightedTag) {
                $title = $tag->title;
                if ($highlightedTag && stripos($title, $highlightedTag['term']) !== false) {
                    $title = $this->mbStrReplace($highlightedTag['term'], $highlightedTag['highlighted'], $title);
                }
                return [
                    'id' => $tag->id,
                    'title' => $title,
                ];
            })->values()->all();

            return (object)[
                'id' => $source['id'],
                'question' => $question,
                'answer' => $answer,
                'seen_count' => 0,
                'tags' => $tags,
                'score' => $hit['_score'] ?? null,
                'category' => CategoriesListResource::make($faqModel->category),
                'updated_at' => $faqModel->updated_at,
            ];
        })->filter();

        return new \Illuminate\Pagination\LengthAwarePaginator(
            $results,
            $response['hits']['total']['value'] ?? 0,
            $perPage,
            $page
        );
    }

    private function mbStrReplace($search, $replace, $subject): array|string|null
    {
        $pattern = '/' . preg_quote($search, '/') . '/iu';
        return preg_replace($pattern, $replace, $subject);
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

    public function indexFaq(Faq $faq): void
    {
        if (config('services.elasticsearch.disable') === true) {
            return;
        }

        $faq->load(['translatable', 'tags', 'category']);

        $data = [
            'id' => $faq->id,
            'question_az' => $faq->getLang('question', LangService::instance()->getLangIdByKey('az')),
            'answer_az'   => $faq->getLang('answer', LangService::instance()->getLangIdByKey('az')),
            'question_ru' => $faq->getLang('question', LangService::instance()->getLangIdByKey('ru')),
            'answer_ru'   => $faq->getLang('answer', LangService::instance()->getLangIdByKey('ru')),
            'tags'        => $faq->tags->pluck('title')->implode(' '),
            'category_id' => $faq->category_id,
            'parent_category_id' => optional($faq->category)->category_id ?? 0,
        ];

        app(Client::class)->index([
            'index' => 'faq_index',
            'id'    => $faq->id,
            'body'  => $data
        ]);
    }

    public function deleteFromIndex(Faq $faq): void
    {
        if (config('services.elasticsearch.disable') === true) {
            return;
        }

        try {
            app(Client::class)->delete([
                'index' => 'faq_index',
                'id' => $faq->id,
            ]);
        } catch (\Elasticsearch\Common\Exceptions\Missing404Exception $e) {
            LoggerService::instance()->log($e->getMessage(), [], true);
        }
    }

    public function deleteIndex(): void
    {
        if (config('services.elasticsearch.disable') === true) {
            return;
        }

        $client = app(Client::class);

        if ($client->indices()->exists(['index' => 'faq_index'])) {
            $client->indices()->delete(['index' => 'faq_index']);
        }
    }

    public function createIndex(): void
    {
        if (config('services.elasticsearch.disable') === true) {
            return;
        }

        $client = app(Client::class);

        $client->indices()->create([
            'index' => 'faq_index',
            'body' => [
                'settings' => [
                    'analysis' => [
                        'char_filter' => [
                            'az_char_map' => [
                                'type' => 'mapping',
                                'mappings' => [
                                    'ə => e',
                                    'ı => i',
                                    'ö => o',
                                    'ü => u',
                                    'ç => c',
                                    'ş => s',
                                    'ğ => g'
                                ]
                            ]
                        ],
                        'filter' => [
                            'edge_ngram_filter' => [
                                'type' => 'edge_ngram',
                                'min_gram' => 2,
                                'max_gram' => 20,
                            ]
                        ],
                        'analyzer' => [
                            'az_ru_index_analyzer' => [
                                'type' => 'custom',
                                'tokenizer' => 'standard',
                                'char_filter' => ['az_char_map'],
                                'filter' => ['lowercase', 'edge_ngram_filter'],
                            ],
                            'az_ru_search_analyzer' => [
                                'type' => 'custom',
                                'tokenizer' => 'standard',
                                'char_filter' => ['az_char_map'],
                                'filter' => ['lowercase'],
                            ],
                        ]
                    ]
                ],
                'mappings' => [
                    'properties' => [
                        'id' => ['type' => 'integer'],
                        'question_az' => [
                            'type' => 'text',
                            'analyzer' => 'az_ru_index_analyzer',
                            'search_analyzer' => 'az_ru_search_analyzer',
                        ],
                        'answer_az' => [
                            'type' => 'text',
                            'analyzer' => 'az_ru_index_analyzer',
                            'search_analyzer' => 'az_ru_search_analyzer',
                        ],
                        'question_ru' => [
                            'type' => 'text',
                            'analyzer' => 'az_ru_index_analyzer',
                            'search_analyzer' => 'az_ru_search_analyzer',
                        ],
                        'answer_ru' => [
                            'type' => 'text',
                            'analyzer' => 'az_ru_index_analyzer',
                            'search_analyzer' => 'az_ru_search_analyzer',
                        ],
                        'tags' => [
                            'type' => 'text',
                            'analyzer' => 'az_ru_index_analyzer',
                            'search_analyzer' => 'az_ru_search_analyzer',
                        ],
                        'category_id' => ['type' => 'integer'],
                        'parent_category_id' => ['type' => 'integer'],
                    ]
                ]
            ]
        ]);
    }

    public function generateIndex(): void
    {
        if (config('services.elasticsearch.disable') === true) {
            return;
        }

        $client = app(Client::class);

        $langAz = LangService::instance()->getLangIdByKey('az');
        $langRu = LangService::instance()->getLangIdByKey('ru');

        Faq::query()
            ->active()
            ->with(['translatable', 'tags', 'category'])
            ->chunk(100, function ($faqs) use ($client, $langAz, $langRu) {
                $body = [];

                foreach ($faqs as $faq) {
                    $body[] = [
                        'index' => [
                            '_index' => 'faq_index',
                            '_id' => $faq->id,
                        ],
                    ];

                    $body[] = [
                        'id' => $faq->id,
                        'question_az' => $faq->getLang('question', $langAz),
                        'answer_az' => $faq->getLang('answer', $langAz),
                        'question_ru' => $faq->getLang('question', $langRu),
                        'answer_ru' => $faq->getLang('answer', $langRu),
                        'tags' => $faq->tags->pluck('title')->implode(' '),
                        'category_id' => $faq->category_id,
                        'parent_category_id' => optional($faq->category)->category_id ?? 0,
                    ];
                }

                if (!empty($body)) {
                    $client->bulk(['body' => $body]);
                }
            });
    }

    public function reGenerateIndex(): void
    {
        if (config('services.elasticsearch.disable') === true) {
            return;
        }

        $this->deleteIndex();
        $this->createIndex();
        $this->generateIndex();
    }

    // reports
    public function topFaqs(string $period = 'day', int $limit = 10, bool $calendar = true): \Illuminate\Support\Collection
    {
        $tz  = config('app.timezone', 'Asia/Baku');
        $now = Carbon::now($tz);

        [$from, $to] = match ($period) {
            'week'  => [$calendar ? $now->copy()->startOfWeek(CarbonInterface::MONDAY) : $now->copy()->subDays(6)->startOfDay(),
                $now->copy()->endOfDay()],
            'month' => [$calendar ? $now->copy()->startOfMonth() : $now->copy()->subDays(29)->startOfDay(),
                $now->copy()->endOfDay()],
            default => [$now->copy()->startOfDay(), $now->copy()->endOfDay()],
        };

        return $this->topFaqsBetween($from, $to, $limit);
    }

    public function topFaqsBetween(Carbon $from, Carbon $to, int $limit = 10): \Illuminate\Support\Collection
    {
        return DB::table('faq_seen_logs as l')
            ->join('faqs as f', 'f.id', '=', 'l.faq_id')
            ->leftJoin('model_translations as t', function ($join) {
                $join->on('t.translatable_id', '=', 'f.id')
                    ->where('t.translatable_type', '=', Faq::class)
                    ->where('t.column', '=', 'question')
                    ->where('t.language_id', '=', LangService::instance()->getCurrentLangId());
            })
            ->whereNull('l.deleted_at')
            ->whereBetween('l.created_at', [$from, $to])
            ->groupBy('f.id', 't.text')
            ->select('f.id', 't.text', DB::raw('COUNT(*) as views'))
            ->orderByDesc('views')
            ->limit($limit)
            ->get();
    }

    public function timeSeries(string $granularity = 'day', ?Carbon $from = null, ?Carbon $to = null): \Illuminate\Support\Collection
    {
        $now  = Carbon::now();
        $from ??= $now->copy()->subDays(29)->startOfDay();
        $to   ??= $now->copy()->endOfDay();

        $base = DB::table('faq_seen_logs as l')
            ->join('faqs as f', 'f.id', '=', 'l.faq_id')
            ->leftJoin('model_translations as t', function ($join) {
                $join->on('t.translatable_id', '=', 'f.id')
                    ->where('t.translatable_type', '=', Faq::class)
                    ->where('t.column', '=', 'question')
                    ->where('t.language_id', '=', LangService::instance()->getCurrentLangId());
            })
            ->whereNull('l.deleted_at')
            ->whereBetween('l.created_at', [$from, $to]);

        if ($granularity === 'month') {
            return $base
                ->selectRaw('DATE_FORMAT(l.created_at, "%Y-%m") as bucket, f.id, t.text, COUNT(*) as views')
                ->groupBy('bucket', 'f.id', 't.text')
                ->orderBy('bucket')
                ->get();

        }

        if ($granularity === 'week') {
            return $base
                ->selectRaw('YEARWEEK(l.created_at, 3) as bucket, f.id, t.text, COUNT(*) as views')
                ->groupBy('bucket', 'f.id', 't.text')
                ->orderBy('bucket')
                ->get();
        }

        // day
        return $base
            ->selectRaw('DATE(l.created_at) as bucket, f.id, t.text, COUNT(*) as views')
            ->groupBy('bucket', 'f.id', 't.text')
            ->orderBy('bucket')
            ->get();
    }
}
