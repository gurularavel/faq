<?php

namespace App\Models;

use App\Traits\ActionBy;
use App\Traits\ActionUser;
use App\Traits\SoftDeleteAcceptable;
use App\Traits\Translatable;
use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DifficultyLevel extends Model
{
    use SoftDeletes, ActionBy, ActionUser, Translatable, CascadeSoftDeletes, SoftDeleteAcceptable;

    protected $fillable = [
        'updated_at',
    ];

    protected array $cascadeDeletes = ['translatable'];

    protected array $softDeleteAcceptableRelations = ['questions'];

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }
}
