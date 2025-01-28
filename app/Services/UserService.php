<?php

namespace App\Services;

use App\Http\Resources\App\Auth\UserProfileResource;
use App\Models\User;
use Illuminate\Http\Exceptions\HttpResponseException;

class UserService
{
    private static ?UserService $instance = null;

    private function __construct()
    {

    }

    public static function instance(): UserService
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function checkUser(array $fields)
    {
        $user = User::query()
            ->active()
            ->where('email', $fields['email'])
            ->first();

        if (!$user || !LDAPService::instance()->check($user, $fields['password'])) {
            throw new HttpResponseException(response()->json([
                'message' => LangService::instance()
                    ->setDefault('Invalid username or password!')
                    ->getLang('invalid_username_or_password'),
            ], 401));
        }

        return $user;
    }

    public function createToken(User $user, string $deviceType): UserProfileResource
    {
        $user->token = $user->createToken($deviceType, ['user'])->plainTextToken;

        $user->load([
            'department',
            'department.translatable',
            'department.parent',
            'department.parent.translatable',
        ]);

        return new UserProfileResource($user);
    }

    public function logout(): void
    {
        /** @var User $user */
        $user = auth("user")->user();

        $user->currentAccessToken()->delete();
    }

    public function logoutAll(): void
    {
        /** @var User $user */
        $user = auth("user")->user();

        $user->tokens()->delete();
    }
}
