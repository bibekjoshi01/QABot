"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock3, ScanLine } from "lucide-react";
import { createMockReport } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { DeviceProfile, NetworkProfile, ScanReport } from "@/types/scan";

function useLatestReport() {
  return useQuery({
    queryKey: ["latest-report"],
    queryFn: async () => {
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem("qa-agent-history");
        if (raw) {
          const parsed = JSON.parse(raw) as ScanReport[];
          if (parsed.length > 0) return parsed[0];
        }
      }
      return createMockReport({
        targetUrl: "https://www.tabflux.com/",
        deviceProfile: DeviceProfile.DESKTOP,
        networkProfile: NetworkProfile.WIFI
      });
    }
  });
}

function tone(score: number) {
  if (score >= 80) return "text-neon-green";
  if (score >= 60) return "text-neon-amber";
  return "text-neon-red";
}

export function DashboardView() {
  const { data, isLoading, isError } = useLatestReport();
  const [history] = useLocalStorage<ScanReport[]>("qa-agent-history", []);

  const recent = useMemo(() => {
    if (history.length > 0) return history.slice(0, 4);
    return data ? [data] : [];
  }, [data, history]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="h-28 animate-pulse bg-white/[0.02]" />
        <Card className="h-56 animate-pulse bg-white/[0.02]" />
      </div>
    );
  }

  if (isError || !data) {
    return <Card className="p-6 text-sm text-neon-red">Failed to load dashboard.</Card>;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 lg:grid-cols-12">
        <Card className="border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 via-black/25 to-black/10 p-6 lg:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">QA Agent</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-100">Dashboard</h2>
              <p className="mt-1 text-sm text-slate-400">Large-grid command center for scans, triage, and review.</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="info">{data.id}</Badge>
              <Badge tone={data.runStatus === "Completed" ? "good" : "warn"}>{data.runStatus}</Badge>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href="/new-scan"
              className="group rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 p-4 transition hover:shadow-glow"
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-neon-cyan">
                  <ScanLine className="h-4 w-4" />
                  <span className="font-medium">New Scan</span>
                </div>
                <ArrowRight className="h-4 w-4 text-neon-cyan transition group-hover:translate-x-0.5" />
              </div>
            </Link>
            <Link
              href="/scan-history"
              className="group rounded-lg border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-slate-100">
                  <Clock3 className="h-4 w-4 text-neon-amber" />
                  <span className="font-medium">Scan History</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          </div>
        </Card>

        <div className="grid gap-3 lg:col-span-5">
          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Risk Score</p>
            <p className={`mt-2 text-3xl font-semibold ${tone(data.riskScore)}`}>{data.riskScore}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-gradient-to-r from-neon-amber to-neon-red" style={{ width: `${data.riskScore}%` }} />
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Performance</p>
            <p className={`mt-2 text-3xl font-semibold ${tone(data.performanceScore)}`}>{data.performanceScore}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-neon-cyan to-sky-400"
                style={{ width: `${data.performanceScore}%` }}
              />
            </div>
          </Card>
        </div>

        <Card className="p-5 lg:col-span-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Recent Reports</h3>
            <Link
              href={`/scans/${encodeURIComponent(data.id)}?section=overview`}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
            >
              Open Latest
            </Link>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {recent.map((item) => (
              <Link
                key={item.id}
                href={`/scans/${encodeURIComponent(item.id)}`}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2 transition hover:bg-black/30"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-100">{item.targetUrl}</p>
                  <p className="text-xs text-slate-500">{item.id}</p>
                </div>
                <div className="ml-4 text-right text-xs">
                  <p className="text-neon-amber">Risk {item.riskScore}</p>
                  <p className="text-neon-cyan">Perf {item.performanceScore}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Latest Snapshot</h3>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-2">
              <span className="text-slate-500">Target</span>
              <span className="max-w-[60%] truncate text-slate-200">{data.targetUrl}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-2">
              <span className="text-slate-500">Run Status</span>
              <span className="text-slate-200">{data.runStatus}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-2">
              <span className="text-slate-500">HTTP</span>
              <span className="text-slate-200">{data.httpStatus ?? "unknown"}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-2">
              <span className="text-slate-500">Started</span>
              <span className="text-slate-300">{data.startedAt ? new Date(data.startedAt).toLocaleString() : "time unavailable"}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
