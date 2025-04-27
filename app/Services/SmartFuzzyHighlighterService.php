<?php

namespace App\Services;

use DOMDocument;
use DOMXPath;

class SmartFuzzyHighlighterService
{
    private static ?SmartFuzzyHighlighterService $instance = null;

    private function __construct() {

    }

    public static function instance(): SmartFuzzyHighlighterService
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function highlightSmart(?string $text, ?string $searchTerm): ?string
    {
        if (empty($searchTerm) || empty($text)) {
            return $text;
        }

        $dom = new DOMDocument();
        libxml_use_internal_errors(true);

        $dom->loadHTML(mb_convert_encoding($text, 'HTML-ENTITIES', 'UTF-8'));
        $xpath = new DOMXPath($dom);

        foreach ($xpath->query('//text()') as $textNode) {
            if (trim($textNode->nodeValue) !== '') {
                $textNode->nodeValue = $this->applySmartHighlight($textNode->nodeValue, $searchTerm);
            }
        }

        $html = $dom->saveHTML();
        $html = preg_replace('~<(?:!DOCTYPE|/?(?:html|body))[^>]*>~i', '', $html);

        libxml_clear_errors();

        return html_entity_decode(trim($html));
    }

    private function applySmartHighlight(string $nodeText, string $searchTerm): string
    {
        $bestMatch = $this->findBestMatch($nodeText, $searchTerm);

        if ($bestMatch === null) {
            return $nodeText;
        }

        return preg_replace(
            '/' . preg_quote($bestMatch, '/') . '/iu',
            '<span style="background: yellow;">$0</span>',
            $nodeText,
            1
        );
    }

    private function findBestMatch(string $text, string $searchTerm): ?string
    {
        $length = mb_strlen($searchTerm);
        $bestMatch = null;
        $highestSimilarity = 0;

        for ($i = 0; $i <= mb_strlen($text) - $length; $i++) {
            $substring = mb_substr($text, $i, $length + config('scout.tntsearch.fuzzy.distance', 2));
            similar_text(mb_strtolower($substring), mb_strtolower($searchTerm), $percent);

            if ($percent > $highestSimilarity && $percent > 60) {
                $highestSimilarity = $percent;
                $bestMatch = $substring;
            }
        }

        return $bestMatch;
    }
}
