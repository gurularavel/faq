<?php

namespace App\Models;

use App\Traits\ActionBy;
use App\Traits\ActionUser;
use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property bool|mixed $is_active
 */
class User extends Authenticatable
{
    use HasApiTokens, Notifiable, SoftDeletes, ActionBy, ActionUser, CascadeSoftDeletes;

    protected $fillable = [
        'name',
        'surname',
        'email',
        'department_id',
    ];

    protected array $cascadeDeletes = ['questionGroupsRel'];

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
}
