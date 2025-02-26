<?php

namespace App\Models;

use App\Traits\ActionBy;
use App\Traits\ActionUser;
use App\Traits\Translatable;
use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;

/**
 * @property bool|mixed $is_active
 * @property mixed $id
 * @property mixed $seen_count
 * @property mixed $tags
 */
class Faq extends Model
{
    use SoftDeletes, ActionBy, ActionUser, Translatable, CascadeSoftDeletes, Searchable;

    protected $fillable = [
        'category_id', // sub category id
        'seen_count',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'seen_count' => 'integer',
    ];

    protected array $cascadeDeletes = ['translatable', 'tags', 'lists'];

    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    public function isActive()
    {
        return $this->is_active;
    }

    public function toSearchableArray(): array
    {
        $translation = $this->translatable()
            //->where('language_id', LangService::instance()->getCurrentLangId())
            ->pluck('text')
            ->implode(' ');

        $tagTitles = $this->tags
            ->pluck('title')
            ->implode(' ');

        return [
            'id' => $this->id,
            'content' => $translation,
            'tags' => $tagTitles,
        ];
    }

    public function makeAllSearchableUsing($query)
    {
        return $query->with('translatable');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, FaqTag::class);
    }

    public function faqExcel(): BelongsTo
    {
        return $this->belongsTo(FaqExcel::class);
    }

    public function lists(): HasMany
    {
        return $this->hasMany(FaqList::class);
    }
}
