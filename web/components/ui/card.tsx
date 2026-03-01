import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-[0_0_24px_rgba(15,23,42,.45)]",
        className
      )}
      {...props}
    />
  );
}