<?php

namespace App\Http\Middleware;

use App\Http\Resources\GeneralResource;
use App\Models\User;
use App\Services\LangService;
use App\Services\LoggerService;
use App\Services\UserService;
use Closure;
use Illuminate\Http\Request;

class CheckUserExpiredMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): mixed
    {
        /** @var User $user */
        $user = auth("user")->user();

        if ($user->isExpired()) {
            LoggerService::instance()->log('User account is expired. Log out from all devices. UserId: ' . $user->id, [], true);

            UserService::instance()->logoutAll();

            return response()->json(GeneralResource::make([
                'message' => LangService::instance()
                    ->setDefault('Your account is expired. Please try login again!')
                    ->getLang('your_account_is_expired'),
            ]), 403);
        }

        return $next($request);
    }
}
