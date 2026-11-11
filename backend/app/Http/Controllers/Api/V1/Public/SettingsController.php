<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Services\Settings\SettingsService;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    /**
     * GET /settings/public — business info, social links, SEO defaults, quick buttons.
     */
    public function __invoke(SettingsService $settings): JsonResponse
    {
        return response()->json(['data' => $settings->publicSettings()]);
    }
}
