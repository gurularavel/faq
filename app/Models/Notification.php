<?php

namespace App\Models;

use App\Traits\ActionBy;
use App\Traits\ActionUser;
use App\Traits\Translatable;
use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property mixed $departmentsRel
 * @property mixed $usersRel
 */
class Notification extends Model
{
    use SoftDeletes, ActionBy, ActionUser, Translatable, CascadeSoftDeletes;

    protected $fillable = [
        // message from translatable
        'type', // NotificationTypeEnum
        'typeable_id',
        'typeable_type',
    ];

    protected array $cascadeDeletes = ['translatable', 'usersRel', 'departmentsRel', 'reads'];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, NotificationUser::class);
    }

    public function usersRel(): HasMany
    {
        return $this->hasMany(NotificationUser::class);
    }

    public function typeable(): MorphTo
    {
        return $this->morphTo('typeable');
    }
}
