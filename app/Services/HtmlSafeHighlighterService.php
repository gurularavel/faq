<?php

namespace App\Services;

class HtmlSafeHighlighterService
{
    private static ?self $instance = null;

    public static function instance(): HtmlSafeHighlighterService
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function highlight(string $html, ?string $term): string
    {
        if (empty($term) || empty($html)) {
            return $html;
        }

        $pattern = sprintf('/(>[^<]*)?(%s)([^<]*<)?/iu', preg_quote($term, '/'));

        return preg_replace_callback($pattern, function ($matches) use ($term) {
            $before = $matches[1] ?? '';
            $match = $matches[2] ?? '';
            $after = $matches[3] ?? '';

            if (empty($match)) return $matches[0];

            $highlighted = '<span style="background: yellow;">' . $match . '</span>';
            return $before . $highlighted . $after;
        }, $html);
    }
}
