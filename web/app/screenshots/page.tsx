"use client";

import { useQuery } from "@tanstack/react-query";
import { createMockReport } from "@/lib/mock-data";
import { ScreenshotGallery } from "@/components/panels/screenshot-gallery";

export default function ScreenshotsPage() {
  const { data } = useQuery({
    queryKey: ["shots-panel"],
    queryFn: async () =>
      createMockReport({ targetUrl: "https://example.com", deviceProfile: "Desktop", networkProfile: "WiFi" })
  });

  if (!data) return null;
  return <ScreenshotGallery shots={data.screenshots} />;
}