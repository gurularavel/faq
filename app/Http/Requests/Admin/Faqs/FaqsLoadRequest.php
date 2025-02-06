<?php

namespace App\Http\Requests\Admin\Faqs;

use App\Http\Requests\GeneralListRequest;
use OpenApi\Annotations as OA;

class FaqsLoadRequest extends GeneralListRequest
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
        return parent::rules() + [
                'category' => ['nullable', 'integer'],
                'status' => ['nullable', 'integer', 'in:1,2'], // 1 - active, 2 - deactive
            ];
    }
}
