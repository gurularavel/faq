<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class UserRepository
{
    public function load(array $validated): LengthAwarePaginator
    {
        return User::query()
            ->with([
                'creatable',
                'department',
                'department.translatable',
                'department.parent',
                'department.parent.translatable',
            ])
            ->orderByDesc('id')
            ->paginate($validated['limit'] ?? 10);
    }

    public function list(): Collection
    {
        return User::query()->select(['id', 'name', 'surname'])->orderBy('name')->get();
    }

    public function loadRelations(User $user): void
    {
        $user
            ->load([
                'creatable',
                'department',
                'department.translatable',
                'department.parent',
                'department.parent.translatable',
            ]);
    }

    public function store(array $validated): User
    {
        return DB::transaction(static function () use ($validated) {
            return User::query()->create($validated);
        });
    }

    public function update(User $user, array $validated): User
    {
        return DB::transaction(static function () use ($validated, $user) {
            $user->update($validated);

            return $user;
        });
    }

    public function destroy(User $user): void
    {
        DB::transaction(static function () use ($user) {
            $user->delete();
        });
    }

    public function changeActiveStatus(User $user): void
    {
        $user->is_active = !$user->is_active;
        $user->save();
    }
}
