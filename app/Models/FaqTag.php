<?php

namespace App\Models;

use App\Traits\ActionBy;
use App\Traits\ActionUser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FaqTag extends Model
{
    use SoftDeletes, ActionBy, ActionUser;
}
