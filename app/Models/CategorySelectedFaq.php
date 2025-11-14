<?php

namespace App\Models;

use App\Traits\ActionBy;
use App\Traits\ActionUser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CategorySelectedFaq extends Model
{
    use SoftDeletes, ActionBy, ActionUser;

    protected $fillable = [
        'faq_id',
        'category_id', // sub or parent category id
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function faq(): BelongsTo
    {
        return $this->belongsTo(Faq::class);
    }
}
