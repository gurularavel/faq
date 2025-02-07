<?php

namespace App\Models;

use App\Casts\FaqExcels\FileCast;
use App\Casts\FaqExcels\FileInfoCast;
use App\Casts\FaqExcels\FilePathCast;
use App\Traits\ActionBy;
use App\Traits\ActionUser;
use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

/**
 * @property mixed $file
 * @property mixed $file_info
 * @property array|mixed $messages
 * @property mixed|string $status
 * @property mixed $id
 * @property mixed $file_path
 * @property mixed $faqs
 * @property mixed $categories
 */
class FaqExcel extends Model implements HasMedia
{
    use SoftDeletes, ActionBy, ActionUser, InteractsWithMedia, CascadeSoftDeletes;

    protected $fillable = [
        'status', // enum
        'messages',
    ];

    protected $casts = [
        'file' => FileCast::class,
        'file_info' => FileInfoCast::class,
        'file_path' => FilePathCast::class,
        'messages' => 'array',
    ];

    protected array $cascadeDeletes = ['media'];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('faq_excels')->singleFile();
    }

    public function faqs(): HasMany
    {
        return $this->hasMany(Faq::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }
}
