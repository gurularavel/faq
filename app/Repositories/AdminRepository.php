<?php

namespace App\Repositories;

use App\Models\Admin;
use App\Services\LangService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class AdminRepository
{
    public function load(array $validated): LengthAwarePaginator
    {
        return Admin::query()
            ->with([
                'creatable',
                'roles',
            ])
            ->when($validated['search'] ?? null, function (Builder $builder) use ($validated) {
                $builder->where(function (Builder $builder) use ($validated) {
                    $builder->whereLike('name', '%' . $validated['search'] . '%');
                    $builder->orWhereLike('surname', '%' . $validated['search'] . '%');
                    $builder->orWhereLike('email', '%' . $validated['search'] . '%');
                    $builder->orWhereLike('username', '%' . $validated['search'] . '%');
                });
            })
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
        if ($admin->id === 1) {
            throw new BadRequestHttpException(
                LangService::instance()
                    ->setDefault('You cannot delete the super admin!')
                    ->getLang('you_cannot_delete_the_super_admin')
            );
        }

        DB::transaction(static function () use ($admin) {
            $admin->delete();
        });
    }
}
