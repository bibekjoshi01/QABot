"use client";

import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { RunStatus } from "@/types/scan";

const toneByStatus: Record<RunStatus, "good" | "warn" | "critical" | "info" | "neutral"> = {
  Idle: "neutral",
  Scanning: "info",
  Analyzing: "warn",
  Completed: "good",
  Failed: "critical"
};

function toLabel(segment: string) {
  if (segment === "") return "Dashboard";
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function TopStatusBar({ status }: { status: RunStatus }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const labels = ["Dashboard", ...segments.map(toLabel)];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-black/40 px-6 backdrop-blur-xl">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400">
        {labels.map((label, index) => {
          const isLast = index === labels.length - 1;
          return (
            <span key={`${label}-${index}`} className="flex items-center gap-2">
              <span className={isLast ? "text-slate-100" : ""}>{label}</span>
              {!isLast && <span className="text-slate-600">/</span>}
            </span>
          );
        })}
      </nav>
      <Badge tone={toneByStatus[status]}>Run Status: {status}</Badge>
    </header>
  );
}
