<?php

namespace App\Casts\FaqExports;

use App\Models\FaqExport;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

class FileCast implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param FaqExport|Model $model
     * @param string $key
     * @param mixed $value
     * @param array $attributes
     * @return mixed
     */
    public function get(FaqExport|Model $model, string $key, mixed $value, array $attributes): mixed
    {
        if ($model->hasMedia('faq_exports')) {
            return $model->getFirstMediaUrl('faq_exports');
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
     * @return bool
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): bool
    {
        return false;
    }
}
