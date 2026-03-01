"use client";

import { Download, FileJson } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScanReport } from "@/types/scan";

export function ExportActions({ report, compact = false }: { report: ScanReport; compact?: boolean }) {
  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    toast.info("PDF export placeholder", { description: "This feature is queued for a future release." });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {compact ? (
        <>
          <button
            type="button"
            onClick={downloadJson}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
          >
            <FileJson className="h-3.5 w-3.5" />
            JSON
          </button>
          <button
            type="button"
            onClick={exportPdf}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </button>
        </>
      ) : (
        <>
          <Button variant="ghost" onClick={downloadJson}>
            <FileJson className="mr-2 h-4 w-4" /> Download JSON
          </Button>
          <Button variant="ghost" onClick={exportPdf}>
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </>
      )}
    </div>
  );
}
