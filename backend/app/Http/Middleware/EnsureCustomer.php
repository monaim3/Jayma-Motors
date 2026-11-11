<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * /me/* routes: the user must have the customer role (Step 7 §4).
 */
class EnsureCustomer
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isCustomer()) {
            return response()->json(['message' => 'This area is for customer accounts.'], 403);
        }

        return $next($request);
    }
}
