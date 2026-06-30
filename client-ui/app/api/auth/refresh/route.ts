import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Helper: decode JWT payload (base64url → JSON) — no signature verification needed
function parseJwtExp(token: string): number | null {
  try {
    const [, payload] = token.split(".");
    // JWT uses base64url — Node's Buffer handles it
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    return typeof decoded.exp === "number" ? decoded.exp : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    // Call the auth service refresh endpoint, forwarding the refreshToken as
    // a cookie (the validateRefreshToken middleware reads from req.cookies)
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/auth/auth/refresh`,
      {
        method: "POST",
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      // Refresh token expired or invalid — clear everything, force re-login
      const res = NextResponse.json({ error: "Session expired" }, { status: 401 });
      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");
      res.cookies.delete("tokenExpiresAt");
      return res;
    }

    // Forward all Set-Cookie headers from the auth service to the browser
    const setCookies: string[] = response.headers.getSetCookie?.() ?? [];
    const res = NextResponse.json({ success: true });
    let tokenExpiresAt: number | null = null;

    for (const cookieStr of setCookies) {
      const parts = cookieStr.split(";").map((p) => p.trim());
      const [nameValue, ...attrs] = parts;
      const eqIndex = nameValue.indexOf("=");
      const name = nameValue.substring(0, eqIndex);
      const value = nameValue.substring(eqIndex + 1);

      // Decode exp from the new accessToken JWT
      if (name === "accessToken") {
        tokenExpiresAt = parseJwtExp(value);
      }

      const options: Parameters<typeof res.cookies.set>[2] = { path: "/" };
      for (const attr of attrs) {
        const lower = attr.toLowerCase();
        if (lower === "httponly") options.httpOnly = true;
        else if (lower === "secure") options.secure = true;
        else if (lower.startsWith("samesite="))
          options.sameSite = attr.split("=")[1].toLowerCase() as
            | "strict"
            | "lax"
            | "none";
        else if (lower.startsWith("max-age="))
          options.maxAge = parseInt(attr.split("=")[1]);
        else if (lower.startsWith("path=")) options.path = attr.split("=")[1];
      }

      res.cookies.set(name, value, options);
    }

    // Set a readable (non-httpOnly) cookie with the expiry timestamp so the
    // client-side TokenRefresher can schedule the next refresh
    if (tokenExpiresAt) {
      res.cookies.set("tokenExpiresAt", String(tokenExpiresAt), {
        httpOnly: false, // JS must be able to read this
        sameSite: "strict",
        path: "/",
      });
    }

    return res;
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
