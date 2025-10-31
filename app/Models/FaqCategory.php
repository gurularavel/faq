<?php

namespace App\Models;

use App\Traits\ActionBy;
use App\Traits\ActionUser;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property mixed $is_selected
 */
class FaqCategory extends Model
{
    use SoftDeletes, ActionBy, ActionUser;

    protected $fillable = [
        'faq_id',
        'category_id', // sub category id
        'is_selected',
    ];

    protected $casts = [
        'is_selected' => 'boolean',
    ];

    public function isSelected(): bool
    {
        return $this->is_selected;
    }

    public function scopeSelected(Builder $query): void
    {
        $query->where('is_selected', true);
    }
}
