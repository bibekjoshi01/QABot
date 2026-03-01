from __future__ import annotations

import json
import ssl
import urllib.error
import urllib.request
from html.parser import HTMLParser
from typing import Any
from urllib.parse import urljoin, urlparse

from engine.tools.base import BaseTool, ToolExecutionResult


def _format_finding_line(detail: dict[str, Any]) -> str:
    return (
        f"{str(detail['severity']).upper()} | {detail['code']} | "
        f"{detail['location']} | {detail['message']}"
    )


def _normalize_host(host: str) -> str:
    """Normalize hostname values so internal/external checks are consistent."""
    value = (host or "").lower()
    if value.startswith("www."):
        return value[4:]
    return value


class _LinkExtractor(HTMLParser):
    """Collect anchor `href` values from HTML markup."""

    def __init__(self) -> None:
        super().__init__()
        self.hrefs: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "a":
            return
        for key, value in attrs:
            if key.lower() == "href" and isinstance(value, str) and value.strip():
                self.hrefs.append(value.strip())
                break


class DeadLinkCheckerTool(BaseTool):
    """Functional QA tool to detect dead links on a page."""

    name = "dead_link_checker"
    description = (
        "Check anchor links for non-2xx responses and classify internal vs external."
    )
    timeout_seconds = 60
    input_schema = {
        "type": "object",
        "properties": {
            "url": {"type": "string"},
            "max_links": {"type": "integer", "minimum": 1, "maximum": 300},
            "check_external": {"type": "boolean"},
        },
        "required": [],
    }

    def __init__(self, fallback_url: str | None = None):
        self._fallback_url = fallback_url

    async def execute(self, arguments: dict[str, Any]) -> ToolExecutionResult:
        """
        Run end-to-end link validation for a target page.

        Flow:
        1. Resolve target URL and options.
        2. Download page HTML.
        3. Extract and normalize links.
        4. Probe HTTP status per link.
        5. Return structured results for downstream QA reasoning.
        """
        # Resolve runtime options with safe defaults.
        url = str(arguments.get("url") or self._fallback_url or "").strip()
        if not url:
            return ToolExecutionResult(success=False, error="No URL provided")
        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"

        max_links = int(arguments.get("max_links", 80))
        max_links = max(1, min(max_links, 300))
        check_external = bool(arguments.get("check_external", True))

        # HTML fetch failure means link scanning cannot proceed.
        try:
            html = self._download_html(url)
        except Exception as exc:
            return ToolExecutionResult(
                success=False, error=f"Failed to fetch page HTML: {exc}"
            )

        links = self._extract_links(base_url=url, html=html, max_links=max_links)
        if not links:
            finding_details = [
                {
                    "code": "no_links_to_check",
                    "severity": "info",
                    "location": url,
                    "message": "No qualifying HTTP/HTTPS links found to verify.",
                    "evidence": {"max_links": max_links},
                }
            ]
            return ToolExecutionResult(
                success=True,
                output=json.dumps(
                    {
                        "url": url,
                        "total_links_checked": 0,
                        "internal_links_checked": 0,
                        "external_links_checked": 0,
                        "dead_links": [],
                        "finding_details": finding_details,
                        "findings": [_format_finding_line(item) for item in finding_details],
                    }
                ),
                metadata={"url": url, "total_links_checked": 0},
            )

        base_host = _normalize_host(urlparse(url).hostname or "")
        dead_links: list[dict[str, Any]] = []
        internal_checked = 0
        external_checked = 0

        for link in links:
            host = _normalize_host(urlparse(link).hostname or "")
            link_type = "internal" if host == base_host else "external"
            # Optional external filtering keeps scans faster/focused.
            if link_type == "external" and not check_external:
                continue

            status, error = self._probe_status(link)
            if link_type == "internal":
                internal_checked += 1
            else:
                external_checked += 1

            if status is None or status < 200 or status >= 300:
                dead_links.append(
                    {
                        "url": link,
                        "type": link_type,
                        "status": status,
                        "error": error,
                    }
                )

        finding_details: list[dict[str, Any]] = []
        for dead in dead_links:
            status = dead.get("status")
            finding_details.append(
                {
                    "code": "dead_link",
                    "severity": "high" if isinstance(status, int) and status >= 500 else "medium",
                    "location": dead["url"],
                    "message": (
                        f"{dead['type']} link returned "
                        f"{status if status is not None else 'no status'}."
                    ),
                    "evidence": {
                        "type": dead["type"],
                        "status": dead.get("status"),
                        "error": dead.get("error"),
                    },
                }
            )
        if not dead_links:
            finding_details.append(
                {
                    "code": "no_dead_links_detected",
                    "severity": "info",
                    "location": url,
                    "message": "No non-2xx links detected within the scanned set.",
                    "evidence": {
                        "internal_links_checked": internal_checked,
                        "external_links_checked": external_checked,
                    },
                }
            )
        findings = [_format_finding_line(item) for item in finding_details]

        payload = {
            "url": url,
            "total_links_checked": internal_checked + external_checked,
            "internal_links_checked": internal_checked,
            "external_links_checked": external_checked,
            "dead_links": dead_links,
            "finding_details": finding_details,
            "findings": findings,
        }
        return ToolExecutionResult(
            success=True,
            output=json.dumps(payload),
            metadata={
                "url": url,
                "total_links_checked": payload["total_links_checked"],
                "dead_link_count": len(dead_links),
            },
        )

    def _download_html(self, url: str) -> str:
        """Fetch page HTML for link extraction."""
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "QABot-DeadLinkChecker/1.0"},
            method="GET",
        )
        with urllib.request.urlopen(
            req, timeout=20, context=ssl.create_default_context()
        ) as response:
            return response.read().decode("utf-8", errors="replace")

    def _extract_links(self, base_url: str, html: str, max_links: int) -> list[str]:
        """Extract unique HTTP/HTTPS links and normalize them to absolute URLs."""
        parser = _LinkExtractor()
        parser.feed(html)
        found: list[str] = []
        seen: set[str] = set()
        for href in parser.hrefs:
            value = href.strip()
            # Skip anchors and non-navigational schemes.
            if not value or value.startswith("#"):
                continue
            low = value.lower()
            if (
                low.startswith("javascript:")
                or low.startswith("mailto:")
                or low.startswith("tel:")
            ):
                continue
            absolute = urljoin(base_url, value)
            parsed = urlparse(absolute)
            if parsed.scheme not in {"http", "https"}:
                continue
            normalized = parsed._replace(fragment="").geturl()
            if normalized in seen:
                continue
            seen.add(normalized)
            found.append(normalized)
            # Bound work to keep tool latency predictable.
            if len(found) >= max_links:
                break
        return found

    def _probe_status(self, url: str) -> tuple[int | None, str | None]:
        """Probe link status with HEAD first, then fall back to GET when needed."""
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "QABot-DeadLinkChecker/1.0"},
            method="HEAD",
        )
        try:
            with urllib.request.urlopen(
                req, timeout=12, context=ssl.create_default_context()
            ) as response:
                return int(response.status), None
        except urllib.error.HTTPError as exc:
            if exc.code == 405:
                return self._probe_status_get(url)
            return int(exc.code), str(exc)
        except urllib.error.URLError as exc:
            return None, str(exc)
        except Exception as exc:
            return None, str(exc)

    def _probe_status_get(self, url: str) -> tuple[int | None, str | None]:
        """Fallback probe for servers that reject HEAD requests."""
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "QABot-DeadLinkChecker/1.0"},
            method="GET",
        )
        try:
            with urllib.request.urlopen(
                req, timeout=12, context=ssl.create_default_context()
            ) as response:
                return int(response.status), None
        except urllib.error.HTTPError as exc:
            return int(exc.code), str(exc)
        except urllib.error.URLError as exc:
            return None, str(exc)
        except Exception as exc:
            return None, str(exc)
