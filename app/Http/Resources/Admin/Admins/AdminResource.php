<?php

namespace App\Http\Resources\Admin\Admins;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property mixed $username
 * @property mixed $id
 * @property mixed $email
 * @property mixed $name
 * @property mixed $surname
 * @property mixed $roles
 */
class AdminResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array
     */

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'name' => $this->name,
            'surname' => $this->surname,
            'roles' => data_get($this->roles, '*.id'),
        ];
    }
}
