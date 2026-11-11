<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\SlugRedirect;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RedirectController extends Controller
{
    /**
     * GET /redirects?path=/services/old-name → { new_path } or 404 (C9).
     */
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate(['path' => ['required', 'string', 'max:255']]);

        $redirect = SlugRedirect::where('old_path', '/'.ltrim($request->string('path'), '/'))->firstOrFail();

        return response()->json(['data' => ['new_path' => $redirect->new_path]]);
    }
}
