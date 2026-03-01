"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopStatusBar } from "@/components/layout/top-status-bar";
import { RunStatus } from "@/types/scan";

export function AppShell({ children, status = "Idle" }: { children: ReactNode; status?: RunStatus }) {
  return (
    <div className="min-h-screen bg-bg text-slate-100">
      <div className="fixed inset-0 -z-10 bg-grid-subtle bg-[size:36px_36px] opacity-50" />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <span key={i} className={`particle particle-${i + 1}`} />
        ))}
      </div>
      <Sidebar />
      <div className="pl-64">
        <TopStatusBar status={status} />
        <main className="px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
