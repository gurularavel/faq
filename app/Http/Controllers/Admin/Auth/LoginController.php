<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Enum\RoleEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Auth\ChangePasswordRequest;
use App\Http\Requests\Admin\Auth\LoginRequest;
use App\Http\Resources\Admin\Auth\UserResource;
use App\Http\Resources\GeneralResource;
use App\Models\Admin;
use App\Services\AdminService;
use App\Services\LangService;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    public function login(LoginRequest $request): UserResource
    {
        $fields = $request->validated();

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

        return AdminService::instance()->create_token($user, $fields['device_type']);
    }

    public function changePassword(ChangePasswordRequest $request): GeneralResource
    {
        AdminService::instance()->changePassword($request->validated());

        return GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Your password has been changed! You are logged out of other devices.')
                ->getLang('admin_password_changed'),
        ]);
    }

    public function checkLoggedIn(): JsonResponse
    {
        return response()->json([
            'message' => 'LoggedIn',
        ]);
    }
}
