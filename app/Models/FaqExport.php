<?php

namespace App\Models;

use App\Casts\FaqExports\FileCast;
use App\Traits\ActionBy;
use App\Traits\ActionUser;
use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

/**
 * @property mixed $id
 * @property mixed $status
 * @property mixed $uuid
 */
class FaqExport extends Model implements HasMedia
{
    use SoftDeletes, ActionBy, ActionUser, InteractsWithMedia, CascadeSoftDeletes;

    protected $fillable = [
        'uuid',
        'language_id',
        'status',
        'last_status_at',
        'messages',
        'downloaded_at',
    ];

    protected $casts = [
        'last_status_at' => 'datetime',
        'messages' => 'array',
        'downloaded_at' => 'datetime',
        'file' => FileCast::class,
    ];

    protected array $cascadeDeletes = ['media'];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('faq_exports')->singleFile();
    }

    public function language(): BelongsTo
    {
        return $this->belongsTo(Language::class);
    }
}
