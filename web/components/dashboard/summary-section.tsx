"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScanReport } from "@/types/scan";

function MetricDial({ label, score }: { label: string; score: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-3 space-y-2">
        <p className="text-3xl font-semibold text-slate-100">{score}</p>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} className="h-full bg-scan-gradient" />
        </div>
      </div>
    </div>
  );
}

export function SummarySection({ report }: { report: ScanReport }) {
  const severityTotal = report.severity.p1 + report.severity.p2;
  const p1Width = `${(report.severity.p1 / severityTotal) * 100}%`;

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Target</p>
          <h1 className="text-lg font-semibold text-slate-100">{report.targetUrl}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={report.httpStatus < 400 ? "good" : "critical"}>HTTP {report.httpStatus}</Badge>
          <Badge tone="warn">Risk {report.riskScore}/100</Badge>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <MetricDial label="Performance Score" score={report.performanceScore} />
        <MetricDial label="Risk Score" score={report.riskScore} />
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Severity Distribution</p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
            <motion.div initial={{ width: 0 }} animate={{ width: p1Width }} className="h-full bg-neon-red" />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
            <span>P1: {report.severity.p1}</span>
            <span>P2: {report.severity.p2}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-md bg-neon-red/10 p-2 text-sm text-neon-red">Critical {report.severity.p1}</div>
            <div className="rounded-md bg-neon-amber/10 p-2 text-sm text-neon-amber">Warning {report.severity.p2}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
