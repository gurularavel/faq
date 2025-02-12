<?php

namespace App\Models;

use App\Casts\Users\ImageCast;
use App\Traits\ActionBy;
use App\Traits\ActionUser;
use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

/**
 * @property bool|mixed $is_active
 * @property mixed $email
 * @property mixed|string $token
 * @property mixed $accountexpires
 * @property mixed $id
 * @property Department|mixed $department
 * @property mixed $last_login_at
 */
class User extends Authenticatable implements HasMedia
{
    use HasApiTokens, Notifiable, SoftDeletes, ActionBy, ActionUser, CascadeSoftDeletes, InteractsWithMedia;

    protected $fillable = [
        'name',
        'surname',
        'email',
        'department_id',
        'is_active',
        'last_login_at', // nullable
        // LDAP data
        'samaccountname',
        'objectguid',
        'displayname',
        'distinguishedname',
        'lastlogon',
        'accountexpires',
    ];

    protected array $cascadeDeletes = ['questionGroupsRel', 'media', 'notificationsRel'];

    protected $casts = [
        'is_active' => 'boolean',
        'last_login_at' => 'datetime',
        'image' => ImageCast::class,
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('profiles')->singleFile();
    }

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
        return $this->belongsToMany(QuestionGroup::class, Exam::class);
    }

    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class);
    }

    public function questions(): HasManyThrough
    {
        return $this->hasManyThrough(
            ExamQuestion::class,
            Exam::class,
            'user_id',
            'exam_id',
            'id',
            'id'
        );
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
