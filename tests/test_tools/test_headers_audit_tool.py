import json

import pytest

from engine.tools.security import SecurityHeadersAuditTool


@pytest.mark.asyncio
async def test_headers_valid_site():
    tool = SecurityHeadersAuditTool()

    result = await tool.execute({"url": "https://example.com"})

    assert result.success is True
    assert result.error is None
    assert result.output is not None

    data = json.loads(result.output)

    assert "url" in data
    assert "findings" in data
    assert isinstance(data["findings"], list)


@pytest.mark.asyncio
async def test_headers_missing_on_http():
    tool = SecurityHeadersAuditTool()

    result = await tool.execute({"url": "http://example.com"})

    # HTTP sites often lack security headers
    assert result.success is True
    data = json.loads(result.output)

    assert isinstance(data["findings"], list)


@pytest.mark.asyncio
async def test_headers_invalid_domain():
    tool = SecurityHeadersAuditTool()

    result = await tool.execute({"url": "https://nonexistent-domain-xyz-123.com"})

    assert result.success is False
    assert result.error is not None
