"use client";

import Link from "next/link";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScanReport } from "@/types/scan";

export default function ScanHistoryPage() {
  const [history] = useLocalStorage<ScanReport[]>("qa-agent-history", []);

  if (history.length === 0) {
    return <Card className="p-6 text-sm text-slate-400">No scan history yet. Run your first mission from New Scan.</Card>;
  }

  return (
    <div className="space-y-3">
      {history.map((item) => (
        <Card key={item.id} className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium text-slate-100">{item.targetUrl}</p>
              <p className="text-xs text-slate-500">{new Date(item.startedAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="warn">Risk {item.riskScore}</Badge>
              <Badge tone="info">Perf {item.performanceScore}</Badge>
              <Link
                href={`/scans/${encodeURIComponent(item.id)}`}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200 transition hover:bg-white/10"
              >
                Open Report
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
