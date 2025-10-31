<?php

namespace App\Models;

use App\Traits\ActionBy;
use App\Traits\ActionUser;
use App\Traits\Translatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class FaqArchive extends Model
{
    use SoftDeletes, ActionBy, ActionUser, Translatable;

    protected $fillable = [
        'faq_id',
    ];

    public function faq(): BelongsTo
    {
        return $this->belongsTo(Faq::class);
    }
}
