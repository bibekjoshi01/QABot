"use client";

import { useQuery } from "@tanstack/react-query";
import { createMockReport } from "@/lib/mock-data";
import { PerformancePanel } from "@/components/panels/performance-panel";

export default function PerformancePage() {
  const { data } = useQuery({
    queryKey: ["perf-panel"],
    queryFn: async () =>
      createMockReport({ targetUrl: "https://example.com", deviceProfile: "Desktop", networkProfile: "WiFi" })
  });

  if (!data) return null;
  return <PerformancePanel metrics={data.performance} />;
}