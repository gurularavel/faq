<?php

namespace App\Services;

use App\Http\Resources\Admin\Auth\UserResource;
use App\Models\Admin;
use Laravel\Sanctum\PersonalAccessToken;

class AdminService
{
    private static ?AdminService $instance = null;

    private function __construct() {

    }

    public static function instance(): AdminService
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function create_token(Admin $user, $device_type): UserResource
    {
        $user->token = $user->createToken($device_type, ['admin'])->plainTextToken;

        $user->load([
            'roles',
        ]);

        return new UserResource($user);
    }

    public function changePassword(array $validated): void
    {
        /** @var Admin $user */
        $user = auth("sanctum")->user();

        $user->update($validated);

        $current_token_id = $user->currentAccessToken()->id ?? 0;

        PersonalAccessToken::query()
            ->where('tokenable_id', auth()->id())
            ->where('tokenable_type', Admin::class)
            ->where('id', '<>', $current_token_id)
            ->delete();
    }

    public function logout(): void
    {
        /** @var Admin $user */
        $user = auth("sanctum")->user();

        $user->currentAccessToken()->delete();
    }

    public function logoutAll(): void
    {
        /** @var Admin $user */
        $user = auth("sanctum")->user();

        $user->tokens()->delete();
    }

}
