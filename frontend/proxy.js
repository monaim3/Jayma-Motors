import { NextResponse } from "next/server";

/**
 * Fast route guard (Step 6 §5): sends visitors without a session cookie to the
 * right login page. It is NOT a security boundary — Laravel checks every request.
 */
const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || "jayma_session";

export function proxy(request) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/admin/login" || request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  const loginUrl = new URL(pathname.startsWith("/admin") ? "/admin/login" : "/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
