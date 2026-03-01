"use client";

import { PropsWithChildren, useState } from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  items,
  children
}: PropsWithChildren<{ items: string[] }>) {
  const [active, setActive] = useState(items[0]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => setActive(item)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs transition",
              active === item
                ? "border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan"
                : "border-white/10 bg-white/5 text-slate-400 hover:text-slate-200"
            )}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
      <div data-active-tab={active}>{typeof children === "function" ? (children as any)(active) : children}</div>
    </div>
  );
}