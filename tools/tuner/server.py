#!/usr/bin/env python3
"""
歌颂之丘 — 独立区域调色插件本地服务 (tools/tuner/server.py)
在不修改磁盘上 index.html 的前提下，通过内存注入挂载 tools/tuner/tuner.css 与 tuner.js，
并提供一键保存配置到 css/theme.css 的本地 API。
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import re
import socket
import sys
import threading
import urllib.parse
import webbrowser
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PLUGIN_DIR = Path(__file__).resolve().parent
ROOT_DIR = PLUGIN_DIR.parents[1]
THEME_CSS_PATH = ROOT_DIR / "css" / "theme.css"
MAX_THEME_BYTES = 256 * 1024

HEAD_INJECT = '  <link rel="stylesheet" href="/__tuner/tuner.css?v=5" />\n'
BODY_INJECT = (
    '  <script>window.__SH_TUNER_PLUGIN__ = { canWriteTheme: true };</script>\n'
    '  <script src="/__tuner/tuner.js?v=5"></script>\n'
)

mimetypes.add_type("text/css", ".css")
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("image/jpeg", ".jpg")
mimetypes.add_type("image/png", ".png")
mimetypes.add_type("image/svg+xml", ".svg")


def inject_tuner_assets(html_text: str) -> str:
    """在内存 HTML 中向 </head> 与 </body> 前挂载调色插件资源。"""
    if re.search(r"</head>", html_text, flags=re.IGNORECASE):
        html_text = re.sub(
            r"(</head>)",
            lambda m: f"{HEAD_INJECT}{m.group(1)}",
            html_text,
            count=1,
            flags=re.IGNORECASE,
        )
    else:
        html_text = HEAD_INJECT + html_text

    if re.search(r"</body>", html_text, flags=re.IGNORECASE):
        html_text = re.sub(
            r"(</body>)",
            lambda m: f"{BODY_INJECT}{m.group(1)}",
            html_text,
            count=1,
            flags=re.IGNORECASE,
        )
    else:
        html_text = html_text + "\n" + BODY_INJECT

    return html_text


def safe_resolve(base: Path, rel_url_path: str) -> Path | None:
    """将 URL 路径安全映射到 base 目录内部，阻止任何目录穿越。"""
    parts = [p for p in rel_url_path.split("/") if p and p != "."]
    if not parts or any(p == ".." for p in parts):
        return None
    base_resolved = base.resolve()
    target = (base_resolved / Path(*parts)).resolve()
    try:
        target.relative_to(base_resolved)
    except ValueError:
        return None
    return target


class TunerPluginHandler(BaseHTTPRequestHandler):
    server_version = "SingingHillTuner/1.0"

    def log_message(self, format: str, *args) -> None:
        # 仅保留简明状态日志，过滤常规静态资源刷屏
        if len(args) >= 2 and str(args[1]) not in ("200", "304"):
            super().log_message(format, *args)

    def _send_bytes(
        self,
        data: bytes,
        content_type: str,
        status: int = HTTPStatus.OK,
        head_only: bool = False,
    ) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if not head_only:
            self.wfile.write(data)

    def _send_json(self, payload: dict, status: int = HTTPStatus.OK) -> None:
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self._send_bytes(raw, "application/json; charset=utf-8", status=status)

    def _handle_get_or_head(self, head_only: bool) -> None:
        parsed = urllib.parse.urlsplit(self.path)
        raw_path = urllib.parse.unquote(parsed.path)

        if raw_path in ("/", "/index.html"):
            index_file = ROOT_DIR / "index.html"
            if not index_file.is_file():
                self._send_bytes(b"index.html not found", "text/plain; charset=utf-8", HTTPStatus.NOT_FOUND, head_only)
                return
            html_str = index_file.read_text(encoding="utf-8")
            injected = inject_tuner_assets(html_str).encode("utf-8")
            self._send_bytes(injected, "text/html; charset=utf-8", head_only=head_only)
            return

        if raw_path.startswith("/__tuner/"):
            rel = raw_path[len("/__tuner/") :]
            if rel not in ("tuner.css", "tuner.js"):
                self._send_bytes(b"Not Found", "text/plain; charset=utf-8", HTTPStatus.NOT_FOUND, head_only)
                return
            asset = safe_resolve(PLUGIN_DIR, rel)
            if not asset or not asset.is_file():
                self._send_bytes(b"Not Found", "text/plain; charset=utf-8", HTTPStatus.NOT_FOUND, head_only)
                return
            ctype = "text/css; charset=utf-8" if rel.endswith(".css") else "application/javascript; charset=utf-8"
            self._send_bytes(asset.read_bytes(), ctype, head_only=head_only)
            return

        target = safe_resolve(ROOT_DIR, raw_path)
        if not target or not target.is_file():
            self._send_bytes(b"Not Found", "text/plain; charset=utf-8", HTTPStatus.NOT_FOUND, head_only)
            return

        # 避免静态服务器意外暴露工具后端脚本
        if target.suffix.lower() in (".py", ".ps1", ".bat", ".cmd"):
            self._send_bytes(b"Forbidden", "text/plain; charset=utf-8", HTTPStatus.FORBIDDEN, head_only)
            return

        mime, _ = mimetypes.guess_type(str(target))
        if not mime:
            mime = "application/octet-stream"
        if mime.startswith("text/") or mime == "application/javascript":
            mime = f"{mime}; charset=utf-8"
        self._send_bytes(target.read_bytes(), mime, head_only=head_only)

    def do_GET(self) -> None:
        self._handle_get_or_head(head_only=False)

    def do_HEAD(self) -> None:
        self._handle_get_or_head(head_only=True)

    def do_POST(self) -> None:
        parsed = urllib.parse.urlsplit(self.path)
        if parsed.path != "/__tuner/save-theme":
            self._send_json({"ok": False, "error": "Unknown endpoint"}, HTTPStatus.NOT_FOUND)
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._send_json({"ok": False, "error": "Invalid Content-Length"}, HTTPStatus.BAD_REQUEST)
            return

        if length <= 0 or length > MAX_THEME_BYTES:
            self._send_json({"ok": False, "error": "Payload size out of range"}, HTTPStatus.BAD_REQUEST)
            return

        raw = self.rfile.read(length)
        try:
            css_text = raw.decode("utf-8")
        except UnicodeDecodeError:
            self._send_json({"ok": False, "error": "Invalid UTF-8"}, HTTPStatus.BAD_REQUEST)
            return

        if ":root" not in css_text or "--panel-glass-bg" not in css_text:
            self._send_json({"ok": False, "error": "Invalid theme stylesheet payload"}, HTTPStatus.BAD_REQUEST)
            return

        THEME_CSS_PATH.parent.mkdir(parents=True, exist_ok=True)
        THEME_CSS_PATH.write_text(css_text, encoding="utf-8", newline="\n")
        self._send_json({"ok": True, "bytes": len(raw)})


def pick_port(preferred: int) -> int:
    for port in range(preferred, preferred + 26):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    return 0


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser(description="歌颂之丘独立区域调色插件本地服务")
    parser.add_argument("--port", type=int, default=8765, help="首选监听端口 (默认 8765)")
    parser.add_argument("--no-browser", action="store_true", help="启动后不自动打开系统浏览器")
    args = parser.parse_args()

    port = pick_port(args.port)
    httpd = ThreadingHTTPServer(("127.0.0.1", port), TunerPluginHandler)
    actual_port = httpd.server_address[1]
    url = f"http://127.0.0.1:{actual_port}/"

    print("============================================================")
    print("  歌颂之丘 — 独立区域调色插件已启动")
    print(f"  预览地址: {url}")
    print(f"  站点目录: {ROOT_DIR}")
    print("  说明: index.html 保持纯净，调色板通过本地插件动态挂载")
    print("  点击调色板底部「直接写入 css/theme.css」即可直接保存定稿")
    print("  按 Ctrl+C 可随时停止服务")
    print("============================================================")

    if not args.no_browser:
        threading.Timer(0.45, lambda: webbrowser.open(url)).start()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n调色插件服务已停止。")
    finally:
        httpd.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
