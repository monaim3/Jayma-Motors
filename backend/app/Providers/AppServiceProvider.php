<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Catch lazy loading, silently discarded attributes and missing attributes during development.
        Model::shouldBeStrict(! $this->app->isProduction());

        Password::defaults(function () {
            $rule = Password::min(8)->letters()->numbers();

            return $this->app->isProduction() ? $rule->uncompromised() : $rule;
        });

        $this->configureRateLimiting();
        $this->configureAuthLinks();
    }

    /**
     * Verification and reset emails link to the frontend, not the API (Step 7 §6).
     * The frontend page passes the parameters back to the matching API endpoint.
     */
    private function configureAuthLinks(): void
    {
        $frontend = rtrim((string) config('app.frontend_url'), '/');

        VerifyEmail::createUrlUsing(function (User $user) use ($frontend) {
            $signed = URL::temporarySignedRoute(
                'auth.verification.verify',
                now()->addMinutes(60),
                ['id' => $user->getKey(), 'hash' => sha1($user->getEmailForVerification())],
                absolute: false,
            );
            parse_str((string) parse_url($signed, PHP_URL_QUERY), $query);

            return $frontend.'/verify-email?'.http_build_query([
                'id' => $user->getKey(),
                'hash' => sha1($user->getEmailForVerification()),
                ...$query,
            ]);
        });

        ResetPassword::createUrlUsing(fn (User $user, string $token) => $frontend.'/reset-password?'.http_build_query([
            'token' => $token,
            'email' => $user->getEmailForPasswordReset(),
        ]));
    }

    /**
     * Named rate limiters (Step 7 §4).
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(120)
            ->by($request->user()?->id ?: $request->ip()));

        RateLimiter::for('login', fn (Request $request) => Limit::perMinute(5)
            ->by(Str::lower((string) $request->input('login', $request->input('email'))).'|'.$request->ip()));

        RateLimiter::for('register', fn (Request $request) => Limit::perHour(5)->by($request->ip()));

        RateLimiter::for('password', fn (Request $request) => Limit::perMinutes(10, 3)
            ->by(Str::lower((string) $request->input('email')).'|'.$request->ip()));

        RateLimiter::for('public-forms', fn (Request $request) => Limit::perMinutes(10, 5)->by($request->ip()));
    }
}
