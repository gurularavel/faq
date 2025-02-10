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

class Notification extends Model
{
    use SoftDeletes, ActionBy, ActionUser, Translatable, CascadeSoftDeletes;

    protected $fillable = [
        // message from translatable
        'type', // NotificationTypeEnum
    ];

    protected array $cascadeDeletes = ['translatable', 'usersRel', 'departmentsRel', 'reads'];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, NotificationUser::class);
    }

    public function departments(): BelongsToMany
    {
        return $this->belongsToMany(Department::class, NotificationDepartment::class);
    }

    public function usersRel(): HasMany
    {
        return $this->hasMany(NotificationUser::class);
    }

    public function departmentsRel(): HasMany
    {
        return $this->hasMany(NotificationDepartment::class);
    }

    public function typeable(): MorphTo
    {
        return $this->morphTo('typeable');
    }

    public function reads(): HasMany
    {
        return $this->hasMany(NotificationRead::class);
    }

    public function readUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, NotificationRead::class, 'notification_id', 'user_id');
    }
}
