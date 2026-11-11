<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\StaffLoginRequest;
use App\Http\Resources\Auth\AuthUserResource;
use App\Services\Auth\SessionAuthenticator;

class StaffLoginController extends Controller
{
    /**
     * POST /auth/staff/login — staff only, by email.
     */
    public function __invoke(StaffLoginRequest $request, SessionAuthenticator $auth): AuthUserResource
    {
        $user = $auth->attempt(
            $request,
            'email',
            $request->string('email'),
            $request->string('password'),
            $request->boolean('remember'),
            'staff',
            'email',
        );

        return AuthUserResource::make($user);
    }
}
