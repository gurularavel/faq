<?php

namespace App\Rules;

use App\Services\LangService;
use Closure;
use Illuminate\Contracts\Validation\ImplicitRule;

class FirstTranslationRequired implements ImplicitRule
{
    private string $attributeName;

    public function __construct(string $attributeName)
    {
        $this->attributeName = $attributeName;
    }

    public function passes($attribute, $value): bool
    {
        if ($attribute === 'translations.0.' . $this->attributeName && (blank($value) || !is_string($value))) {
            return false;
        }

        return true;
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message(): string
    {
        return LangService::instance()
            ->setDefault('The @attribute field is required for the first translation.')
            ->getLang('translation_first_language_field_is_required', [
                '@attribute' => $this->attributeName,
            ]);
    }
}
