<?php

namespace App\Http\Middleware;

use App\Services\Auth\SessionAuthenticator;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Signs out an account that was deactivated while logged in (Step 7 §4).
 */
class EnsureActiveUser
{
    public function __construct(private SessionAuthenticator $auth) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->isActive()) {
            if ($request->hasSession()) {
                $this->auth->logout($request);
            }

            return response()->json(['message' => SessionAuthenticator::INACTIVE], 403);
        }

        return $next($request);
    }
}
