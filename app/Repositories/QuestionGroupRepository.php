<?php

namespace App\Repositories;

use App\Enum\NotificationTypeEnum;
use App\Models\QuestionGroup;
use App\Services\NotificationService;
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
            'departments',
            'users',
        ]);

        return [
            'departments' => $questionGroup->departments->pluck('id')->toArray(),
            'users' => $questionGroup->users->pluck('id')->toArray(),
        ];
    }

    public function assign(QuestionGroup $questionGroup, array $validated): QuestionGroup
    {
        $departments = $validated['departments'] ?? [];
        $users = $validated['users'] ?? [];

        DB::transaction(static function () use ($questionGroup, $departments, $users) {
            $existingDepartmentIds = $questionGroup->departments->pluck('id')->toArray();
            $existingUserIds = $questionGroup->users->pluck('id')->toArray();

            $questionGroup->departments()->sync($departments);
            $questionGroup->users()->sync($users);

            $newDepartmentIds = array_diff($departments, $existingDepartmentIds);
            $newUserIds = array_diff($users, $existingUserIds);

            NotificationService::instance()->sendToDepartments($newDepartmentIds, NotificationTypeEnum::EXAM, $questionGroup);
            NotificationService::instance()->sendToUsers($newUserIds, NotificationTypeEnum::EXAM, $questionGroup);
        });

        return $questionGroup;
    }
}
