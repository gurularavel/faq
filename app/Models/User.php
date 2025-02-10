<?php

namespace App\Models;

use App\Traits\ActionBy;
use App\Traits\ActionUser;
use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property bool|mixed $is_active
 * @property mixed $email
 * @property mixed|string $token
 * @property mixed $accountexpires
 * @property mixed $id
 * @property Department|mixed $department
 */
class User extends Authenticatable
{
    use HasApiTokens, Notifiable, SoftDeletes, ActionBy, ActionUser, CascadeSoftDeletes;

    protected $fillable = [
        'name',
        'surname',
        'email',
        'department_id',
        'is_active',
        // LDAP data
        'samaccountname',
        'objectguid',
        'displayname',
        'distinguishedname',
        'lastlogon',
        'accountexpires',
    ];

    protected array $cascadeDeletes = ['questionGroupsRel'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    public function isActive(): bool
    {
        return $this->is_active;
    }

    public function isExpired(): bool
    {
        // Check for "never expires" values:
        if ($this->accountexpires === null || $this->accountexpires == 0 || $this->accountexpires == 9223372036854775807) {
            return false;
        }

        // Convert FILETIME to Unix epoch:
        // 1) Divide by 10 million to get seconds from 1601
        // 2) Subtract 11644473600 to convert to seconds from 1970
        $expiresAtUnix = ($this->accountexpires / 10000000) - 11644473600;

        $nowUnix = time(); // current Unix time in seconds

        $secondsRemaining = $expiresAtUnix - $nowUnix;

        if ($secondsRemaining < 0) {
            return true;
        }

        return false;
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function questionGroups(): BelongsToMany
    {
        return $this->belongsToMany(QuestionGroup::class, QuestionGroupUser::class);
    }

    public function questionGroupsRel(): HasMany
    {
        return $this->hasMany(QuestionGroupUser::class);
    }

    public function notifications(): BelongsToMany
    {
        return $this->belongsToMany(Notification::class, NotificationUser::class);
    }

    public function notificationsRel(): HasMany
    {
        return $this->hasMany(NotificationUser::class);
    }
}
