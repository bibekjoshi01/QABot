"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ExportActions } from "@/components/dashboard/export-actions";
import { IssueTable } from "@/components/issues/issue-table";
import { TraceVisualization } from "@/components/trace/trace-visualization";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { createMockReport } from "@/lib/mock-data";
import { DeviceProfile, NetworkProfile, ScanIssue, ScanReport } from "@/types/scan";

const sections = [
  { key: "overview", label: "Overview" },
  { key: "issues", label: "Issues" },
  { key: "thinking", label: "Thinking" }
] as const;

type SectionKey = (typeof sections)[number]["key"];

function isSection(value: string | null): value is SectionKey {
  if (!value) return false;
  return sections.some((section) => section.key === value);
}

function severityTone(issue: ScanIssue) {
  if (issue.severity === "P1") return "critical" as const;
  if (issue.severity === "P2") return "warn" as const;
  return "info" as const;
}

function severityRank(issue: ScanIssue) {
  if (issue.severity === "P1") return 0;
  if (issue.severity === "P2") return 1;
  if (issue.severity === "P3") return 2;
  return 3;
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
          deviceProfile: DeviceProfile.DESKTOP,
          networkProfile: NetworkProfile.WIFI
        }),
        id: scanId
      };
    }
    return history.find((item) => item.id === scanId) ?? null;
  }, [history, scanId]);

  const sortedFindings = useMemo(() => {
    if (!report) return [];
    return [...report.issues].sort((a, b) => {
      const rankDelta = severityRank(a) - severityRank(b);
      if (rankDelta !== 0) return rankDelta;
      return a.id.localeCompare(b.id);
    });
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
            <Badge tone={report.httpStatus !== null && report.httpStatus < 400 ? "good" : "critical"}>
              HTTP {report.httpStatus ?? "unknown"}
            </Badge>
            <Badge tone={report.runStatus === "Completed" ? "good" : "warn"}>{report.runStatus}</Badge>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Actions</p>
          <ExportActions report={report} compact />
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
      </Card>

      {section === "overview" && (
        <div className="grid gap-3 lg:grid-cols-12">
          <Card className="p-4 lg:col-span-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Overview</h3>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/25 px-3 py-2">
                <span className="text-slate-500">Risk Score</span>
                <span className="font-medium text-neon-amber">{report.riskScore}/100</span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/25 px-3 py-2">
                <span className="text-slate-500">Performance Score</span>
                <span className="font-medium text-neon-cyan">{report.performanceScore}/100</span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/25 px-3 py-2">
                <span className="text-slate-500">Total Findings</span>
                <span className="font-medium text-slate-100">{report.issues.length}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 lg:col-span-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Findings</h3>
            <div className="mt-3 space-y-2">
              {sortedFindings.length === 0 && <p className="text-sm text-slate-500">No findings in this report.</p>}
              {sortedFindings.map((issue) => (
                <div key={issue.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-slate-100">{issue.title}</p>
                    <Badge tone={severityTone(issue)}>{issue.severity}</Badge>
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
      )}

      {section === "issues" && <IssueTable issues={report.issues} />}

      {section === "thinking" && (
        <TraceVisualization trace={report.trace} />
      )}
    </div>
  );
}
