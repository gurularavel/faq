<?php

namespace App\Repositories;

use App\Models\Admin;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class AdminRepository
{
    public function load(array $validated): LengthAwarePaginator
    {
        return Admin::query()
            ->with([
                'creatable',
                'roles',
            ])
            ->orderByDesc('id')
            ->paginate($validated['limit'] ?? 10);
    }

    public function show(Admin $admin): void
    {
        $admin->load([
            'roles',
        ]);
    }

    public function store(array $validated): Admin
    {
        $roles = $validated['roles'] ?? [];
        unset($validated['roles']);

        return DB::transaction(static function () use ($validated, $roles) {
            $admin = Admin::query()->create($validated);

            $admin->roles()->sync($roles);

            return $admin;
        });
    }

    public function update(Admin $admin, array $validated): Admin
    {
        $roles = $validated['roles'] ?? [];
        unset($validated['roles']);

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        return DB::transaction(static function () use ($validated, $roles, $admin) {
            $admin->update($validated);

            $admin->roles()->sync($roles);
        });
    }

    public function destroy(Admin $admin): void
    {
        $admin->delete();
    }
}
