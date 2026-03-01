"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Download, ArrowRight } from "lucide-react";
import { SiteFooter } from "@/components/public/site-footer";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { createMockReport } from "@/lib/mock-data";
import { ScanIssue, ScanReport, TraceStep } from "@/types/scan";

function severityClass(severity: ScanIssue["severity"]) {
  if (severity === "P1") return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300";
  if (severity === "P2") return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300";
  if (severity === "P3") return "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300";
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

function tone(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function toEntries(value: Record<string, unknown>) {
  return Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
}

function stringify(value: unknown) {
  if (value === null) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value) || typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function KeyValueGrid({ title, data }: { title: string; data: Record<string, unknown> | null | undefined }) {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <section className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--surface-muted)]">{title}</p>
      <div className="overflow-x-auto rounded-xl border border-[var(--surface-border)]">
        <table className="w-full min-w-[440px] text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/60">
            <tr>
              <th className="border-b border-[var(--surface-border)] px-3 py-2 font-medium">Key</th>
              <th className="border-b border-[var(--surface-border)] px-3 py-2 font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            {toEntries(data).map(([key, value]) => (
              <tr key={key} className="align-top">
                <td className="border-b border-[var(--surface-border)] px-3 py-2 font-mono text-xs">{key}</td>
                <td className="border-b border-[var(--surface-border)] px-3 py-2 font-mono text-xs break-all">{stringify(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ToolCalls({ step }: { step: TraceStep }) {
  if (step.toolCalls.length === 0) {
    return <p className="text-sm text-[var(--surface-muted)]">No tool calls returned.</p>;
  }
  return (
    <div className="space-y-3">
      {step.toolCalls.map((call) => (
        <div key={call.id} className="rounded-xl border border-[var(--surface-border)] p-3">
          <p className="text-sm font-medium">{call.name}</p>
          <KeyValueGrid title="arguments" data={call.arguments} />
        </div>
      ))}
    </div>
  );
}

export function QAResultsPage() {
  const searchParams = useSearchParams();
  const [history] = useLocalStorage<ScanReport[]>("qa-agent-history", []);

  const report = useMemo(() => {
    const scanIdFromQuery = searchParams.get("scanId");
    const latestFromStorage = typeof window !== "undefined" ? window.localStorage.getItem("qa-agent-latest-report-id") : null;
    const preferredId = scanIdFromQuery ?? latestFromStorage;

    if (history.length === 0) {
      return createMockReport({
        targetUrl: "https://example.com",
        deviceProfile: "desktop",
        networkProfile: "wifi"
      });
    }

    if (!preferredId) return history[0];
    return history.find((item) => item.id === preferredId) ?? history[0];
  }, [history, searchParams]);

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${report.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--surface-bg)] text-[var(--surface-fg)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          QA agent
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/#about" className="text-[var(--surface-muted)] transition hover:text-[var(--surface-fg)]">
            about
          </Link>
          <Link href="/qa" className="font-medium text-[var(--surface-fg)]">
            try now
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 pb-20">
        <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--surface-muted)]">Overview</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">{report.targetUrl}</h1>
              <p className="mt-1 text-xs text-[var(--surface-muted)]">{report.id}</p>
            </div>
            <button
              type="button"
              onClick={downloadJson}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--surface-border)] px-4 py-2 text-sm font-medium transition hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              <Download className="h-4 w-4" />
              Download JSON
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--surface-border)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--surface-muted)]">Risk Score</p>
              <p className={`mt-2 text-3xl font-semibold ${tone(report.riskScore)}`}>{report.riskScore}</p>
            </div>
            <div className="rounded-xl border border-[var(--surface-border)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--surface-muted)]">Performance Score</p>
              <p className={`mt-2 text-3xl font-semibold ${tone(report.performanceScore)}`}>{report.performanceScore}</p>
            </div>
            <div className="rounded-xl border border-[var(--surface-border)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--surface-muted)]">Total Findings</p>
              <p className="mt-2 text-3xl font-semibold">{report.issues.length}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Issues</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--surface-border)]">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/60">
                <tr>
                  <th className="border-b border-[var(--surface-border)] px-4 py-3 font-medium">ID</th>
                  <th className="border-b border-[var(--surface-border)] px-4 py-3 font-medium">Severity</th>
                  <th className="border-b border-[var(--surface-border)] px-4 py-3 font-medium">Category</th>
                  <th className="border-b border-[var(--surface-border)] px-4 py-3 font-medium">Title</th>
                  <th className="border-b border-[var(--surface-border)] px-4 py-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {report.issues.map((issue) => (
                  <tr key={issue.id} className="align-top">
                    <td className="border-b border-[var(--surface-border)] px-4 py-3 font-mono text-xs">{issue.id}</td>
                    <td className="border-b border-[var(--surface-border)] px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${severityClass(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="border-b border-[var(--surface-border)] px-4 py-3 capitalize">{issue.category}</td>
                    <td className="border-b border-[var(--surface-border)] px-4 py-3">{issue.title}</td>
                    <td className="border-b border-[var(--surface-border)] px-4 py-3 text-[var(--surface-muted)]">{issue.description}</td>
                  </tr>
                ))}
                {report.issues.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[var(--surface-muted)]">
                      No issues found for this scan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Agents Working Process</h2>
            <Link href="/qa" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--surface-muted)] hover:text-[var(--surface-fg)]">
              Run another scan <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 space-y-5">
            {report.trace.map((step) => (
              <article key={step.id} className="rounded-2xl border border-[var(--surface-border)] p-5">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold">Step {step.step}</p>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      step.status === "failed"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                    }`}
                  >
                    {step.status}
                  </span>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <section className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--surface-muted)]">assistant_content</p>
                    <div className="rounded-xl border border-[var(--surface-border)] p-3 text-sm whitespace-pre-wrap">
                      {step.assistantContent || "No assistant content returned."}
                    </div>
                  </section>

                  <section className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--surface-muted)]">tool_calls</p>
                    <ToolCalls step={step} />
                  </section>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <KeyValueGrid title="output_json" data={step.outputJson} />
                  <KeyValueGrid title="metadata" data={step.metadata} />
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <section className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--surface-muted)]">output</p>
                    <div className="rounded-xl border border-[var(--surface-border)] p-3 font-mono text-xs break-all">
                      {step.output ?? "null"}
                    </div>
                  </section>
                  <section className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--surface-muted)]">error</p>
                    <div className="rounded-xl border border-[var(--surface-border)] p-3 font-mono text-xs break-all">
                      {step.error ?? "null"}
                    </div>
                  </section>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
