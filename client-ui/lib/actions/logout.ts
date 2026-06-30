"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction(formData: FormData) {
  const cookieStore = await cookies();

  // Clear both auth cookies
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  // Redirect to login, preserving the page the user was on so they land
  // back there after re-authentication. Only accept relative URLs to avoid
  // open-redirect attacks.
  const returnTo = formData.get("returnTo");
  const isSafeReturnTo =
    typeof returnTo === "string" &&
    returnTo.startsWith("/") &&
    !returnTo.startsWith("//");

  const loginUrl = isSafeReturnTo
    ? `/login?returnTo=${encodeURIComponent(returnTo)}`
    : "/login";

  redirect(loginUrl);
}
