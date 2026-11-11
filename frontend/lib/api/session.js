import "server-only";

import { cache } from "react";
import { serverFetch } from "./server-fetch";

/**
 * The signed-in user for this request (GET /auth/me), fetched once and shared
 * by every component that needs it. Redirects to /login when there is no session.
 */
export const getCurrentUser = cache(async (loginPath = "/login") => {
  const body = await serverFetch("/auth/me", { loginPath, cache: "no-store" });
  return body.data;
});
