"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, CircleDashed, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TraceStep } from "@/types/scan";

function Icon({ status }: { status: TraceStep["status"] }) {
  if (status === "success") return <CheckCircle2 className="h-4 w-4 text-neon-green" />;
  if (status === "failed") return <XCircle className="h-4 w-4 text-neon-red" />;
  return <CircleDashed className="h-4 w-4 animate-spin text-neon-cyan" />;
}

export function TraceVisualization({ trace }: { trace: TraceStep[] }) {
  const [open, setOpen] = useState<string | null>(trace[0]?.id ?? null);

  return (
    <Card className="p-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">Trace Visualization</h3>
      <div className="space-y-3">
        {trace.map((step) => {
          const expanded = open === step.id;
          return (
            <div key={step.id} className="rounded-lg border border-white/10 bg-black/20">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                onClick={() => setOpen(expanded ? null : step.id)}
              >
                <div className="flex items-center gap-3">
                  <Icon status={step.status} />
                  <div>
                    <p className="text-sm text-slate-100">{step.title}</p>
                    <p className="text-xs text-slate-500">{step.ts}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400">{step.toolCall}</p>
              </button>
              {expanded && (
                <div className="border-t border-white/10 px-4 py-3 text-sm text-slate-300">
                  <p>{step.summary}</p>
                  {step.screenshot && (
                    <Image
                      src={step.screenshot}
                      alt={step.title}
                      width={1000}
                      height={600}
                      className="mt-3 h-48 w-full rounded-lg border border-white/10 object-cover"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}