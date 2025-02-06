<?php

namespace App\Repositories;

use App\Models\Tag;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class TagRepository
{
    public function load(array $validated): LengthAwarePaginator
    {
        return Tag::query()
            ->with([
                'creatable',
            ])
            ->when($validated['search'] ?? null, function (Builder $builder) use ($validated) {
                $builder->whereLike('title', '%' . $validated['search'] . '%');
            })
            ->orderByDesc('id')
            ->paginate($validated['limit'] ?? 10);
    }

    public function list(): Collection
    {
        return Tag::query()->orderBy('title')->get();
    }

    public function loadRelations(Tag $tag): void
    {
        $tag
            ->load([
                'creatable',
            ]);
    }

    public function findByTitle(string $title): Collection
    {
        return Tag::query()->whereLike('title', '%' . $title . '%')->orderBy('title')->get();
    }

    public function store(array $validated): Tag
    {
        return DB::transaction(static function () use ($validated) {
            return Tag::query()->create($validated);
        });
    }

    public function update(Tag $tag, array $validated): Tag
    {
        return DB::transaction(static function () use ($validated, $tag) {
            $tag->update($validated);

            return $tag;
        });
    }

    public function destroy(Tag $tag): void
    {
        DB::transaction(static function () use ($tag) {
            $tag->delete();
        });
    }

    public function changeActiveStatus(Tag $tag): void
    {
        $tag->is_active = ! $tag->is_active;
        $tag->save();
    }
}
