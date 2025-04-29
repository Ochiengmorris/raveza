"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { LogOutIcon } from "lucide-react";

const LogOutButton = () => {
  const { signOut } = useAuth();
  return (
    <Button
      className={cn(
        "mt-3 w-full p-3 flex items-center justify-center gap-2 text-sm text-slate-400 rounded-md bg-slate-300/10 hover:bg-slate-300/20 transition-colors duration-200 ease-in-out cursor-pointer",
      )}
      onClick={async () => await signOut()}
    >
      <LogOutIcon className="h-4 w-4" />
      <span>Sign out</span>
    </Button>
  );
};

export default LogOutButton;
