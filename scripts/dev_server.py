#!/usr/bin/env python3
"""Serve the site locally through one consistent HTTP entry point."""

from __future__ import annotations

import argparse
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import IO
from urllib.parse import urlsplit


REPO_ROOT = Path(__file__).resolve().parents[1]


class SiteRequestHandler(SimpleHTTPRequestHandler):
    """Static file handler with no-cache headers and folder-route support."""

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, directory=str(REPO_ROOT), **kwargs)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def translate_path(self, path: str) -> str:
        request_path = urlsplit(path).path
        last_segment = Path(request_path).name

        # Normalize extensionless routes like /about to /about/.
        if request_path and not request_path.endswith("/") and "." not in last_segment:
            path = f"{request_path}/"

        return super().translate_path(path)

    def send_head(self) -> IO[bytes] | None:
        resolved_path = Path(self.translate_path(self.path))
        if resolved_path.exists():
            return super().send_head()

        custom_404 = REPO_ROOT / "404.html"
        if custom_404.is_file():
            file_handle = custom_404.open("rb")
            stat = custom_404.stat()
            self.send_response(HTTPStatus.NOT_FOUND)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(stat.st_size))
            self.end_headers()
            return file_handle

        self.send_error(HTTPStatus.NOT_FOUND, "File not found")
        return None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Serve the site locally with consistent routing and caching disabled."
    )
    parser.add_argument("--host", default="127.0.0.1", help="Host interface to bind.")
    parser.add_argument(
        "--port", type=int, default=8000, help="Port to listen on (default: 8000)."
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    server = ThreadingHTTPServer((args.host, args.port), SiteRequestHandler)
    host = args.host
    port = args.port

    print(f"Serving {REPO_ROOT} at http://{host}:{port}/")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
