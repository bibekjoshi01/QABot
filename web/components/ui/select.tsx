import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-lg border border-white/15 bg-black/30 px-3 text-sm text-slate-100 outline-none transition-all focus:border-neon-cyan/70 focus:shadow-glow",
        className
      )}
      {...props}
    />
  );
}