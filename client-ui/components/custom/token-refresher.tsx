"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function TokenRefresher() {
  const router = useRouter();

  const scheduleRefresh = useCallback(() => {
    // 1. Read tokenExpiresAt from document.cookie
    const match = document.cookie.match(/(^|;\s*)tokenExpiresAt=(\d+)/);
    if (!match) return; // No active session

    const exp = parseInt(match[2], 10);
    // Refresh 60 seconds before actual expiry
    const msUntilRefresh = exp * 1000 - Date.now() - 60_000;

    if (msUntilRefresh <= 0) {
      // Already expired or within the 60s window — refresh immediately
      doRefresh();
    } else {
      // Schedule the refresh
      const timeoutId = setTimeout(doRefresh, msUntilRefresh);
      return () => clearTimeout(timeoutId); // cleanup function
    }
  }, []);

  const doRefresh = async () => {
    try {
      const res = await fetch("/api/auth/refresh");
      
      if (res.ok) {
        // Successfully refreshed! The route handler just set a new
        // tokenExpiresAt cookie. Reschedule for the next cycle.
        scheduleRefresh();
      } else {
        // Refresh failed (e.g., refresh token also expired/invalid)
        // The route handler already cleared the cookies, we just need to
        // redirect the user to login so they aren't stuck in a ghost session.
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }
  };

  useEffect(() => {
    const cleanup = scheduleRefresh();
    return cleanup;
  }, [scheduleRefresh]);

  // This component doesn't render anything, it just runs logic in the background
  return null;
}
