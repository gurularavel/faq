<?php

namespace App\Casts\Faqs;

use App\Models\Faq;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class FilesCast implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param Faq|Model $model
     * @param string $key
     * @param mixed $value
     * @param array $attributes
     * @return array
     */
    public function get(Faq|Model $model, string $key, mixed $value, array $attributes): array
    {
        $files = [];
        $ids = [];

        if ($model->hasMedia('faqs')) {
            foreach ($model->getMedia('faqs') as $media) {
                /** @var Media $media */
                $ids[] = $media->getQueueableId();
                $files[] = [
                    'url' => $media->getUrl(),
                    'mime_type' => $media->mime_type,
                ];
            }
        }

        return [
            'files' => $files,
            'media_ids' => $ids,
        ];
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
