<?php

namespace App\Models;

use App\Casts\Languages\KeyCast;
use App\Services\LangService;
use App\Traits\ActionBy;
use App\Traits\ActionUser;
use App\Traits\SoftDeleteAcceptable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property bool|mixed $is_active
 */
class Language extends Model
{
    use SoftDeletes, ActionBy, ActionUser, SoftDeleteAcceptable;

    protected $fillable = [
        'key', // len 2
        'title',
        'is_active',
    ];

    protected $casts = [
        'key' => KeyCast::class,
        'is_active' => 'boolean',
    ];

    protected array $softDeleteAcceptableRelations = ['translations', 'modelTranslations'];

    public static function boot(): void
    {
        parent::boot();
        static::saved(static function () {
            LangService::instance()->setLanguagesCache();
        });
        static::deleted(static function () {
            LangService::instance()->setLanguagesCache();
        });
    }

    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    public function translations(): HasMany
    {
        return $this->hasMany(Translation::class);
    }

    public function modelTranslations(): HasMany
    {
        return $this->hasMany(ModelTranslation::class);
    }
}
