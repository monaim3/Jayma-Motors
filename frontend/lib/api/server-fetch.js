import "server-only";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { toApiError } from "./errors";

/**
 * Server-side fetch for logged-in pages (Step 6 §4.2).
 *
 * Forwards the visitor's cookies to Laravel so Sanctum sees their session.
 * Never use inside 'use cache' — the result is personal. Components calling
 * this read cookies(), so they must render inside <Suspense> (Cache Components).
 */
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function serverFetch(path, { loginPath = "/login", ...init } = {}) {
  const cookieHeader = (await cookies()).toString();

  const response = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      // Sanctum treats requests from these origins as first-party (stateful).
      Referer: SITE_URL,
      Origin: SITE_URL,
      Cookie: cookieHeader,
      ...init.headers,
    },
  });

  if (response.status === 401) redirect(loginPath);
  if (response.status === 404) notFound();

  const body = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) throw toApiError(response.status, body);

  return body;
}
