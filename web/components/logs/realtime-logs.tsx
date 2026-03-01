"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";

export function RealtimeLogs({ logs }: { logs: string[] }) {
  const [open, setOpen] = useState(true);

  return (
    <Card className="p-4">
      <button type="button" className="flex w-full items-center justify-between" onClick={() => setOpen((v) => !v)}>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Realtime Log Stream</h3>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-3 max-h-44 overflow-auto rounded-lg border border-white/10 bg-black/35 p-3 font-mono text-xs text-slate-300">
          {logs.map((line) => (
            <p key={line} className="leading-6">
              {line}
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}