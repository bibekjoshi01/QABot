from __future__ import annotations

import json
import ssl
import urllib.request
from html.parser import HTMLParser
from typing import Any
from urllib.parse import urlparse

from engine.tools.base import BaseTool, ToolExecutionResult


def _format_finding_line(detail: dict[str, Any]) -> str:
    return (
        f"{str(detail['severity']).upper()} | {detail['code']} | "
        f"{detail['location']} | {detail['message']}"
    )


def _attrs_to_dict(attrs: list[tuple[str, str | None]]) -> dict[str, str]:
    out: dict[str, str] = {}
    for key, value in attrs:
        out[(key or "").lower()] = value or ""
    return out


class _ClickableParser(HTMLParser):
    """Collect clickable elements relevant for basic interaction checks."""

    def __init__(self) -> None:
        super().__init__()
        self.anchors: list[dict[str, Any]] = []
        self.buttons: list[dict[str, Any]] = []
        self.role_buttons: list[dict[str, Any]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag_name = tag.lower()
        attr = _attrs_to_dict(attrs)

        if tag_name == "a":
            self.anchors.append(
                {
                    "href": attr.get("href", "").strip(),
                    "target": attr.get("target", "").strip(),
                    "rel": attr.get("rel", "").strip(),
                }
            )
            return

        if tag_name == "button":
            self.buttons.append(
                {
                    "type": (attr.get("type", "submit") or "submit").lower(),
                    "disabled": "disabled" in attr,
                }
            )
            return

        if tag_name == "input":
            input_type = (attr.get("type", "text") or "text").lower()
            if input_type in {"button", "submit", "reset"}:
                self.buttons.append(
                    {
                        "type": input_type,
                        "disabled": "disabled" in attr,
                    }
                )
            return

        if attr.get("role", "").strip().lower() == "button":
            self.role_buttons.append(
                {
                    "tag": tag_name,
                    "has_onclick": "onclick" in attr,
                    "tabindex": attr.get("tabindex", "").strip(),
                }
            )


class ButtonClickCheckerTool(BaseTool):
    """Validate common click-target problems in static markup."""

    name = "button_click_checker"
    description = "Check anchors/buttons for common non-actionable or broken interaction patterns."
    timeout_seconds = 45
    input_schema = {
        "type": "object",
        "properties": {
            "url": {"type": "string"},
        },
        "required": [],
    }

    def __init__(self, fallback_url: str | None = None):
        self._fallback_url = fallback_url

    async def execute(self, arguments: dict[str, Any]) -> ToolExecutionResult:
        url = str(arguments.get("url") or self._fallback_url or "").strip()
        if not url:
            return ToolExecutionResult(success=False, error="No URL provided")
        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"

        try:
            html = self._download_html(url)
        except Exception as exc:
            return ToolExecutionResult(success=False, error=f"Failed to fetch page HTML: {exc}")

        parser = _ClickableParser()
        parser.feed(html)

        broken_anchors: list[dict[str, Any]] = []
        disabled_buttons = 0
        weak_role_buttons: list[dict[str, Any]] = []

        for anchor in parser.anchors:
            href = anchor["href"]
            lower = href.lower()
            if not href or href == "#" or lower.startswith("javascript:"):
                broken_anchors.append({"href": href or "", "reason": "non-navigational href"})
                continue
            parsed = urlparse(href)
            if parsed.scheme and parsed.scheme not in {"http", "https"}:
                broken_anchors.append({"href": href, "reason": "unsupported link scheme"})

        for button in parser.buttons:
            if button["disabled"]:
                disabled_buttons += 1

        for item in parser.role_buttons:
            has_keyboard_access = item["tabindex"] in {"0", "-1"}
            if not item["has_onclick"] and not has_keyboard_access:
                weak_role_buttons.append(
                    {
                        "tag": item["tag"],
                        "reason": "role=button without onclick or keyboard focus hint",
                    }
                )

        finding_details: list[dict[str, Any]] = []
        for item in broken_anchors:
            href = item.get("href", "")
            finding_details.append(
                {
                    "code": "broken_anchor_target",
                    "severity": "medium",
                    "location": f"{url}#a[href='{href}']",
                    "message": f"Anchor target is not actionable: {item['reason']}.",
                    "evidence": item,
                }
            )
        if disabled_buttons:
            finding_details.append(
                {
                    "code": "disabled_button_controls_detected",
                    "severity": "low",
                    "location": url,
                    "message": f"Detected {disabled_buttons} disabled button control(s).",
                    "evidence": {"disabled_button_count": disabled_buttons},
                }
            )
        for item in weak_role_buttons:
            finding_details.append(
                {
                    "code": "weak_role_button_pattern",
                    "severity": "medium",
                    "location": f"{url}#{item['tag']}[role='button']",
                    "message": item["reason"],
                    "evidence": item,
                }
            )
        if not finding_details:
            finding_details.append(
                {
                    "code": "clickable_validation_passed",
                    "severity": "info",
                    "location": url,
                    "message": "No obvious clickable-element issues detected in static markup.",
                    "evidence": {},
                }
            )
        findings = [_format_finding_line(item) for item in finding_details]

        payload = {
            "url": url,
            "anchor_count": len(parser.anchors),
            "button_count": len(parser.buttons),
            "role_button_count": len(parser.role_buttons),
            "broken_anchors": broken_anchors,
            "disabled_button_count": disabled_buttons,
            "weak_role_buttons": weak_role_buttons,
            "finding_details": finding_details,
            "findings": findings,
        }

        return ToolExecutionResult(
            success=True,
            output=json.dumps(payload),
            metadata={
                "url": url,
                "anchor_count": len(parser.anchors),
                "button_count": len(parser.buttons),
                "broken_anchor_count": len(broken_anchors),
            },
        )

    def _download_html(self, url: str) -> str:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "QABot-ButtonClickChecker/1.0"},
            method="GET",
        )
        with urllib.request.urlopen(req, timeout=20, context=ssl.create_default_context()) as response:
            return response.read().decode("utf-8", errors="replace")
