<?php

namespace App\Repositories;

use App\Models\Answer;
use App\Models\Question;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AnswerRepository
{
    public function store(Question $question, array $validated): Answer
    {
        return DB::transaction(static function () use ($question, $validated) {
            $translations = $validated['translations'];
            unset($validated['translations']);

            $validated['uuid'] = $validated['uuid'] ?? Str::uuid();

            /** @var Answer $answer */
            $answer = $question->answers()->create($validated);

            $default = $translations[0];
            foreach ($translations as $translation) {
                $answer->setLang('title', $translation['title'] ?? $default['title'], $translation['language_id']);
            }

            $answer->saveLang();

            return $answer;
        });
    }

    public function destroyQuestionAllAnswers(Question $question): void
    {
        if (!$question->relationLoaded('answers')) {
            $question->load('answers');
        }

        foreach ($question->answers as $answer) {
            /** @var Answer $answer */
            $answer->delete();
        }
    }
}
