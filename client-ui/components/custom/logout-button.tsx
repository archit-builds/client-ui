"use client";

import React from "react";
import { Button } from "../ui/button";
import { logoutAction } from "@/lib/actions/logout";
import Link from "next/link";
import type { User } from "@/lib/types";

interface LogoutButtonProps {
  user: User | null;
}

const LogoutButton = ({ user }: LogoutButtonProps) => {
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

  return (
    <div className="flex items-center gap-x-3">
      <span className="hidden md:block text-sm font-medium text-gray-600 truncate max-w-[140px]">
        {user.firstName} {user.lastName}
      </span>
      <form action={logoutAction}>
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
};

export default LogoutButton;
