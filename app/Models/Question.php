<?php

namespace App\Models;

use App\Traits\ActionBy;
use App\Traits\ActionUser;
use App\Traits\Translatable;
use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property mixed $id
 * @property mixed $answers
 * @property bool|mixed $is_active
 */
class Question extends Model
{
    use SoftDeletes, ActionBy, ActionUser, Translatable, CascadeSoftDeletes;

    protected $fillable = [
        'uuid',
        'question_group_id',
        'difficulty_level_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected array $cascadeDeletes = ['translatable'];

    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    public function questionGroup(): BelongsTo
    {
        return $this->belongsTo(QuestionGroup::class);
    }

    public function difficultyLevel(): BelongsTo
    {
        return $this->belongsTo(DifficultyLevel::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class);
    }
}
