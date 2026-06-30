import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Routes that require an authenticated session.
 * The matcher below keeps this in sync automatically.
 */
export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    // Preserve the original destination so we can redirect back after login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists — let the request through.
  // The /api/auth/self route (called client-side) still validates it with
  // the backend, acting as a second layer of verification.
  return NextResponse.next();
}

/**
 * Middleware only runs on these paths.
 * Add any other protected routes here (e.g. /orders, /profile).
 */
export const config = {
  matcher: ["/checkout/:path*", "/orders/:path*", "/profile/:path*"],
};
