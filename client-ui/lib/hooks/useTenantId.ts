"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const TENANT_STORAGE_KEY = "selected_tenant_id";

/**
 * Returns the active tenantId.
 *
 * Priority:
 *  1. ?tenantId= query param in the current URL   (e.g. home page)
 *  2. localStorage fallback                        (e.g. /cart, /checkout)
 *
 * Whenever a tenantId is found in the URL it is written to localStorage so
 * it is available on pages that don't carry the param.
 */
export function useTenantId(): string | null {
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("tenantId");

  // Sync URL value → localStorage whenever it's present
  useEffect(() => {
    if (fromUrl) {
      localStorage.setItem(TENANT_STORAGE_KEY, fromUrl);
    }
  }, [fromUrl]);

  // URL takes priority; fall back to storage for non-home pages
  if (fromUrl) return fromUrl;

  if (typeof window !== "undefined") {
    return localStorage.getItem(TENANT_STORAGE_KEY);
  }

  return null;
}
