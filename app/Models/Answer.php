<?php

namespace App\Models;

use App\Traits\ActionBy;
use App\Traits\ActionUser;
use App\Traits\Translatable;
use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property mixed $is_correct
 */
class Answer extends Model
{
    use SoftDeletes, ActionBy, ActionUser, Translatable, CascadeSoftDeletes;

    protected $fillable = [
        'uuid',
        'question_id',
        'is_correct',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
    ];

    protected array $cascadeDeletes = ['translatable'];

    public function scopeCorrect(Builder $query): void
    {
        $query->where('is_correct', true);
    }

    public function isCorrect(): bool
    {
        return $this->is_correct;
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
