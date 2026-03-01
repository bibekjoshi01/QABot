import { ScanReportView } from "@/components/scans/scan-report-view";

export default async function ScanDetailPage({ params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await params;
  return <ScanReportView scanId={scanId} />;
}
