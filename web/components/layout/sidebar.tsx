"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  History,
  LayoutDashboard,
  ScanLine,
  Settings,
  Waypoints
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/new-scan", label: "New Scan", icon: ScanLine },
  { href: "/scan-history", label: "Scan History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-black/50 px-4 py-6 backdrop-blur-xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan">
          <Waypoints className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100">QA Agent</p>
          <p className="text-xs text-slate-400">Autonomous Web Intelligence</p>
        </div>
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition",
                active
                  ? "border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan shadow-glow"
                  : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5"
              )}
            >
              <Icon className={cn("h-4 w-4", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]")} />
              <span>{item.label}</span>
              {active && <span className="ml-auto h-2 w-2 rounded-full bg-neon-cyan animate-pulse" />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
