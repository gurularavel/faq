<?php

namespace App\Http\Requests\Admin\Questions;

use App\Models\Answer;
use App\Models\DifficultyLevel;
use App\Services\LangService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="QuestionUpdateRequest",
 *     type="object",
 *     title="Question Update Request",
 *     description="Request body for updating an existing question",
 *     required={"difficulty_level_id", "translations", "answers"},
 *     @OA\Property(
 *         property="difficulty_level_id",
 *         type="integer",
 *         description="ID of the difficulty level",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="translations",
 *         type="array",
 *         @OA\Items(
 *             type="object",
 *             required={"language_id", "title"},
 *             @OA\Property(property="language_id", type="integer", description="ID of the language", example=1),
 *             @OA\Property(property="title", type="string", description="Title of the question", example="What is the capital of France?")
 *         ),
 *         description="Translations for the question"
 *     ),
 *     @OA\Property(
 *         property="answers",
 *         type="array",
 *         @OA\Items(
 *             type="object",
 *             required={"is_correct", "translations"},
 *             @OA\Property(property="uuid", type="string", format="uuid", description="If it is a new question, a null uuid should be sent, else an existing uuid should be sent", example="123e4567-e89b-12d3-a456-426614174000"),
 *             @OA\Property(property="is_correct", type="boolean", description="Indicates if the answer is correct", example=true),
 *             @OA\Property(
 *                 property="translations",
 *                 type="array",
 *                 @OA\Items(
 *                     type="object",
 *                     required={"language_id", "title"},
 *                     @OA\Property(property="language_id", type="integer", description="ID of the language", example=1),
 *                     @OA\Property(property="title", type="string", description="Title of the answer", example="Paris")
 *                 ),
 *                 description="Translations for the answer"
 *             )
 *         ),
 *         description="Answers for the question (min: 2)"
 *     )
 * )
 */
class QuestionUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'difficulty_level_id' => ['required', 'integer', Rule::exists(DifficultyLevel::class, 'id')->whereNull('deleted_at')],

            'translations' => ['required', 'array', 'size:' . count(LangService::instance()->getLanguages())],
            'translations.*.language_id' => ['required', 'integer', 'distinct', Rule::in(data_get(LangService::instance()->getLanguages(), '*.id'))],
            'translations.*.title' => ['required', 'string', 'max:3000'],

            'answers' => [
                'required',
                'array',
                'min:2',
                function($attribute, $value, $fail) {
                    $correctCount = collect($value)
                        ->where('is_correct', true)
                        ->count();

                    if ($correctCount !== 1) {
                        $fail(
                            LangService::instance()
                                ->setDefault('Exactly one answer must be marked as correct.')
                                ->getLang('exactly_one_answer_must_be_marked_as_correct')
                        );
                    }
                },
                function ($attribute, $answers, $fail) {
                    $uuids = collect($answers)
                        ->pluck('uuid')
                        ->filter()
                        ->values();

                    $uniqueUuidsCount = $uuids->unique()->count();

                    if ($uuids->count() !== $uniqueUuidsCount) {
                        $fail(
                            LangService::instance()
                                ->setDefault('The UUID values must be distinct if not null.')
                                ->getLang('uuid_values_must_be_distinct_if_not_null')
                        );
                    }
                },
            ],
            'answers.*.uuid' => ['nullable', 'uuid', Rule::exists(Answer::class, 'uuid')->where('question_id', $this->route('question'))->whereNull('deleted_at')],
            'answers.*.is_correct' => ['required', 'boolean'],
            'answers.*.translations' => [
                'required',
                'array',
                'size:' . count(LangService::instance()->getLanguages()),
                function ($attribute, $answerTranslations, $fail) {
                    $langs = collect($answerTranslations)
                        ->pluck('language_id')
                        ->filter()
                        ->values();

                    if ($langs->count() !== $langs->unique()->count()) {
                        $fail(
                            LangService::instance()
                                ->setDefault('The language_id values must be distinct for each answer.')
                                ->getLang('language_id_values_must_be_distinct_for_each_answer')
                        );
                    }
                },
            ],
            'answers.*.translations.*.language_id' => ['required', 'integer', Rule::in(data_get(LangService::instance()->getLanguages(), '*.id'))],
            'answers.*.translations.*.title' => ['required', 'string', 'max:3000'],
        ];
    }
}
