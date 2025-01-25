<?php

namespace App\Services;

use App\Enum\RoleEnum;
use App\Http\Resources\Admin\Auth\UserResource;
use App\Models\Admin;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Hash;
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

    public function checkUser(array $fields)
    {
        $user = Admin::query()
            ->where(function ($query) use ($fields) {
                $query->where('username', $fields['username']);
                $query->orWhere('email', $fields['username']);
            })
            ->whereHas('roles', function ($query) use ($fields) {
                $query->whereIn('name', [
                    RoleEnum::ADMIN,
                ]);
            })
            ->first();

        if (!$user || !Hash::check($fields['password'], $user->password)) {
            throw new HttpResponseException(response()->json([
                'message' => LangService::instance()
                    ->setDefault('Invalid username or password!')
                    ->getLang('invalid_username_or_password'),
            ], 401));
        }

        return $user;
    }

    public function createToken(Admin $user, string $deviceType): UserResource
    {
        $user->token = $user->createToken($deviceType, ['admin'])->plainTextToken;

        $user->load([
            'roles',
        ]);

        return new UserResource($user);
    }

    public function changePassword(array $validated): void
    {
        /** @var Admin $user */
        $user = auth("admin")->user();

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
        $user = auth("admin")->user();

        $user->currentAccessToken()->delete();
    }

    public function logoutAll(): void
    {
        /** @var Admin $user */
        $user = auth("admin")->user();

        $user->tokens()->delete();
    }

}
