import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-white/15 bg-black/30 px-4 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-neon-cyan/70 focus:shadow-glow",
        className
      )}
      {...props}
    />
  );
}