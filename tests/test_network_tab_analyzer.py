import json

import pytest

from engine.tools.console import NetworkTabAnalyzerTool


class _FakeComputer:
    def __init__(self):
        self.current_url = "https://example.com/dashboard"

    async def ensure_ready(self):
        return None

    async def get_network_responses(self, limit: int = 120):
        return [
            {"url": "https://example.com/api/auth/login", "status": 200, "method": "POST", "resource_type": "xhr"},
            {"url": "https://example.com/api/profile", "status": 200, "method": "GET", "resource_type": "xhr"},
            {"url": "https://example.com/api/orders", "status": 500, "method": "GET", "resource_type": "xhr"},
        ][:limit]

    async def get_request_failures(self, limit: int = 50):
        return ["GET https://example.com/api/orders :: net::ERR_ABORTED"][:limit]

    async def get_console_events(self, limit: int = 50):
        return ["[error] Failed to fetch /api/orders"][:limit]


@pytest.mark.asyncio
async def test_network_tab_analyzer_returns_detailed_findings():
    tool = NetworkTabAnalyzerTool(computer_tool=_FakeComputer())
    result = await tool.execute({"endpoint_contains": "/api"})
    assert result.success is True
    payload = json.loads(result.output or "{}")
    assert payload["response_count"] == 3
    assert payload["status_5xx_count"] == 1
    assert payload["request_failure_count"] == 1
    codes = {item["code"] for item in payload["finding_details"]}
    assert "server_error_responses_detected" in codes
    assert "request_failures_detected" in codes

