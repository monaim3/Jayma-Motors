<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\Auth\AuthUserResource;
use App\Services\Auth\SessionAuthenticator;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * The current session: GET /auth/me and POST /auth/logout.
 */
class SessionController extends Controller
{
    public function me(Request $request): AuthUserResource
    {
        return AuthUserResource::make($request->user());
    }

    public function logout(Request $request, SessionAuthenticator $auth): Response
    {
        $auth->logout($request);

        return response()->noContent();
    }
}
