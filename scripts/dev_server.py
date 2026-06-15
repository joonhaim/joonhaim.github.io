#!/usr/bin/env python3
"""Serve the site locally through one consistent HTTP entry point."""

from __future__ import annotations

import argparse
import errno
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


class ReusableThreadingHTTPServer(ThreadingHTTPServer):
    """HTTP server that releases ports more cleanly after shutdown."""

    allow_reuse_address = True
    daemon_threads = True


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Serve the site locally with consistent routing and caching disabled."
    )

    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="Host interface to bind to. Default: 127.0.0.1.",
    )

    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port to listen on. Default: 8000. Use 0 to let the OS choose.",
    )

    parser.add_argument(
        "--port-attempts",
        type=int,
        default=20,
        help="Number of extra ports to try if the selected port is busy. Default: 20.",
    )

    return parser.parse_args()


def create_server(
    host: str,
    port: int,
    port_attempts: int,
) -> ReusableThreadingHTTPServer:
    """Create a server, falling back to the next free port if needed."""

    if port < 0:
        raise ValueError("Port must be 0 or a positive integer.")

    if port == 0:
        return ReusableThreadingHTTPServer((host, 0), SiteRequestHandler)

    last_error: OSError | None = None

    for candidate_port in range(port, port + port_attempts + 1):
        try:
            return ReusableThreadingHTTPServer(
                (host, candidate_port),
                SiteRequestHandler,
            )
        except OSError as exc:
            if exc.errno != errno.EADDRINUSE:
                raise

            last_error = exc

            print(
                f"Port {candidate_port} is already in use. "
                "Trying the next port..."
            )

    raise OSError(
        f"No free port found from {port} to {port + port_attempts}."
    ) from last_error


def main() -> None:
    args = parse_args()

    server = create_server(
        host=args.host,
        port=args.port,
        port_attempts=args.port_attempts,
    )

    host, port = server.server_address[:2]

    print(f"Serving {REPO_ROOT} at http://{host}:{port}/")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()