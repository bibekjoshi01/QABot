from __future__ import annotations

import json
from typing import TYPE_CHECKING, Any

from engine.tools.base import BaseTool, ToolExecutionResult

if TYPE_CHECKING:
    from engine.tools.playwright import PlaywrightComputerTool


def _format_finding_line(detail: dict[str, Any]) -> str:
    return (
        f"{str(detail['severity']).upper()} | {detail['code']} | "
        f"{detail['location']} | {detail['message']}"
    )


class NetworkTabAnalyzerTool(BaseTool):
    """Analyze recent network and console activity from browser runtime."""

    name = "network_tab_analyzer"
    description = "Analyze network responses/failures and summarize API reliability signals."
    timeout_seconds = 30
    input_schema = {
        "type": "object",
        "properties": {
            "limit": {"type": "integer", "minimum": 1, "maximum": 500},
            "endpoint_contains": {"type": "string"},
            "include_console": {"type": "boolean"},
            "include_failures": {"type": "boolean"},
        },
        "required": [],
    }

    def __init__(self, computer_tool: "PlaywrightComputerTool"):
        self._computer = computer_tool

    async def execute(self, arguments: dict[str, Any]) -> ToolExecutionResult:
        await self._computer.ensure_ready()
        limit = int(arguments.get("limit", 120))
        limit = max(1, min(limit, 500))
        endpoint_contains = str(arguments.get("endpoint_contains") or "").strip().lower()
        include_console = bool(arguments.get("include_console", True))
        include_failures = bool(arguments.get("include_failures", True))

        responses = await self._computer.get_network_responses(limit=limit)
        request_failures = await self._computer.get_request_failures(limit=limit) if include_failures else []
        console_events = await self._computer.get_console_events(limit=limit) if include_console else []

        if endpoint_contains:
            responses = [item for item in responses if endpoint_contains in str(item.get("url", "")).lower()]
            request_failures = [item for item in request_failures if endpoint_contains in item.lower()]

        status_2xx = sum(1 for item in responses if isinstance(item.get("status"), int) and 200 <= int(item["status"]) < 300)
        status_4xx = sum(1 for item in responses if isinstance(item.get("status"), int) and 400 <= int(item["status"]) < 500)
        status_5xx = sum(1 for item in responses if isinstance(item.get("status"), int) and int(item["status"]) >= 500)

        finding_details: list[dict[str, Any]] = []
        if status_5xx > 0:
            finding_details.append(
                {
                    "code": "server_error_responses_detected",
                    "severity": "high",
                    "location": str(self._computer.current_url or ""),
                    "message": f"Detected {status_5xx} server-error response(s) in captured network traffic.",
                    "evidence": {"status_5xx_count": status_5xx},
                }
            )
        if status_4xx > 0:
            finding_details.append(
                {
                    "code": "client_error_responses_detected",
                    "severity": "medium",
                    "location": str(self._computer.current_url or ""),
                    "message": f"Detected {status_4xx} client-error response(s) in captured network traffic.",
                    "evidence": {"status_4xx_count": status_4xx},
                }
            )
        if request_failures:
            finding_details.append(
                {
                    "code": "request_failures_detected",
                    "severity": "high",
                    "location": str(self._computer.current_url or ""),
                    "message": f"Detected {len(request_failures)} failed request event(s).",
                    "evidence": {"request_failures": request_failures[:20]},
                }
            )
        if not finding_details:
            finding_details.append(
                {
                    "code": "network_runtime_clean",
                    "severity": "info",
                    "location": str(self._computer.current_url or ""),
                    "message": "No high-signal network failures detected in captured events.",
                    "evidence": {"status_2xx_count": status_2xx},
                }
            )

        findings = [_format_finding_line(item) for item in finding_details]
        payload = {
            "url": self._computer.current_url,
            "endpoint_filter": endpoint_contains or None,
            "response_count": len(responses),
            "status_2xx_count": status_2xx,
            "status_4xx_count": status_4xx,
            "status_5xx_count": status_5xx,
            "request_failure_count": len(request_failures),
            "responses": responses,
            "request_failures": request_failures,
            "console_events": console_events,
            "finding_details": finding_details,
            "findings": findings,
        }
        return ToolExecutionResult(
            success=True,
            output=json.dumps(payload),
            metadata={
                "url": self._computer.current_url,
                "response_count": len(responses),
                "request_failure_count": len(request_failures),
            },
        )
