<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Settings\UpdateSettingsRequest;
use App\Services\Settings\SettingsService;
use Illuminate\Http\JsonResponse;

/**
 * Site settings for Manager / Super Admin (Step 7 §11.9, permission settings.manage).
 */
class SettingsController extends Controller
{
    /** GET /admin/settings — all groups. */
    public function index(SettingsService $settings): JsonResponse
    {
        return response()->json(['data' => $settings->all()]);
    }

    /** PATCH /admin/settings/{group} — only the keys sent are changed. */
    public function update(UpdateSettingsRequest $request, string $group, SettingsService $settings): JsonResponse
    {
        $values = $settings->update($group, $request->validated(), $request->user());

        return response()->json(['data' => $values, 'message' => 'Settings saved.']);
    }
}
