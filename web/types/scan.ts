export type RunStatus = "Idle" | "Scanning" | "Analyzing" | "Completed" | "Failed";

export type Severity = "P1" | "P2";

export interface ScanIssue {
  id: string;
  severity: Severity;
  title: string;
  category: "Performance" | "Security" | "Accessibility" | "Network";
  description: string;
}

export interface PerfMetric {
  key: "FCP" | "DOM" | "TTFB" | "Resources";
  value: number;
  unit: "ms" | "count";
  target: number;
}

export interface SecurityFinding {
  header: string;
  missing: boolean;
  severity: Severity;
}

export interface CookieFinding {
  name: string;
  issue: string;
  severity: Severity;
}

export interface ScreenshotItem {
  id: string;
  step: string;
  ts: string;
  url: string;
  failed?: boolean;
}

export interface TraceStep {
  id: string;
  title: string;
  ts: string;
  status: "success" | "failed" | "running";
  toolCall: string;
  summary: string;
  screenshot?: string;
}

export interface ScanReport {
  id: string;
  targetUrl: string;
  httpStatus: number;
  riskScore: number;
  performanceScore: number;
  runStatus: RunStatus;
  startedAt: string;
  completedAt?: string;
  severity: { p1: number; p2: number };
  issues: ScanIssue[];
  performance: PerfMetric[];
  security: SecurityFinding[];
  cookies: CookieFinding[];
  screenshots: ScreenshotItem[];
  trace: TraceStep[];
  rawModelOutput: string;
  rawJson: Record<string, unknown>;
  logs: string[];
}

export interface ScanPayload {
  targetUrl: string;
  deviceProfile: "iPhone 14" | "Desktop" | "Tablet";
  networkProfile: "WiFi" | "4G" | "Slow 3G";
  contextJson?: string;
}

export interface BackendToolOutput {
  success: boolean;
  output: string | null;
  error: string | null;
  screenshot_base64: string | null;
  metadata: Record<string, unknown>;
}

export interface BackendTraceToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface BackendTraceStep {
  step: number;
  assistant_content: string;
  tool_calls: BackendTraceToolCall[];
}

export interface BackendScanResponse {
  url: string;
  issues: Array<Record<string, unknown>>;
  tool_outputs: BackendToolOutput[];
  screenshots: string[];
  raw_model_output: string;
  trace: BackendTraceStep[];
}
