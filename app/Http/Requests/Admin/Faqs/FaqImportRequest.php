<?php

namespace App\Http\Requests\Admin\Faqs;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="FaqImportRequest",
 *     type="object",
 *     title="FAQ Import Request",
 *     description="Request parameters for importing FAQs",
 *     @OA\Property(
 *         property="file",
 *         type="string",
 *         format="binary",
 *         description="File to be imported (xls, xlsx)",
 *         example="example.xlsx"
 *     )
 * )
 */
class FaqImportRequest extends FormRequest
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
            'file' => [
                'required',
                File::types(['xls', 'xlsx']),
            ],
        ];
    }
}
