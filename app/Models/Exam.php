<?php

namespace App\Models;

use App\Traits\ActionBy;
use App\Traits\ActionUser;
use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property mixed $start_date
 * @property mixed $end_date
 * @property mixed $user_id
 * @property mixed $questionGroup
 * @property mixed $id
 * @property mixed $questions
 * @property mixed|string $is_started
 */
class Exam extends Model
{
    use SoftDeletes, ActionBy, ActionUser, CascadeSoftDeletes;

    protected $fillable = [
        'question_group_id',
        'user_id',
        'is_started',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public const QUESTION_TIME_SECONDS = 180;
    public const CORRECT_ANSWER_POINT = 1;

    public function isStarted(): bool
    {
        return $this->start_date !== null;
    }

    public function isEnded(): bool
    {
        return $this->end_date !== null;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function questionGroup(): BelongsTo
    {
        return $this->belongsTo(QuestionGroup::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(ExamQuestion::class);
    }
}
