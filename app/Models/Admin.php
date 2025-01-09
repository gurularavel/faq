<?php

namespace App\Models;

use App\Traits\ActionBy;
use App\Traits\ActionUser;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property mixed $token
 * @method createToken(string $deviceType, string[] $array)
 */
class Admin extends Authenticatable
{
    use HasApiTokens, Notifiable, HasRoles, SoftDeletes, ActionBy, ActionUser;

    protected $fillable = [
        'username',
        'email',
        'password',
        'name',
        'surname',
    ];

    protected $casts = [
        'password' => 'hashed',
    ];

    protected $hidden = [
        'password',
    ];
}
