<?php

namespace App\Models;

use App\Traits\ActionBy;
use App\Traits\ActionUser;
use App\Traits\SoftDeleteAcceptable;
use App\Traits\Translatable;
use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property array|mixed $translations
 * @property bool|mixed $is_active
 * @method static active()
 */
class Category extends Model
{
    use SoftDeletes, ActionBy, ActionUser, Translatable, CascadeSoftDeletes, SoftDeleteAcceptable;

    protected $fillable = [
        'category_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected array $cascadeDeletes = ['subs', 'translatable'];

    protected array $softDeleteAcceptableRelations = ['faqs'];

    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function subs(): HasMany
    {
        return $this->hasMany(Category::class, 'category_id');
    }

    public function faqs(): HasMany
    {
        return $this->hasMany(Faq::class);
    }
}
