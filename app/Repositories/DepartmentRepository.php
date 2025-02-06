<?php

namespace App\Repositories;

use App\Models\Department;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class DepartmentRepository
{
    public function load(array $validated): LengthAwarePaginator
    {
        return Department::query()
            ->parents()
            ->with([
                'translatable',
                'creatable',
                //'parent',
                //'parent.translatable',
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
        return Department::query()
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

    public function loadSubs(Department $department, array $validated): LengthAwarePaginator
    {
        return $department->subs()
            ->with([
                'translatable',
                'creatable',
            ])
            ->orderByDesc('id')
            ->paginate($validated['limit'] ?? 10);
    }

    public function loadRelations(Department $department): void
    {
        $department
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

    public function store(array $validated): Department
    {
        return DB::transaction(static function () use ($validated) {
            $translations = $validated['translations'];
            unset($validated['translations']);

            $department = Department::query()->create([
                'department_id' => $validated['parent_id'] ?? null,
            ]);

            $default = $translations[0];
            foreach ($translations as $translation) {
                $department->setLang('title', $translation['title'] ?? $default['title'], $translation['language_id']);
            }

            $department->saveLang();

            return $department;
        });
    }

    public function update(Department $department, array $validated): Department
    {
        return DB::transaction(static function () use ($department, $validated) {
            $translations = $validated['translations'];
            unset($validated['translations']);

            $department->update([
                'department_id' => $validated['parent_id'] ?? null,
            ]);

            foreach ($translations as $translation) {
                $department->setLang('title', $translation['title'], $translation['language_id']);
            }

            $department->saveLang();

            return $department;
        });
    }

    public function destroy(Department $department): void
    {
        DB::transaction(static function () use ($department) {
            $department->delete();
        });
    }

    public function changeActiveStatus(Department $department): void
    {
        $department->is_active = ! $department->is_active;
        $department->save();
    }
}
