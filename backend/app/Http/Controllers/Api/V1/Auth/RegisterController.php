<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\Auth\AuthUserResource;
use App\Services\Customers\CustomerAccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class RegisterController extends Controller
{
    /**
     * POST /auth/register → 201: account created, verification email sent, logged in (Step 3 §4.1).
     */
    public function __invoke(RegisterRequest $request, CustomerAccountService $accounts): JsonResponse
    {
        $user = $accounts->register($request->safe()->only(['name', 'phone', 'email', 'password']));

        Auth::guard('web')->login($user);
        $request->session()->regenerate();
        $user->forceFill(['last_login_at' => now()])->saveQuietly();

        return AuthUserResource::make($user)->response()->setStatusCode(201);
    }
}
