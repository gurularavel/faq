<?php

namespace App\Services;

use App\Models\Faq;
use App\Models\FaqArchive;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class FaqArchiveService
{
    private static ?self $instance = null;
    private Faq $oldFaq;
    private Faq $newFaq;

    public static function instance(): FaqArchiveService
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function setOldFaq(Faq $faq): static
    {
        $this->oldFaq = clone $faq;

        $this->oldFaq
            ->loadMissing([
                'translatable',
            ]);

        return $this;
    }

    public function getOldFaq(): Faq
    {
        return $this->oldFaq;
    }

    public function setNewFaq(Faq $faq): static
    {
        $this->newFaq = clone $faq;

        $this->newFaq
            ->loadMissing([
                'translatable',
            ]);

        return $this;
    }

    public function getNewFaq(): Faq
    {
        return $this->newFaq;
    }

    public function saveArchive(): void
    {
        $languages = LangService::instance()->getLanguages();

        /** @var FaqArchive $archive */
        $archive = $this->newFaq->archives()->create();

        foreach ($languages as $language) {
            $oldQuestion = $this->getOldFaq()->getLang('question', $language['id']);
            $oldAnswer = $this->getOldFaq()->getLang('answer', $language['id']);

            $newQuestion = $this->getNewFaq()->getLang('question', $language['id']);
            $newAnswer = $this->getNewFaq()->getLang('answer', $language['id']);

            $archive->setLang('old_question', $oldQuestion, $language['id']);
            $archive->setLang('old_answer', $oldAnswer, $language['id']);

            $archive->setLang('new_question', $newQuestion, $language['id']);
            $archive->setLang('new_answer', $newAnswer, $language['id']);

            $archive->setLang(
                'diff_question',
                $this->diffWordsHtml($oldQuestion, $newQuestion),
                $language['id']
            );
            $archive->setLang(
                'diff_answer',
                $this->diffWordsHtml($oldAnswer, $newAnswer),
                $language['id']
            );
        }

        $archive->saveLang();
    }

    public function diffWordsHtml(string $old, string $new): string
    {
        // Tokenize into "words/punct" + "spaces" so original spacing is preserved.
        $tok = function (string $s): array {
            // capture whitespace as separate tokens; keep punctuation as part of words
            $parts = preg_split('/(\s+)/u', $s, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
            return $parts ?: [];
        };

        $A = $tok($old);
        $B = $tok($new);

        // Build sequences of "content" tokens only for LCS matching indexes (ignore pure whitespace).
        $isSpace = fn($t) => preg_match('/^\s+$/u', $t);

        $Ai = [];
        $Bi = [];
        for ($i = 0; $i < count($A); $i++) if (!$isSpace($A[$i])) $Ai[] = [$i, $A[$i]];
        for ($j = 0; $j < count($B); $j++) if (!$isSpace($B[$j])) $Bi[] = [$j, $B[$j]];

        // Map token -> list of positions for B
        $posB = [];
        foreach ($Bi as $k => [$bj, $w]) $posB[$w][] = $k;

        // Greedy LCS-ish matching via patience diff style anchors (good enough, fast)
        $matches = [];
        $lastK = -1;
        for ($i = 0; $i < count($Ai); $i++) {
            [$ai, $w] = $Ai[$i];
            if (!isset($posB[$w])) continue;
            foreach ($posB[$w] as $k) {
                if ($k > $lastK) {
                    $matches[] = [$ai, $Bi[$k][0]]; // original token indexes in A/B
                    $lastK = $k;
                    break;
                }
            }
        }

        // Walk through A and B with matches to produce ops: equal/del/ins
        $ops = []; // each: ['op' => 'eq|del|ins', 'tokens' => [...]]
        $push = function ($op, $tokens) use (&$ops) {
            if ($tokens === []) return;
            if (!empty($ops) && $ops[count($ops) - 1]['op'] === $op) {
                $ops[count($ops) - 1]['tokens'] = array_merge($ops[count($ops) - 1]['tokens'], $tokens);
            } else {
                $ops[] = ['op' => $op, 'tokens' => $tokens];
            }
        };

        $pa = 0;
        $pb = 0;
        foreach ($matches as [$ma, $mb]) {
            // Emit deletions from A until $ma
            if ($pa < $ma) $push('del', array_slice($A, $pa, $ma - $pa));
            // Emit insertions from B until $mb
            if ($pb < $mb) $push('ins', array_slice($B, $pb, $mb - $pb));
            // Emit equal tokens between $ma and next whitespace boundary
            $push('eq', [$A[$ma]]);
            $pa = $ma + 1;
            $pb = $mb + 1;
            // Also pass through following whitespace (keep alignment natural)
            while ($pa < count($A) && $isSpace($A[$pa])) {
                $push('eq', [$A[$pa]]);
                $pa++;
            }
            while ($pb < count($B) && $isSpace($B[$pb])) {
                $push('eq', [$B[$pb]]);
                $pb++;
            }
        }
        // Tail remainders
        if ($pa < count($A)) $push('del', array_slice($A, $pa));
        if ($pb < count($B)) $push('ins', array_slice($B, $pb));

        // Collapse a direct 'del' followed by 'ins' into "replacement":
        // keep the 'del' (red) and mark the following 'ins' as 'rep' (yellow),
        // so user sees what was removed (red) and what it became (yellow).
        $collapsed = [];
        for ($i = 0; $i < count($ops); $i++) {
            $cur = $ops[$i];
            $nxt = $ops[$i + 1] ?? null;
            if ($cur['op'] === 'del' && $nxt && $nxt['op'] === 'ins') {
                $collapsed[] = $cur; // deletions remain deletions (red)
                $collapsed[] = ['op' => 'rep', 'tokens' => $nxt['tokens']]; // inserted part becomes "changed" (yellow)
                $i++; // skip next
            } else {
                $collapsed[] = $cur;
            }
        }

        // Render to HTML with spans
        $esc = fn($s) => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $out = '';
        foreach ($collapsed as $chunk) {
            $txt = implode('', $chunk['tokens']);
            switch ($chunk['op']) {
                case 'eq':
                    $out .= $esc($txt);
                    break;
                case 'del':
                    $out .= "<span style='color: red;'>{$esc($txt)}</span>";
                    break;
                case 'ins':
                    $out .= "<span style='color: green;'>{$esc($txt)}</span>";
                    break;
                case 'rep':
                    $out .= "<span style='color: orange;'>{$esc($txt)}</span>";
                    break;
            }
        }

        return $out;
    }

    public function loadArchives(Faq $faq, array $validated): LengthAwarePaginator
    {
        return $faq->archives()
            ->with([
                'translatable',
            ])
            ->orderByDesc('id')
            ->paginate($validated['limit'] ?? 10);
    }
}
