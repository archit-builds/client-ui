"use client";

import React from "react";
import { Button } from "../ui/button";
import { logoutAction } from "@/lib/actions/logout";
import Link from "next/link";
import type { User } from "@/lib/types";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface LogoutButtonProps {
  user: User | null;
}

function LogoutButtonInner({ user }: LogoutButtonProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!user) {
    return (
      <Link href="/login">
        <Button
          size="sm"
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-white"
        >
          Login
        </Button>
      </Link>
    );
  }

  // Build the full current URL (path + query string) to pass as returnTo
  const currentUrl = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  return (
    <div className="flex items-center gap-x-3">
      <span className="hidden md:block text-sm font-medium text-gray-600 truncate max-w-[140px]">
        {user.firstName} {user.lastName}
      </span>
      <form action={logoutAction}>
        {/* Pass current page (with params) so logout can redirect to /login?returnTo=... */}
        <input type="hidden" name="returnTo" value={currentUrl} />
        <Button
          type="submit"
          size="sm"
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-white"
        >
          Logout
        </Button>
      </form>
    </div>
  );
}

// useSearchParams + usePathname require a Suspense boundary
const LogoutButton = (props: LogoutButtonProps) => (
  <Suspense
    fallback={
      <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
        Logout
      </Button>
    }
  >
    <LogoutButtonInner {...props} />
  </Suspense>
);

export default LogoutButton;
