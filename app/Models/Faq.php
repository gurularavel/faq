<?php

namespace App\Models;

use App\Casts\Faqs\FilesCast;
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
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

/**
 * @property bool|mixed $is_active
 * @property mixed $id
 * @property mixed $seen_count
 * @property mixed $tags
 * @property mixed $category_id
 * @property mixed $category
 */
class Faq extends Model implements HasMedia
{
    use SoftDeletes, ActionBy, ActionUser, Translatable, CascadeSoftDeletes, InteractsWithMedia;

    protected $fillable = [
        'category_id', // sub category id
        'seen_count',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'seen_count' => 'integer',
        'files' => FilesCast::class,
    ];

    protected array $cascadeDeletes = ['translatable', 'tags', 'lists'];

    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    public function isActive()
    {
        return $this->is_active ?? true;
    }

    public function toSearchableArray(): array
    {
        $translation = $this->relationLoaded('translatable')
            ? $this->translatable->pluck('text')->implode(' ')
            : $this->translatable()->pluck('text')->implode(' ');

        $tagTitles = $this->relationLoaded('tags')
            ? $this->tags->pluck('title')->implode(' ')
            : $this->tags()->pluck('title')->implode(' ');

        return [
            'id' => $this->id,
            'content' => $translation,
            'tags' => $tagTitles,
        ];
    }

    public function makeAllSearchableUsing($query)
    {
        return $query->with(['translatable', 'tags']);
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

    public function seenLogs(): HasMany
    {
        return $this->hasMany(FaqSeenLog::class);
    }
}
