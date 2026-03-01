import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CookieFinding, SecurityFinding } from "@/types/scan";

export function SecurityPanel({ headers, cookies }: { headers: SecurityFinding[]; cookies: CookieFinding[] }) {
  return (
    <Card className="p-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">Security Panel</h3>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-neon-red/40 bg-neon-red/5 p-4 shadow-critical">
          <p className="text-xs uppercase tracking-wide text-slate-400">Missing Headers</p>
          <div className="mt-3 space-y-2">
            {headers.map((item, index) => (
              <div
                key={`${item.header}-${item.severity}-${index}`}
                className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-2"
              >
                <span className="text-sm text-slate-200">{item.header}</span>
                <Badge tone={item.severity === "P1" ? "critical" : "warn"}>{item.severity}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Cookie Vulnerabilities</p>
          <table className="mt-3 w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="pb-2 text-left">Name</th>
                <th className="pb-2 text-left">Issue</th>
                <th className="pb-2 text-right">Severity</th>
              </tr>
            </thead>
            <tbody>
              {cookies.map((cookie, index) => (
                <tr key={`${cookie.name}-${cookie.issue}-${index}`} className="border-t border-white/10">
                  <td className="py-2">{cookie.name}</td>
                  <td className="py-2 text-slate-400">{cookie.issue}</td>
                  <td className="py-2 text-right">
                    <Badge tone={cookie.severity === "P1" ? "critical" : "warn"}>{cookie.severity}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
