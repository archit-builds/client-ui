"use server";

import { cookies } from "next/headers";
import type { LoginState } from "./login-types";

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Basic validation
  if (!email || !password) {
    return {
      type: "error",
      message: "Email and password are required.",
    };
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/auth/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        type: "error",
        message: data?.message ?? "Login failed. Please try again.",
      };
    }

    const { accessToken, refreshToken } = data;

    const cookieStore = await cookies();

    // Set access token cookie (short-lived, httpOnly)
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    // Set refresh token cookie (longer-lived, httpOnly)
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

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
