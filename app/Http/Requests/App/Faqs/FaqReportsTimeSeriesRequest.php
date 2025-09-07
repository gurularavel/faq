<?php

namespace App\Http\Requests\App\Faqs;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * @OA\Schema(
 *     schema="FaqReportsTimeSeriesRequest",
 *     type="object",
 *     required={"granularity"},
 *     @OA\Property(
 *         property="granularity",
 *         type="string",
 *         description="The granularity for statistics (week, month, year)",
 *         enum={"week", "month", "year"},
 *         example="week"
 *     ),
 *     @OA\Property(
 *         property="from",
 *         type="string",
 *         format="date",
 *         description="Start date for the statistics (optional, defaults to start of sub 29 days if null)",
 *         nullable=true,
 *         example="2024-06-01"
 *     ),
 *     @OA\Property(
 *         property="to",
 *         type="string",
 *         format="date",
 *         description="End date for the statistics (optional, defaults to end of today if null)",
 *         nullable=true,
 *         example="2024-06-29"
 *     )
 * )
 */

class FaqReportsTimeSeriesRequest extends FormRequest
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
            'granularity' => ['required', 'string', Rule::in(['week', 'month', 'day'])],
            'from' => ['nullable', 'date'], // if null, start of sub 29 days
            'to' => ['nullable', 'date'], // if null, end of today
        ];
    }
}
