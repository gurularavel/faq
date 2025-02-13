<?php

namespace App\Services;

use App\Http\Requests\App\Profile\UpdateProfileRequest;
use App\Http\Resources\App\Auth\UserProfileResource;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;

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
            if ($user) {
                LoggerService::instance()->log('APP: invalid_username_or_password. UserId: ' . $user->id);
            } else {
                LoggerService::instance()->log('APP: invalid_username_or_password. UserNotFound: ' . $fields['email']);
            }

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
        $user->last_login_at = Carbon::now();
        $user->save();

        $user->token = $user->createToken($deviceType, ['user'])->plainTextToken;

        $user->load([
            'media',
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

    public function getProfile(): UserProfileResource
    {
        /** @var User $user */
        $user = auth('user')->user();

        $user
            ->load([
                'media',
                'department',
                'department.translatable',
                'department.parent',
                'department.parent.translatable',
            ])
            ->loadSum('questions', 'point');

        return new UserProfileResource($user);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = auth('user')->user();

        FileUpload::upload($request, 'image', 'profiles', $user);

        return response()->json([
            'data' => $this->getProfile(),
            'message' => LangService::instance()
                ->setDefault('Profile updated successfully')
                ->getLang('profile_updated_successfully'),
        ]);
    }
}
