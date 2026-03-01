"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ShieldAlert, Sparkles, Zap } from "lucide-react";
import { ExportActions } from "@/components/dashboard/export-actions";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { createMockReport } from "@/lib/mock-data";
import { IssueTable } from "@/components/issues/issue-table";
import { PerformancePanel } from "@/components/panels/performance-panel";
import { SecurityPanel } from "@/components/panels/security-panel";
import { ScreenshotGallery } from "@/components/panels/screenshot-gallery";
import { RawOutputView } from "@/components/panels/raw-output-view";
import { TraceVisualization } from "@/components/trace/trace-visualization";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScanReport } from "@/types/scan";

const sections = [
  { key: "overview", label: "Overview" },
  { key: "performance", label: "Performance" },
  { key: "security", label: "Security" },
  { key: "accessibility", label: "Accessibility" },
  { key: "network", label: "Network" },
  { key: "screenshots", label: "Screenshots" },
  { key: "raw-trace", label: "Raw Trace" }
] as const;

type SectionKey = (typeof sections)[number]["key"];

function isSection(value: string | null): value is SectionKey {
  if (!value) return false;
  return sections.some((section) => section.key === value);
}

function sectionDescription(section: SectionKey) {
  const map: Record<SectionKey, string> = {
    overview: "High-level scan health, risk posture, and issue distribution at a glance.",
    performance: "Core speed metrics and render bottlenecks with threshold cues.",
    security: "Defensive headers and cookie weaknesses prioritized by severity.",
    accessibility: "User-facing WCAG and semantic issues found during analysis.",
    network: "Transport/runtime instability, third-party latency and request health.",
    screenshots: "Visual checkpoints captured during the scan timeline.",
    "raw-trace": "Model output and tool-by-tool execution trace for deep debugging."
  };
  return map[section];
}

export function ScanReportView({ scanId }: { scanId: string }) {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section");
  const section: SectionKey = isSection(sectionParam) ? sectionParam : "overview";
  const [history] = useLocalStorage<ScanReport[]>("qa-agent-history", []);

  const report = useMemo(() => {
    if (history.length === 0) {
      return {
        ...createMockReport({
          targetUrl: "https://example.com",
          deviceProfile: "Desktop",
          networkProfile: "WiFi"
        }),
        id: scanId
      };
    }
    return history.find((item) => item.id === scanId) ?? null;
  }, [history, scanId]);

  const totalIssues = report ? report.issues.length : 0;
  const categoryStats = useMemo(() => {
    if (!report) return [];
    const categories = ["Performance", "Security", "Accessibility", "Network"] as const;
    return categories.map((category) => {
      const count = report.issues.filter((item) => item.category === category).length;
      const width = totalIssues === 0 ? 0 : (count / totalIssues) * 100;
      return { category, count, width };
    });
  }, [report, totalIssues]);

  const highestFindings = useMemo(() => {
    if (!report) return [];
    return [...report.issues]
      .sort((a, b) => (a.severity === b.severity ? a.id.localeCompare(b.id) : a.severity === "P1" ? -1 : 1))
      .slice(0, 3);
  }, [report]);

  if (!report) {
    return (
      <Card className="p-6 text-sm text-neon-amber">
        Report with id <span className="font-mono">{scanId}</span> was not found in local history.
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Scan Report</p>
            <h2 className="text-lg font-semibold text-slate-100">{report.targetUrl}</h2>
            <p className="text-xs text-slate-500">{report.id}</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <Badge tone={report.httpStatus < 400 ? "good" : "critical"}>HTTP {report.httpStatus}</Badge>
            <Badge tone={report.runStatus === "Completed" ? "good" : "warn"}>{report.runStatus}</Badge>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Actions</p>
          <div className="flex flex-wrap items-center gap-2">
            <ExportActions report={report} compact />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {sections.map((item) => (
            <Link
              key={item.key}
              href={`/scans/${encodeURIComponent(scanId)}?section=${item.key}`}
              className={`rounded-md border px-3 py-1.5 text-xs transition ${
                section === item.key
                  ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-400">
          {sectionDescription(section)}
        </div>
      </Card>

      {section === "overview" && (
        <>
          <div className="grid gap-3 lg:grid-cols-12">
            <Card className="border-neon-amber/25 bg-gradient-to-br from-neon-amber/10 via-black/30 to-black/10 p-5 lg:col-span-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Risk Posture</p>
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-3xl font-semibold text-neon-amber">{report.riskScore}</p>
                    <span className="rounded-md border border-neon-amber/30 bg-neon-amber/10 px-2 py-0.5 text-xs text-neon-amber">
                      /100
                    </span>
                  </div>
                </div>
                <ShieldAlert className="h-6 w-6 text-neon-amber" />
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-gradient-to-r from-neon-amber to-neon-red" style={{ width: `${report.riskScore}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-md border border-white/10 bg-black/25 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">P1</p>
                  <p className="mt-1 text-lg font-semibold text-neon-red">{report.severity.p1}</p>
                </div>
                <div className="rounded-md border border-white/10 bg-black/25 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">P2</p>
                  <p className="mt-1 text-lg font-semibold text-neon-amber">{report.severity.p2}</p>
                </div>
                <div className="rounded-md border border-white/10 bg-black/25 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">Findings</p>
                  <p className="mt-1 text-lg font-semibold text-slate-100">{totalIssues}</p>
                </div>
              </div>
            </Card>

            <Card className="border-neon-cyan/25 bg-gradient-to-br from-neon-cyan/10 via-black/30 to-black/10 p-5 lg:col-span-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Performance Index</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-3xl font-semibold text-neon-cyan">{report.performanceScore}</p>
                <Zap className="h-5 w-5 text-neon-cyan" />
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-gradient-to-r from-neon-cyan to-sky-400" style={{ width: `${report.performanceScore}%` }} />
              </div>
              <p className="mt-3 text-xs text-slate-400">Higher score indicates lower latency and smoother rendering.</p>
            </Card>

            <Card className="p-5 lg:col-span-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Critical</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-3xl font-semibold text-neon-red">{report.severity.p1}</p>
                <AlertTriangle className="h-5 w-5 text-neon-red" />
              </div>
              <p className="mt-3 text-xs text-slate-500">Immediate remediation required.</p>
            </Card>

            <Card className="p-4 lg:col-span-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Run Snapshot</h3>
                <Sparkles className="h-4 w-4 text-slate-400" />
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/25 px-3 py-2">
                  <span className="text-slate-500">Status</span>
                  <span className="font-medium text-slate-200">{report.runStatus}</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/25 px-3 py-2">
                  <span className="text-slate-500">HTTP</span>
                  <span className="font-medium text-slate-200">{report.httpStatus}</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/25 px-3 py-2">
                  <span className="text-slate-500">Started</span>
                  <span className="font-medium text-slate-300">{new Date(report.startedAt).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/25 px-3 py-2">
                  <span className="text-slate-500">Completed</span>
                  <span className="font-medium text-slate-300">
                    {report.completedAt ? new Date(report.completedAt).toLocaleTimeString() : "-"}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-4 lg:col-span-8">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Issue Pressure Map</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {categoryStats.map((item) => (
                  <div key={item.category} className="rounded-lg border border-white/10 bg-black/20 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-slate-300">{item.category}</span>
                      <span className="text-slate-500">
                        {item.count} ({item.width.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full bg-scan-gradient" style={{ width: `${item.width}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 lg:col-span-12">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Priority Queue</h3>
              <div className="mt-3 grid gap-2 xl:grid-cols-3">
                {highestFindings.length === 0 && <p className="text-sm text-slate-500">No findings in this report.</p>}
                {highestFindings.map((issue) => (
                  <div key={issue.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-slate-100">{issue.title}</p>
                      <Badge tone={issue.severity === "P1" ? "critical" : "warn"}>{issue.severity}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {issue.id} | {issue.category}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{issue.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {section === "performance" && <PerformancePanel metrics={report.performance} />}
      {section === "security" && <SecurityPanel headers={report.security} cookies={report.cookies} />}
      {section === "accessibility" && (
        <IssueTable issues={report.issues.filter((item) => item.category === "Accessibility")} />
      )}
      {section === "network" && <IssueTable issues={report.issues.filter((item) => item.category === "Network")} />}
      {section === "screenshots" && <ScreenshotGallery shots={report.screenshots} />}
      {section === "raw-trace" && (
        <div className="space-y-6">
          <RawOutputView report={report} />
          <TraceVisualization trace={report.trace} />
        </div>
      )}
    </div>
  );
}
