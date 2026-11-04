import "server-only";

import { toApiError } from "./errors";

/**
 * Plain request to public Laravel endpoints (no cookies).
 *
 * Call it from a function marked 'use cache' with cacheLife("content") and
 * cacheTag(...) so the result is cached and can be refreshed on demand by
 * POST /api/revalidate (Step 6 §3).
 */
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function publicFetch(path) {
  const response = await fetch(`${API_URL}/api/v1${path}`, {
    headers: { Accept: "application/json" },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) throw toApiError(response.status, body);

  return body;
}
