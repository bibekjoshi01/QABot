"use client";

import { useQuery } from "@tanstack/react-query";
import { createMockReport } from "@/lib/mock-data";
import { SecurityPanel } from "@/components/panels/security-panel";

export default function SecurityPage() {
  const { data } = useQuery({
    queryKey: ["security-panel"],
    queryFn: async () =>
      createMockReport({ targetUrl: "https://example.com", deviceProfile: "Desktop", networkProfile: "WiFi" })
  });

  if (!data) return null;
  return <SecurityPanel headers={data.security} cookies={data.cookies} />;
}