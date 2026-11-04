<?php

use Illuminate\Support\Facades\Route;

// The backend is API-only; the website is served by the Next.js frontend.
Route::get('/', fn () => response()->json([
    'name' => config('app.name').' API',
    'api' => url('/api/v1'),
    'frontend' => config('app.frontend_url'),
]));
