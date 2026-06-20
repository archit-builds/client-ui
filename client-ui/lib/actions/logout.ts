"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookieStore = await cookies();

  // Clear both auth cookies
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  redirect("/login");
}
