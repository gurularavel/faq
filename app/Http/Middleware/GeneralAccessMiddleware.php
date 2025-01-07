<?php

namespace App\Http\Middleware;

use App\Enum\TranslationGroupEnum;
use App\Http\Resources\GeneralResource;
use App\Models\ApiToken;
use App\Services\LangService;
use Closure;
use Illuminate\Http\Request;

class GeneralAccessMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @param string $name
     * @return mixed
     */
    public function handle(Request $request, Closure $next, string $name): mixed
    {
        $token = $request->header('token');

        $lang_group = match($name) {
            'admin' => TranslationGroupEnum::ADMIN,
            'app' => TranslationGroupEnum::APP,
            default => TranslationGroupEnum::ALL,
        };

        LangService::instance()->setGroup($lang_group->value);

        if (ApiToken::query()->where('token', $token)->where('name', $name)->where('is_active', true)->first()) {
            return $next($request);
        }

        return response()->json(GeneralResource::make([
            'message' => 'You do not have access!',
            'token' => $token,
        ]), 403);
    }
}
