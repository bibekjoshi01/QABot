import json

import pytest

from engine.tools.base import ToolExecutionResult
from engine.tools.security import SecurityContentAuditTool


class MockComputerTool:
    def __init__(self, snapshot):
        self._snapshot = snapshot
        self.current_url = "https://testsite.com"

    async def ensure_ready(self):
        return

    async def collect_page_snapshot(self):
        return self._snapshot

    async def execute(self, arguments):
        # simulate screenshot
        return ToolExecutionResult(success=True, screenshot_base64="fake_screenshot_data")


# TEST: No Issues
# -----------------------------
@pytest.mark.asyncio
async def test_security_content_no_issues():
    snapshot = {
        "insecure_form_actions": 0,
        "mixed_content_references": 0,
        "inline_script_blocks": 2,
    }

    tool = SecurityContentAuditTool(MockComputerTool(snapshot))
    result = await tool.execute({})

    assert result.success is True
    data = json.loads(result.output)

    assert data["url"] == "https://testsite.com"
    assert "No security issues detected." in data["findings"]


# TEST: Insecure Form
# -----------------------------
@pytest.mark.asyncio
async def test_security_content_insecure_form():
    snapshot = {
        "insecure_form_actions": 1,
        "mixed_content_references": 0,
        "inline_script_blocks": 2,
    }

    tool = SecurityContentAuditTool(MockComputerTool(snapshot))
    result = await tool.execute({})

    data = json.loads(result.output)

    assert "Form action posting over HTTP detected." in data["findings"]


# TEST: Mixed Content
# -----------------------------
@pytest.mark.asyncio
async def test_security_content_mixed_content():
    snapshot = {
        "insecure_form_actions": 0,
        "mixed_content_references": 3,
        "inline_script_blocks": 2,
    }

    tool = SecurityContentAuditTool(MockComputerTool(snapshot))
    result = await tool.execute({})

    data = json.loads(result.output)

    assert "Mixed content (HTTP resources on HTTPS page) detected." in data["findings"]


# TEST: Excessive Inline Scripts
# -----------------------------
@pytest.mark.asyncio
async def test_security_content_inline_scripts():
    snapshot = {
        "insecure_form_actions": 0,
        "mixed_content_references": 0,
        "inline_script_blocks": 15,
    }

    tool = SecurityContentAuditTool(MockComputerTool(snapshot))
    result = await tool.execute({})

    data = json.loads(result.output)

    assert any("inline scripts" in f.lower() for f in data["findings"])


# TEST: Screenshot Included
# -----------------------------
@pytest.mark.asyncio
async def test_security_content_with_screenshot():
    snapshot = {
        "insecure_form_actions": 0,
        "mixed_content_references": 0,
        "inline_script_blocks": 0,
    }

    tool = SecurityContentAuditTool(MockComputerTool(snapshot))
    result = await tool.execute({"include_screenshot": True})

    assert result.screenshot_base64 == "fake_screenshot_data"
