<?php

namespace App\Models;

use App\Traits\ActionBy;
use App\Traits\ActionUser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class FaqSeenLog extends Model
{
    use SoftDeletes, ActionBy, ActionUser;

    protected $fillable = [
        'faq_id',
        'user_id',
    ];

    public function faq(): BelongsTo
    {
        return $this->belongsTo(Faq::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
