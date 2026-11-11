<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Password reset by email (Step 3 §4.3). Links point to the frontend's
 * /reset-password page. New staff use the same flow to set a first password.
 */
class PasswordController extends Controller
{
    /**
     * POST /auth/forgot-password — always the same reply, whether or not the email exists.
     */
    public function forgot(ForgotPasswordRequest $request): JsonResponse
    {
        Password::broker()->sendResetLink($request->only('email'));

        return response()->json([
            'message' => 'If an account exists for that email, we have sent a password reset link.',
        ]);
    }

    /**
     * POST /auth/reset-password — sets the new password and logs out every other session.
     */
    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => $password,
                    'remember_token' => Str::random(60),
                ])->save();

                // Sign out everywhere: database sessions and any API tokens.
                DB::table('sessions')->where('user_id', $user->id)->delete();
                $user->tokens()->delete();

                event(new PasswordReset($user));
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => 'This reset link is invalid or has expired. Please request a new one.',
            ]);
        }

        return response()->json(['message' => 'Your password has been reset. You can now log in.']);
    }
}
