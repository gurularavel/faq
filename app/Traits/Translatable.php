<?php

namespace App\Traits;

use App\Models\ModelTranslation;
use App\Services\LangService;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * @method morphMany(string $class, string $string)
 * @property mixed $translatable
 */
trait Translatable
{
//    protected $with = ['translatable'];

    private array $translatable_fields = [];

    public function translatable(): MorphMany
    {
        return $this->morphMany(ModelTranslation::class, 'translatable');
    }

    public function getLang(string $column): string
    {
        $default = $this->translatable_fields[$column][LangService::instance()->getCurrentLangId()] ?? null;

        if ($default !== null) {
            return $default;
        }

        $text = $this->translatable
            ->where('language_id', LangService::instance()->getCurrentLangId())
            ->where('column', $column)
            ->select('text')
            ->first()['text'] ?? null;

        return $text ?? $this->translatable
            ->where('language_id', LangService::instance()->getDefaultLangId())
            ->where('column', $column)
            ->select('text')
            ->first()['text'] ?? ('__' . $this->table . '__' . $column . '__' . LangService::instance()->getCurrentLang());
    }

    public function setLang(string $column, string $text, int $language_id = null): static
    {
        $this->translatable_fields[$column][$language_id ?? LangService::instance()->getDefaultLangId()] = $text;

        return $this;
    }

    public function saveLang(): static
    {
        if (count($this->translatable_fields)) {
            foreach ($this->translatable_fields as $column => $field) {
                foreach ($field as $lang => $text) {
                    $this->translatable()->updateOrCreate(
                        [
                            'language_id' => $lang,
                            'column' => $column,
                        ],
                        [
                            'text' => $text,
                        ]
                    );
                }
            }

            $this->touch();
        }

        return $this;
    }

    protected function translations(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->relationLoaded('translatable')) {
                    $this->load('translatable');
                }

                $translates = $this->translatable->groupBy('language_id');

                $data = [];

                foreach ($translates as $lang_id => $translate) {
                    $d = [
                        'language_id' => $lang_id,
                    ];

                    foreach ($translate as $tr) {
                        $d[$tr->column] = $tr->text;
                    }

                    $data[] = $d;
                }

                return $data;
            },
        );
    }
}
