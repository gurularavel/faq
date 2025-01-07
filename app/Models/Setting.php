<?php

namespace App\Models;

use App\Traits\ActionBy;
use App\Traits\ActionUser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @method forSystem()
 * @property mixed $for_system
 */
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

    public function scopeForSystem($query): void
    {
        $query->where('for_system', true);
    }

    public function isForSystem()
    {
        return $this->for_system;
    }
}
