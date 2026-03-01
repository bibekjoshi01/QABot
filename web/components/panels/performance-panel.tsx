import { AlertTriangle, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PerfMetric } from "@/types/scan";

function tone(value: number, target: number, inverse = false) {
  const pass = inverse ? value <= target : value >= target;
  const near = inverse ? value <= target * 1.25 : value >= target * 0.8;
  if (pass) return "text-neon-green border-neon-green/30 bg-neon-green/10";
  if (near) return "text-neon-amber border-neon-amber/30 bg-neon-amber/10";
  return "text-neon-red border-neon-red/30 bg-neon-red/10";
}

function formatMetricValue(value: number, unit: PerfMetric["unit"]) {
  return unit === "ms" ? value.toFixed(2) : value;
}

export function PerformancePanel({ metrics }: { metrics: PerfMetric[] }) {
  return (
    <Card className="p-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">Performance Panel</h3>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.key} className={`rounded-xl border p-4 ${tone(metric.value, metric.target, metric.key !== "Resources")}`}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide">{metric.key}</p>
              <span title={`Target: ${formatMetricValue(metric.target, metric.unit)}${metric.unit === "ms" ? "ms" : ""}`}>
                <Info className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="text-2xl font-semibold">
              {formatMetricValue(metric.value, metric.unit)}
              <span className="ml-1 text-sm">{metric.unit === "ms" ? "ms" : ""}</span>
            </p>
            {metric.value > metric.target && <AlertTriangle className="mt-2 h-4 w-4 text-neon-amber" />}
          </div>
        ))}
      </div>
    </Card>
  );
}
