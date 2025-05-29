"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React from "react";

const Spinner = ({ className }: { className?: string }) => {
  return (
    <div className=" ">
      <Loader2 className={cn("animate-spin w-6 h-6 text-primary", className)} />
    </div>
  );
};

export default Spinner;
