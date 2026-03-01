"use client";

import { PropsWithChildren, useState } from "react";
import { cn } from "@/lib/utils";

export function AccordionItem({
  title,
  defaultOpen,
  children
}: PropsWithChildren<{ title: string; defaultOpen?: boolean }>) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <div className="rounded-lg border border-white/10 bg-black/20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:bg-white/5"
      >
        {title}
        <span className={cn("text-xs text-slate-400 transition", open && "rotate-180")}>?</span>
      </button>
      {open && <div className="border-t border-white/10 p-4">{children}</div>}
    </div>
  );
}