"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScanReport } from "@/types/scan";

export function RawOutputView({ report }: { report: ScanReport }) {
  const [tab, setTab] = useState<"summary" | "json" | "model" | "trace">("summary");
  const [copied, setCopied] = useState(false);

  const content = {
    summary: `# Structured Summary\n\n- Risk score: **${report.riskScore}**\n- Performance score: **${report.performanceScore}**\n- Total issues: **${report.issues.length}**`,
    json: JSON.stringify(report.rawJson, null, 2),
    model: report.rawModelOutput,
    trace: JSON.stringify(report.trace, null, 2)
  }[tab];

  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Raw Model Output</h3>
        <button className="inline-flex items-center gap-2 rounded-md border border-white/10 px-2 py-1 text-xs" type="button" onClick={copy}>
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy
        </button>
      </div>
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        {(["summary", "json", "model", "trace"] as const).map((item) => (
          <button
            key={item}
            className={`rounded-md border px-3 py-1 ${tab === item ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan" : "border-white/10 bg-white/5 text-slate-300"}`}
            type="button"
            onClick={() => setTab(item)}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </div>

      <details open className="rounded-lg border border-white/10 bg-black/35 p-4">
        <summary className="cursor-pointer text-xs uppercase tracking-wide text-slate-400">Terminal Output</summary>
        <div className="mt-3 max-h-72 overflow-auto font-mono text-xs text-slate-300">
          {tab === "summary" ? <ReactMarkdown>{content}</ReactMarkdown> : <pre>{content}</pre>}
        </div>
      </details>
    </Card>
  );
}