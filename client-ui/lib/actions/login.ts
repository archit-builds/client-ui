"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { LoginState } from "./login-types";

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { type: "error", message: "Email and password are required." };
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/auth/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        type: "error",
        message:
          data?.errors?.[0]?.msg ??
          data?.message ??
          "Login failed. Please try again.",
      };
    }

    // ─── Forward Set-Cookie headers from the auth service to the browser ───
    // The auth service sets tokens via res.cookie() (Set-Cookie headers),
    // NOT in the JSON response body. We must read each Set-Cookie string
    // from the upstream response and re-set it via next/headers so the
    // browser actually receives and stores the cookies.
    const cookieStore = await cookies();

    // getSetCookie() returns each cookie as a separate string (Node 18+)
    const setCookies: string[] = response.headers.getSetCookie?.() ?? [];

    for (const cookieStr of setCookies) {
      // e.g. "accessToken=eyJ...; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600"
      const parts = cookieStr.split(";").map((p) => p.trim());
      const [nameValue, ...attrs] = parts;
      const eqIndex = nameValue.indexOf("=");
      const name = nameValue.substring(0, eqIndex);
      const value = nameValue.substring(eqIndex + 1);

      const options: Parameters<typeof cookieStore.set>[2] = { path: "/" };

      for (const attr of attrs) {
        const lower = attr.toLowerCase();
        if (lower === "httponly") {
          options.httpOnly = true;
        } else if (lower === "secure") {
          options.secure = true;
        } else if (lower.startsWith("samesite=")) {
          const sv = attr.split("=")[1].toLowerCase();
          options.sameSite = sv as "strict" | "lax" | "none";
        } else if (lower.startsWith("max-age=")) {
          options.maxAge = parseInt(attr.split("=")[1]);
        } else if (lower.startsWith("path=")) {
          options.path = attr.split("=")[1];
        }
      }

      cookieStore.set(name, value, options);
    }

    // Bust server-component cache so Header re-renders with the new session
    revalidatePath("/");

    return {
      type: "success",
      message: "Login successful! Redirecting...",
    };
  } catch {
    return {
      type: "error",
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
