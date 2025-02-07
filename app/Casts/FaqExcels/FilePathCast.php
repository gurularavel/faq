<?php

namespace App\Casts\FaqExcels;

use App\Models\FaqExcel;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

class FilePathCast implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param FaqExcel|Model $model
     * @param string $key
     * @param mixed $value
     * @param array $attributes
     * @return mixed
     */
    public function get(FaqExcel|Model $model, string $key, mixed $value, array $attributes): mixed
    {
        if ($model->hasMedia('faq_excels')) {
            return $model->getFirstMediaPath('faq_excels');
        }

        return null;
    }

    /**
     * Prepare the given value for storage.
     *
     * @param Model $model
     * @param  string  $key
     * @param  mixed  $value
     * @param  array  $attributes
     * @return void
     */
    public function set(Model $model, string $key, mixed $value, array $attributes)
    {

    }
}
