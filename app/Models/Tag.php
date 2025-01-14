<?php

namespace App\Models;

use App\Traits\ActionBy;
use App\Traits\ActionUser;
use App\Traits\SoftDeleteAcceptable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property bool|mixed $is_active
 */
class Tag extends Model
{
    use SoftDeletes, ActionBy, ActionUser, SoftDeleteAcceptable;

    protected $fillable = [
        'title',
    ];

    protected array $softDeleteAcceptableRelations = ['faqs'];

    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    public function faqs(): BelongsToMany
    {
        return $this->belongsToMany(Faq::class, FaqTag::class);
    }
}
