<?php

namespace App\Services;

use DOMDocument;
use DOMText;
use DOMXPath;

class HighlightService
{
    private static ?HighlightService $instance = null;

    private function __construct() {

    }

    public static function instance(): HighlightService
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function highlightPreservingHtml(?string $text, ?string $searchTerm): ?string
    {
        if (empty($searchTerm) || empty($text)) {
            return $text;
        }

        $variants = $this->generateFuzzyVariants($searchTerm);

        $dom = new DOMDocument();
        libxml_use_internal_errors(true);

        $dom->loadHTML(mb_convert_encoding($text, 'HTML-ENTITIES', 'UTF-8'));
        $xpath = new DOMXPath($dom);

        foreach ($xpath->query('//text()') as $textNode) {
            /** @var DOMText $textNode */
            if (trim($textNode->nodeValue) !== '') {
                foreach ($variants as $variant) {
                    $textNode->nodeValue = preg_replace(
                        '/' . preg_quote($variant, '/') . '/iu',
                        '<span style="background: yellow;">$0</span>',
                        $textNode->nodeValue
                    );
                }
            }
        }

        $html = $dom->saveHTML();

        $html = preg_replace('~<(?:!DOCTYPE|/?(?:html|body))[^>]*>~i', '', $html);

        libxml_clear_errors();

        return html_entity_decode(trim($html));
    }

    private function generateFuzzyVariants(string $searchTerm): array
    {
        $variants = [$searchTerm];

        $fuzzyMap = [
            'u' => 'ü',
            'ü' => 'u',
            'c' => 'ç',
            'ç' => 'c',
            'i' => 'ı',
            'ı' => 'i',
            '-' => '–',
            'ə' => 'e',
            'e' => 'ə',
        ];

        foreach ($fuzzyMap as $from => $to) {
            if (str_contains($searchTerm, $from)) {
                $variants[] = str_replace($from, $to, $searchTerm);
            }
        }

        return array_unique($variants);
    }
}
