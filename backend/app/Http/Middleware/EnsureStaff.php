<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * /admin/* routes: the user must have a staff role (Step 7 §4).
 */
class EnsureStaff
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isStaff()) {
            return response()->json(['message' => 'This area is for Jayma Motors staff.'], 403);
        }

        return $next($request);
    }
}
