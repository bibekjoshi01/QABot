"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <Card className="space-y-3 p-6">
      <h2 className="text-lg font-semibold text-neon-red">QA Agent Error</h2>
      <p className="text-sm text-slate-400">The dashboard encountered an unexpected state.</p>
      <Button variant="ghost" onClick={reset}>Retry</Button>
    </Card>
  );
}
