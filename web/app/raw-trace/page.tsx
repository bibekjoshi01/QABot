"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { createMockReport } from "@/lib/mock-data";
import { RawOutputView } from "@/components/panels/raw-output-view";
import { TraceVisualization } from "@/components/trace/trace-visualization";
import { Card } from "@/components/ui/card";
import { ScanReport } from "@/types/scan";

export default function RawTracePage() {
  const searchParams = useSearchParams();
  const scanId = searchParams.get("scanId");
  const [history] = useLocalStorage<ScanReport[]>("qa-agent-history", []);

  const report = useMemo(() => {
    if (history.length === 0) {
      const fallback = createMockReport({
        targetUrl: "https://example.com",
        deviceProfile: "Desktop",
        networkProfile: "WiFi"
      });
      return scanId ? { ...fallback, id: scanId } : fallback;
    }
    if (!scanId) return history[0];
    return history.find((item) => item.id === scanId) ?? null;
  }, [history, scanId]);

  if (!report) {
    return (
      <Card className="p-6 text-sm text-neon-amber">
        Report with id <span className="font-mono">{scanId}</span> was not found in local history.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <RawOutputView report={report} />
      <TraceVisualization trace={report.trace} />
    </div>
  );
}
