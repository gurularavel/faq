<?php

namespace App\Repositories;

use App\Enum\NotificationTypeEnum;
use App\Models\Admin;
use App\Models\Exam;
use App\Models\QuestionGroup;
use App\Models\User;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
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
            ->withCount([
                'questions' => function ($query) {
                    $query->active();
                },
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
            ])
            ->loadCount([
                'questions' => function ($query) {
                    $query->active();
                },
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

    public function getAssignedIds(QuestionGroup $questionGroup): array
    {
        $questionGroup->load([
            'exams' => static function ($query) {
                $query->whereNull('start_date');
            },
        ]);

        return [
            'departments' => [],
            'users' => $questionGroup->exams->pluck('user_id')->toArray(),
        ];
    }

    public function assign(QuestionGroup $questionGroup, array $validated): QuestionGroup
    {
        $departmentIds = $validated['departments'] ?? [];
        $userIds = $validated['users'] ?? [];

        $users = User::query()
            ->whereHas('department', static function (Builder $query) use ($departmentIds) {
                $query->whereIn('department_id', $departmentIds);
            })
            ->select([
                'id',
            ])
            ->get()
            ->pluck('id')
            ->toArray();

        $userIds = array_unique(array_merge($userIds, $users));

        $questionGroup->load([
            'exams' => static function ($query) {
                $query->whereNull('start_date');
            },
        ]);

        $existingUserIds = $questionGroup->exams->pluck('user_id')->toArray();

        $notInUserIds = array_diff($existingUserIds, $userIds);
        $userIds = array_diff($userIds, $existingUserIds);

        $data = [];
        foreach ($userIds as $userId) {
            $data[] = [
                'question_group_id' => $questionGroup->id,
                'user_id' => $userId,
            ];
        }

        DB::transaction(static function () use ($questionGroup, $userIds, $data, $notInUserIds) {
            /** @var Admin $admin */
            $admin = auth('admin')->user();

            Exam::query()
                ->whereIn('user_id', $notInUserIds)
                ->where('question_group_id', $questionGroup->id)
                ->update([
                    'deletable_id' => $admin->id,
                    'deletable_type' => $admin->getMorphClass(),
                    'is_deleted' => DB::raw("CONCAT('deleted_', id)"),
                    'deleted_at' => Carbon::now(),
                ]);

            if (!empty($data)) {
                Exam::query()->insert($data);

                NotificationService::instance()->sendToUsers($userIds, NotificationTypeEnum::EXAM, $questionGroup);
            }
        });

        return $questionGroup;
    }
}
