"use client";

import React from "react";
import { Button } from "../ui/button";

const LogoutButton = () => {
  const handleLogout = () => {
    // TODO: implement actual logout logic
    console.log("Logout clicked");
  };

  return (
    <Button
      size={"sm"}
      variant={"outline"}
      onClick={handleLogout}
      className="border-primary text-primary hover:bg-primary hover:text-white"
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
