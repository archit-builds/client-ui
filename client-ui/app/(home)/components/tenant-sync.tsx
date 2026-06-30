"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/lib/store/hooks";
import { setTenantId } from "@/lib/store/features/tenant/tenantSlice";

/**
 * Invisible component — mounts on the home page to sync the URL
 * ?tenantId= query param into the Redux store (and localStorage).
 *
 * This ensures the selected restaurant is retained when the user
 * navigates to /cart or /checkout where the param is no longer in the URL.
 */
export default function TenantSync() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const tenantId = searchParams.get("tenantId");
    if (tenantId) {
      dispatch(setTenantId(tenantId));
    }
  }, [searchParams, dispatch]);

  return null; // renders nothing — side-effect only
}
