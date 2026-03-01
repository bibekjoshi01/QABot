"use client";

import { Fragment, useMemo, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead } from "@/components/ui/table";
import { ScanIssue } from "@/types/scan";

export function IssueTable({ issues }: { issues: ScanIssue[] }) {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("All");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"id" | "severity" | "title">("severity");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const severityOrder = { P1: 0, P2: 1 };
    return issues
      .filter((item) => (severity === "All" ? true : item.severity === severity))
      .filter((item) => (category === "All" ? true : item.category === category))
      .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()) || item.id.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === "severity") return severityOrder[a.severity] - severityOrder[b.severity];
        return a[sortBy].localeCompare(b[sortBy]);
      });
  }, [issues, severity, category, query, sortBy]);

  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search issues" className="pl-9" />
        </div>
        <Select className="w-36" value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option>All</option>
          <option>P1</option>
          <option>P2</option>
        </Select>
        <Select className="w-44" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>All</option>
          <option>Performance</option>
          <option>Security</option>
          <option>Accessibility</option>
          <option>Network</option>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <THead>
            <tr>
              <TH>ID</TH>
              <TH>
                <button className="inline-flex items-center gap-1" type="button" onClick={() => setSortBy("severity")}>
                  Severity <ArrowUpDown className="h-3 w-3" />
                </button>
              </TH>
              <TH>
                <button className="inline-flex items-center gap-1" type="button" onClick={() => setSortBy("title")}>
                  Title <ArrowUpDown className="h-3 w-3" />
                </button>
              </TH>
              <TH>Category</TH>
            </tr>
          </THead>
          <TBody>
            {filtered.length === 0 && (
              <tr>
                <TD colSpan={4} className="py-10 text-center text-slate-500">
                  No matching issues for current filters.
                </TD>
              </tr>
            )}
            {filtered.map((item) => (
              <Fragment key={item.id}>
                <tr className="cursor-pointer hover:bg-white/[0.03]" onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                  <TD>{item.id}</TD>
                  <TD>
                    <Badge tone={item.severity === "P1" ? "critical" : "warn"}>{item.severity}</Badge>
                  </TD>
                  <TD>{item.title}</TD>
                  <TD>{item.category}</TD>
                </tr>
                {expanded === item.id && (
                  <tr>
                    <TD colSpan={4} className="bg-black/25 text-slate-400">
                      {item.description}
                    </TD>
                  </tr>
                )}
              </Fragment>
            ))}
          </TBody>
        </Table>
      </div>
    </Card>
  );
}
