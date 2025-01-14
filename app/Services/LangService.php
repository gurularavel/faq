<?php

namespace App\Services;

use App\Enum\TranslationGroupEnum;
use App\Models\Language;
use App\Models\Translation;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class LangService
{
    private static ?LangService $instance = null;

    private array $localTranslations;

    private string $group;
    private ?string $language;
    private ?string $default;
    private bool $setDefaultEnable;
    private bool $cacheEnable;
    private bool $hasUserLang;
    private string $defaultLang;

    private string $cacheLanguageKey;
    private string $cacheTranslationsKey;
    private ?array $languagesData = null;

    private function __construct() {
        $this->setDefaultEnable = config('language.set_default_enable');
        $this->cacheEnable = config('language.cache_enable');
        $this->hasUserLang = config('language.has_user_lang');
        $this->defaultLang = config('language.default_lang');
        $this->cacheLanguageKey = config('language.cache_language_key');
        $this->cacheTranslationsKey = config('language.cache_translations_key');

        $this->group = TranslationGroupEnum::ALL->value;
        $this->default = null;
        $this->language = null;
        $this->localTranslations = [];
    }

    public static function instance(): LangService
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function setGroup(string $group): static
    {
        $this->group = $group;

        return $this;
    }

    public function setLanguage(string $language): static
    {
        $this->language = $language;

        return $this;
    }

    public function setDefault(string $default): static
    {
        $this->default = $default;

        return $this;
    }

    public function getDefaultLang(): string
    {
        return $this->defaultLang;
    }

    public function getDefaultLangId()
    {
        return $this->getLangIdByKey($this->defaultLang);
    }

    public function getCurrentLang()
    {
        $lang = $this->language;

        if ($lang === null) {
            $header_lang = strtolower(request()?->header('Accept-Language', ''));

            $user_lang = null;

            if ($this->hasUserLang) {
                $user_lang = auth()->user()->lang ?? null;
            }

            $lang = $user_lang ?? (in_array($header_lang, data_get($this->getLanguages(), '*.key'), true) ? $header_lang : $this->defaultLang);
        }

        return $lang;
    }

    public function getCurrentLangId()
    {
        return $this->getLangIdByKey($this->getCurrentLang());
    }

    // main method
    public function getLang($key, $replace = [])
    {
        $lang = $this->getCurrentLang();

        $translations = $this->getTranslations($lang);

        if (isset($translations[$key])) {
            $text = $translations[$key];
        } else if ($this->setDefaultEnable && $this->default) {
            $text = $this->setDefaultTranslation($key);
        } else {
            $text = ('_' . $key);
        }

        if (count($replace) > 0) {
            $text = str_replace(array_keys($replace), array_values($replace), $text);
        }

        return $text;
    }

    public function setDefaultTranslation(string $key, bool $setTranslationsCache = false): ?string
    {
        $languages = $this->getLanguages();

        foreach ($languages as $language) {
            Translation::query()
                ->firstOrCreate(
                    [
                        'group' => $this->group,
                        'language_id' => $language['id'],
                        'key' => $key,
                    ],
                    [
                        'text' => $this->default,
                    ]
                );
        }

        if ($setTranslationsCache) {
            $this->setTranslationsCache($this->group, data_get($languages, '*.key'), false);
        }

        return $this->default;
    }

    private function getTranslations($lang): array
    {
        if (isset($this->localTranslations[$lang]) && is_array($this->localTranslations[$lang])) {
            return $this->localTranslations[$lang];
        }

        if ($this->cacheEnable) {
            $data = json_decode($this->getTranslationsCache($this->group, $lang), true);

            if (!isset($this->localTranslations[$lang]) || !is_array($this->localTranslations[$lang])) {
                $this->localTranslations[$lang] = $data;
            }

            return $this->localTranslations[$lang];
        }

        return $this->getTranslationsData($this->group, $lang);
    }

    private function getTranslationsData(string $group, string $lang): array
    {
        $translations = Translation::query()
            ->leftJoin('languages', 'translations.language_id', '=', 'languages.id')
            ->when($group !== 'all', function ($query) use ($group) {
                $query->where('translations.group', $group);
            })
            ->where(DB::raw('LOWER(languages.key)'), strtolower($lang))
            ->select(['translations.key', 'translations.text'])
            ->orderBy('translations.id')
            ->get();

        if (count($translations) === 0) {
            return [];
        }

        $translations_arr = [];
        foreach ($translations as $translation) {
            $translations_arr[$translation->key] =  $translation->text;
        }

        $this->localTranslations[$lang] = $translations_arr;

        return $this->localTranslations[$lang];
    }

    private function getTranslationsCache(string $group, string $lang)
    {
        $cache = Cache::get($this->cacheTranslationsKey . '_' . $group . '_' . $lang);
        $decodedCache = json_decode($cache, true);

        if (empty($decodedCache) || count($decodedCache) === 0) {
            $this->setTranslationsCache($group, $lang);

            return Cache::get($this->cacheTranslationsKey . '_' . $group . '_' . $lang);
        }

        return $cache;
    }

    public function setTranslationsCache(string $group, string|array|int $language, bool $changeTranslationVersion = true): void
    {
        if (is_array($language)) {
            $langs = $language;
        } else if (is_int($language)) {
            $langs[0] = $this->getLangKeyById($language);
        } else {
            $langs[0] = $language;
        }

        foreach ($langs as $lang) {
            $lang = strtolower($lang);

            $this->clearCache($this->cacheTranslationsKey . '_' . $group . '_' . $lang);

            Cache::rememberForever($this->cacheTranslationsKey . '_' . $group . '_' . $lang, function () use ($group, $lang) {
                return json_encode($this->getTranslationsData($group, $lang));
            });
        }

        if ($changeTranslationVersion) {
            $this->changeTranslationVersion();
        }
    }

    public function getLanguages(): array
    {
        if ($this->languagesData) {
            return $this->languagesData;
        }

        $this->languagesData = $this->cacheEnable
            ? json_decode($this->getLanguagesCache(), true)
            : $this->getLanguagesData();

        return $this->languagesData;
    }

    public function getLangKeyById(int $id)
    {
        $languages = collect($this->getLanguages());
        $language = $languages->where('id', $id)->first();

        return $language['key'] ?? null;
    }

    public function getLangIdByKey(string $key)
    {
        $languages = collect($this->getLanguages());
        $language = $languages->where('key', $key)->first();

        return $language['id'] ?? null;
    }

    private function getLanguagesData(): array
    {
        return Language::query()->active()->select(['id', 'key'])->get()?->toArray() ?? [];
    }

    private function clearCache(string $key): void
    {
        if (Cache::has($key)) {
            LoggerService::instance()->log("Cache cleared:", ['key' => $key], true);

            Cache::forget($key);
        }
    }

    private function getLanguagesCache()
    {
        $cache = Cache::get($this->cacheLanguageKey);

        return $cache ?? $this->setLanguagesCache();
    }

    public function setLanguagesCache()
    {
        $this->clearCache($this->cacheLanguageKey);

        return Cache::rememberForever($this->cacheLanguageKey, function () {
            return json_encode($this->getLanguagesData());
        });
    }

    public function getStaticTranslations(): array
    {
        return $this->getTranslations($this->language);
    }

    public function changeTranslationVersion(): void
    {
        $versionsArr = [];

        $versions_json = $this->getVersionsJson();

        if ($versions_json) {
            $versions = json_decode($versions_json, true);

            if (is_array($versions)) {
                $versionsArr = $versions;
            }
        }

        $versionsArr['lang_version'] = ($versionsArr['lang_version'] ?? 0) + 1;
        $versionsArr['default_lang'] = config('language.default_lang');

        Storage::disk('public')->put('versions.json', json_encode($versionsArr));
    }

    public function getVersionsJson(): ?string
    {
        return Storage::disk('public')->get('versions.json');
    }

    public function getVersion(): int
    {
        $version = 0;

        $versionsJson = $this->getVersionsJson();

        if ($versionsJson) {
            $versions = json_decode($versionsJson, true);

            if (is_array($versions)) {
                $version = $versions['lang_version'] ?? 0;
            }
        }

        return $version;
    }

    public function getLanguageByKey(string $lang)
    {
        return Language::query()->where('key', $lang)->firstOrFail();
    }
}
