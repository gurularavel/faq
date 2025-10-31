<?php

namespace App\Models;

use App\Casts\Categories\IconCast;
use App\Traits\ActionBy;
use App\Traits\ActionUser;
use App\Traits\SoftDeleteAcceptable;
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
 * @property array|mixed $translations
 * @property bool|mixed $is_active
 * @property mixed $id
 * @property mixed $category_id
 * @method static active()
 */
class Category extends Model implements HasMedia
{
    use SoftDeletes, ActionBy, ActionUser, Translatable, CascadeSoftDeletes, SoftDeleteAcceptable, InteractsWithMedia;

    protected $fillable = [
        'slug',
        'category_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'icon' => IconCast::class,
    ];

    protected array $cascadeDeletes = ['subs', 'translatable', 'media'];

    protected array $softDeleteAcceptableRelations = ['faqs'];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('categories')->singleFile();
    }

    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    public function scopeParents(Builder $query): void
    {
        $query->whereNull('category_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function subs(): HasMany
    {
        return $this->hasMany(Category::class, 'category_id');
    }

    public function mainFaqs(): HasMany
    {
        return $this->hasMany(Faq::class);
    }

    public function faqExcel(): BelongsTo
    {
        return $this->belongsTo(FaqExcel::class);
    }

    public function faqs(): BelongsToMany
    {
        return $this->belongsToMany(Faq::class, FaqCategory::class);
    }

    public function faqsRel(): HasMany
    {
        return $this->hasMany(FaqCategory::class);
    }
}
