import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">Settings</h2>
      <p className="mt-2 text-sm text-slate-400">Environment-specific agent configuration will appear here.</p>
    </Card>
  );
}