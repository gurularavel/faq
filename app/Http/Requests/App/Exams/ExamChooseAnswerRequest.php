<?php

namespace App\Http\Requests\App\Exams;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="ExamChooseAnswerRequest",
 *     type="object",
 *     title="Exam Choose Answer Request",
 *     description="Request body for choosing an answer in an exam",
 *     required={"question", "answer"},
 *     @OA\Property(property="question", type="string", format="uuid", description="UUID of the question"),
 *     @OA\Property(property="answer", type="string", format="uuid", description="UUID of the answer")
 * )
 */
class ExamChooseAnswerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
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
            'question' => ['required', 'uuid'],
            'answer' => ['required', 'uuid'],
        ];
    }
}
