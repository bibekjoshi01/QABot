import * as React from "react";
import { cn } from "@/lib/utils";

const toneMap = {
  neutral: "bg-white/10 text-slate-200 border-white/10",
  good: "bg-neon-green/15 text-neon-green border-neon-green/35",
  warn: "bg-neon-amber/15 text-neon-amber border-neon-amber/35",
  critical: "bg-neon-red/15 text-neon-red border-neon-red/35",
  info: "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/35"
} as const;

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof toneMap }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium", toneMap[tone], className)}
      {...props}
    />
  );
}