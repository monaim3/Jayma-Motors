/**
 * Small auth helpers shared by the login/register forms.
 */

/**
 * The page to return to after login, from ?next=. Only same-site paths are
 * allowed ("/account/…"), never "//evil.com", "/\t/evil.com" or full URLs
 * (open redirect): the value is resolved the way the browser would and must
 * stay on this origin.
 */
export function safeNextPath(fallback = "/account") {
  if (typeof window === "undefined") return fallback;
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || !next.startsWith("/")) return fallback;
  try {
    const url = new URL(next, window.location.origin);
    return url.origin === window.location.origin ? url.pathname + url.search + url.hash : fallback;
  } catch {
    return fallback;
  }
}

/** Read one query-string value in the browser (avoids useSearchParams + Suspense on small auth pages). */
export function queryParam(name) {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

// Same rule as the backend PhoneNumber helper: 01XXXXXXXXX, 8801… or +8801…
export const BD_MOBILE = /^(?:\+?88)?01[3-9]\d{8}$/;
export const isBdMobile = (value) => BD_MOBILE.test(value.replace(/[\s\-().]/g, ""));
