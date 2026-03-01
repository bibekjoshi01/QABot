"""Checks the site speed and Core Web Vitals."""

from __future__ import annotations

import json
from typing import Any

from ..base import BaseTool, ToolExecutionResult
from ..playwright import PlaywrightComputerTool


class PerformanceAuditTool(BaseTool):
    name = "performance_audit"
    description = "Collect Core Web Vitals and browser performance metrics for the target page."
    timeout_seconds = 30
    input_schema = {
        "type": "object",
        "properties": {},
        "required": [],
    }

    def __init__(self, computer_tool: PlaywrightComputerTool):
        self._computer = computer_tool

    async def execute(self, arguments: dict[str, Any]) -> ToolExecutionResult:
        await self._computer.ensure_ready()

        # Collect performance metrics from browser
        try:
            metrics = await self._computer.collect_perf_metrics()
        except Exception as exc:
            return ToolExecutionResult(
                success=False, error=f"Failed to collect performance metrics: {exc}"
            )

        findings = []

        lcp = metrics.get("lcp_ms")
        cls = metrics.get("cls")
        fcp = metrics.get("fcp_ms")
        tbt = metrics.get("tbt_ms")  # optional, if your browser tool provides it

        # Threshold-based findings
        if isinstance(lcp, (int, float)) and lcp > 2500:
            findings.append(f"LCP above 2.5s threshold ({lcp}ms).")
        if isinstance(fcp, (int, float)) and fcp > 1800:
            findings.append(f"FCP above 1.8s threshold ({fcp}ms).")
        if isinstance(cls, (int, float)) and cls > 0.1:
            findings.append(f"CLS above 0.1 threshold ({cls}).")
        if isinstance(tbt, (int, float)) and tbt > 300:
            findings.append(f"TBT above 300ms ({tbt}ms).")

        if not findings:
            findings = ["No performance issues detected"]

        return ToolExecutionResult(
            success=True,
            output=json.dumps(
                {
                    "url": self._computer.current_url,
                    "metrics": metrics,
                    "findings": findings,
                }
            ),
            metadata={"url": self._computer.current_url},
        )
