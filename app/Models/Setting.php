<?php

namespace App\Models;

use App\Services\LangService;
use App\Traits\ActionBy;
use App\Traits\ActionUser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class Setting extends Model
{
    use SoftDeletes, ActionBy, ActionUser;

    protected $fillable = [
        'key',
        'value',
        'for_system',
    ];

    protected $casts = [
        'for_system' => 'boolean',
    ];

    public static function boot(): void
    {
        parent::boot();
        static::deleting(static function ($model) {
            if ($model->forSystem()) {
                throw new BadRequestHttpException(
                    LangService::instance()
                        ->setDefault('You cannot delete system settings!')
                        ->getLang('you_cannot_delete_system_settings')
                );
            }
        });
    }

    public function scopeForSystem($query): void
    {
        $query->where('for_system', true);
    }
}
