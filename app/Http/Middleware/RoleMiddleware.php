<?php

namespace App\Http\Middleware;

use App\Http\Resources\GeneralResource;
use App\Services\LangService;
use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
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
        $user = auth("sanctum")->user();
        if ($user->tokenCan('role:' . $name)) {
            return $next($request);
        }

        return response()->json(GeneralResource::make([
            'message' => LangService::instance()
                ->setDefault('Access denied!')
                ->getLang('access_denied'),
        ]), 403);
    }
}
