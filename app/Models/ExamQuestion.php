<?php

namespace App\Models;

use App\Traits\ActionBy;
use App\Traits\ActionUser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property mixed $sent_date
 * @property mixed $question
 * @property mixed $end_date
 * @property mixed $answer_id
 * @property mixed $answered_at
 * @property mixed $is_correct
 * @property int|mixed $point
 */
class ExamQuestion extends Model
{
    use SoftDeletes, ActionBy, ActionUser;

    protected $fillable = [
        'exam_id',
        'question_id',
        'sent_date', // nullable
        'end_date', // nullable
        'answer_id', // nullable
        'answered_at', // nullable
        'is_correct', // default: false
        'point', // default: 0
    ];

    protected $casts = [
        'end_date' => 'datetime',
        'sent_date' => 'datetime',
        'answered_at' => 'datetime',
        'is_correct' => 'boolean',
        'point' => 'integer',
    ];

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    public function answer(): BelongsTo
    {
        return $this->belongsTo(Answer::class);
    }
}
