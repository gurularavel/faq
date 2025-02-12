<?php

namespace App\Http\Requests\App\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="UpdateProfileRequest",
 *     type="object",
 *     title="Update Profile Request",
 *     description="Request body for updating profile",
 *     @OA\Property(
 *         property="image",
 *         type="string",
 *         format="binary",
 *         description="Profile image file",
 *         example="profile.jpg"
 *     )
 * )
 */
class UpdateProfileRequest extends FormRequest
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
            'image' => ['required', File::image()->max(2 * 1024)],
        ];
    }
}
