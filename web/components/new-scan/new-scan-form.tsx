"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRunScan } from "@/hooks/use-run-scan";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AccordionItem } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DeviceProfile, NetworkProfile, ScanPayload, ScanReport } from "@/types/scan";

const steps = [
  "Connecting to target",
  "Running audits",
  "Collecting screenshots",
  "Evaluating performance",
  "Generating report"
];

export function NewScanForm() {
  const [targetUrl, setTargetUrl] = useState("https://example.com");
  const [deviceProfile, setDeviceProfile] = useState<ScanPayload["deviceProfile"]>(DeviceProfile.DESKTOP);
  const [networkProfile, setNetworkProfile] = useState<ScanPayload["networkProfile"]>(NetworkProfile.WIFI);
  const [contextJson, setContextJson] = useState('{"mission":"baseline"}');
  const [stepIndex, setStepIndex] = useState(0);
  const [history, setHistory] = useLocalStorage<ScanReport[]>("qa-agent-history", []);

  const mutation = useRunScan((report) => {
    setHistory([report, ...history].slice(0, 25));
    toast.success("Scan completed", { description: report.id });
    setStepIndex(steps.length - 1);
  });

  const running = mutation.isPending;

  const activeSteps = useMemo(() => {
    if (!running) return [] as string[];
    return steps.slice(0, stepIndex + 1);
  }, [running, stepIndex]);

  const execute = async () => {
    setStepIndex(0);
    const payload: ScanPayload = { targetUrl, deviceProfile, networkProfile, contextJson };

    for (let i = 0; i < steps.length - 1; i += 1) {
      setStepIndex(i);
      await new Promise((resolve) => setTimeout(resolve, 450));
    }

    mutation.mutate(payload, {
      onError: () => {
        toast.error("Scan failed", { description: "Backend did not return a valid report" });
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <Card className="p-6">
        <h1 className="text-xl font-semibold">New Autonomous Scan</h1>
        <p className="mt-1 text-sm text-slate-400">Configure mission profile and dispatch agentic web audit.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wide text-slate-400">Target URL</label>
            <Input
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="h-14 text-base focus:animate-pulse-glow"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wide text-slate-400">Device Profile</label>
              <Select value={deviceProfile} onChange={(e) => setDeviceProfile(e.target.value as ScanPayload["deviceProfile"])}>
                <option value={DeviceProfile.IPHONE_14}>iPhone 14</option>
                <option value={DeviceProfile.DESKTOP}>Desktop</option>
                <option value={DeviceProfile.DESKTOP_1440}>Desktop 1440</option>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wide text-slate-400">Network Profile</label>
              <Select value={networkProfile} onChange={(e) => setNetworkProfile(e.target.value as ScanPayload["networkProfile"])}>
                <option value={NetworkProfile.WIFI}>WiFi</option>
                <option value={NetworkProfile.FOUR_G}>4G</option>
                <option value={NetworkProfile.SLOW_3G}>Slow 3G</option>
              </Select>
            </div>
          </div>

          <AccordionItem title="Advanced Context (JSON)">
            <textarea
              value={contextJson}
              onChange={(e) => setContextJson(e.target.value)}
              className="h-44 w-full rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-xs text-slate-200 outline-none focus:border-neon-violet/70"
            />
          </AccordionItem>

          {!running ? (
            <Button size="lg" className="w-full animate-pulse-glow" onClick={execute}>
              Execute QA Scan
            </Button>
          ) : (
            <div className="rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 p-4 text-sm text-neon-cyan">AI Agent is thinking...</div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Realtime Progress</h2>
        <div className="mt-4 space-y-4">
          {steps.map((step, idx) => {
            const active = activeSteps.includes(step);
            const current = stepIndex === idx && running;
            return (
              <motion.div
                key={step}
                initial={{ opacity: 0.5, x: -8 }}
                animate={{ opacity: active ? 1 : 0.45, x: 0 }}
                className="relative flex items-start gap-3"
              >
                <span
                  className={`mt-1 h-3 w-3 rounded-full border ${
                    active ? "border-neon-cyan bg-neon-cyan shadow-glow" : "border-white/20 bg-white/10"
                  }`}
                />
                <div>
                  <p className="text-sm text-slate-100">{step}</p>
                  {current && <p className="text-xs text-neon-cyan">Executing...</p>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
