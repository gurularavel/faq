<?php

namespace App\Models;

use App\Traits\ActionBy;
use App\Traits\ActionUser;
use App\Traits\Translatable;
use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property array|mixed $translations
 * @property bool|mixed $is_active
 * @method static active()
 */
class Department extends Model
{
    use SoftDeletes, ActionBy, ActionUser, Translatable, CascadeSoftDeletes;

    protected $fillable = [
        'department_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected array $cascadeDeletes = ['subs', 'translatable', 'questionGroupsRel'];

    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    public function scopeParents(Builder $query): void
    {
        $query->whereNull('department_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function subs(): HasMany
    {
        return $this->hasMany(Department::class, 'department_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function questionGroups(): BelongsToMany
    {
        return $this->belongsToMany(QuestionGroup::class, QuestionGroupDepartment::class);
    }

    public function questionGroupsRel(): HasMany
    {
        return $this->hasMany(QuestionGroupDepartment::class);
    }
}
