"use client";

import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import React from "react";

const Spinner = ({ className }: { className?: string }) => {
  return (
    <div className=" ">
      <Loader
        className={cn(
          "animate-spin w-6 h-6 text-primary-foreground",
          className,
        )}
      />
    </div>
  );
};

export default Spinner;
