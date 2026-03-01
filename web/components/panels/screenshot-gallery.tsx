"use client";

import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScreenshotItem } from "@/types/scan";

export function ScreenshotGallery({ shots }: { shots: ScreenshotItem[] }) {
  const [active, setActive] = useState<ScreenshotItem | null>(null);

  return (
    <Card className="p-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">Screenshot Timeline</h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {shots.map((shot) => (
          <button
            key={shot.id}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/30 text-left"
            type="button"
            onClick={() => setActive(shot)}
          >
            <Image src={shot.url} alt={shot.step} width={1200} height={800} className="h-44 w-full object-cover transition duration-300 group-hover:scale-105" />
            <div className="absolute inset-x-0 bottom-0 bg-black/70 p-2 text-xs text-slate-200">
              <p>{shot.step}</p>
              <p className="text-slate-400">{shot.ts}</p>
            </div>
            {shot.failed && <div className="absolute right-2 top-2 rounded bg-neon-red/80 px-2 py-1 text-xs text-white">Failed</div>}
          </button>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-6 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-bg">
            <button type="button" className="absolute right-3 top-3 z-10 rounded bg-black/70 p-1" onClick={() => setActive(null)}>
              <X className="h-4 w-4" />
            </button>
            <Image src={active.url} alt={active.step} width={1600} height={900} className="h-auto w-full" />
          </div>
        </div>
      )}
    </Card>
  );
}