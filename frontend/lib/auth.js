/**
 * Small auth helpers shared by the login/register forms.
 */

/**
 * The page to return to after login, from ?next=. Only same-site paths are
 * allowed ("/account/…"), never "//evil.com" or full URLs (open redirect).
 */
export function safeNextPath(fallback = "/account") {
  if (typeof window === "undefined") return fallback;
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}

/** Read one query-string value in the browser (avoids useSearchParams + Suspense on small auth pages). */
export function queryParam(name) {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

// Same rule as the backend PhoneNumber helper: 01XXXXXXXXX, 8801… or +8801…
export const BD_MOBILE = /^(?:\+?88)?01[3-9]\d{8}$/;
export const isBdMobile = (value) => BD_MOBILE.test(value.replace(/[\s\-().]/g, ""));
