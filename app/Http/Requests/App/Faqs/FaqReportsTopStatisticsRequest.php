<?php

namespace App\Http\Requests\App\Faqs;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * @OA\Schema(
 *     schema="FaqReportsTopStatisticsRequest",
 *     type="object",
 *     required={"period", "limit"},
 *     @OA\Property(
 *         property="period",
 *         type="string",
 *         description="The period for statistics (week, month, year)",
 *         enum={"week", "month", "year"},
 *         example="week"
 *     ),
 *     @OA\Property(
 *         property="limit",
 *         type="integer",
 *         description="The maximum number of results to return",
 *         minimum=1,
 *         maximum=100,
 *         example=10
 *     ),
 *     @OA\Property(
 *         property="calendar",
 *         type="string",
 *         description="Whether to use calendar mode",
 *         enum={"yes", "no"},
 *         nullable=true,
 *         example="yes"
 *     )
 * )
 */
class FaqReportsTopStatisticsRequest extends FormRequest
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
            'period' => ['required', 'string', Rule::in(['week', 'month', 'year'])],
            'limit' => ['required', 'integer', 'min:1', 'max:100'],
            'calendar' => ['nullable', 'string', 'in:yes,no'],
        ];
    }
}
