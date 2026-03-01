"use client";

import { useQuery } from "@tanstack/react-query";
import { createMockReport } from "@/lib/mock-data";
import { IssueTable } from "@/components/issues/issue-table";

export default function AccessibilityPage() {
  const { data } = useQuery({
    queryKey: ["accessibility-panel"],
    queryFn: async () =>
      createMockReport({ targetUrl: "https://example.com", deviceProfile: "Desktop", networkProfile: "WiFi" })
  });

  if (!data) return null;
  return <IssueTable issues={data.issues.filter((item) => item.category === "Accessibility")} />;
}