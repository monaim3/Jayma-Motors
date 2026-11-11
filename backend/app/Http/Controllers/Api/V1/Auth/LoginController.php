<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\Auth\AuthUserResource;
use App\Services\Auth\SessionAuthenticator;

class LoginController extends Controller
{
    /**
     * POST /auth/login — customers, by phone or email.
     */
    public function __invoke(LoginRequest $request, SessionAuthenticator $auth): AuthUserResource
    {
        [$column, $value] = $request->identifier() ?? ['email', null];

        $user = $auth->attempt(
            $request,
            $column,
            $value,
            $request->string('password'),
            $request->boolean('remember'),
            'customer',
            'login',
        );

        return AuthUserResource::make($user);
    }
}
