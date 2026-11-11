<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\Auth\AuthUserResource;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Email verification (Step 3 §4.1). The email links to the frontend's
 * /verify-email page, which calls verify() with the signed id/hash/expires/signature.
 */
class EmailVerificationController extends Controller
{
    /**
     * POST /auth/email/verification-notification — resend the link.
     */
    public function send(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Your email is already verified.']);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'A new verification link has been sent to your email.']);
    }

    /**
     * GET /auth/email/verify/{id}/{hash} — signature checked by the `signed` middleware.
     * The Verified event is where walk-in auto-linking hooks in (B4).
     */
    public function verify(Request $request, string $id, string $hash): JsonResponse
    {
        $user = $request->user();

        if ((string) $user->getKey() !== $id || ! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return response()->json(['message' => 'This verification link is not for the account you are signed in to.'], 403);
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        return response()->json([
            'message' => 'Your email is verified.',
            'data' => AuthUserResource::make($user->fresh()),
        ]);
    }
}
