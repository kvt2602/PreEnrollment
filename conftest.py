import json
import os
import shutil
import subprocess
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import pytest


ROOT = os.path.dirname(os.path.abspath(__file__))
API_ROOT = os.environ.get("PREENROLLMENT_API_BASE", "http://localhost:4000").rstrip("/")
API_BASE = os.environ.get("API_BASE", f"{API_ROOT}/api").rstrip("/")


def api_request(method, path, payload=None, timeout=2):
    data = None
    headers = {"Content-Type": "application/json"}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")

    request = Request(
        f"{API_BASE}{path}",
        data=data,
        headers=headers,
        method=method,
    )

    try:
        with urlopen(request, timeout=timeout) as response:
            text = response.read().decode("utf-8")
            body = json.loads(text) if text else None
            return response.status, body
    except HTTPError as error:
        text = error.read().decode("utf-8")
        try:
            body = json.loads(text) if text else None
        except json.JSONDecodeError:
            body = text
        return error.code, body


def api_is_running():
    try:
        status, body = api_request("GET", "/health", timeout=2)
        return status == 200 and body == {"ok": True}
    except URLError:
        return False


def node_executable():
    return shutil.which("node") or "node"


@pytest.fixture(scope="session", autouse=True)
def api_server():
    if api_is_running():
        yield
        return

    process = subprocess.Popen(
        [node_executable(), "backend/src/server.js"],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )

    try:
        deadline = time.time() + 20
        while time.time() < deadline:
            if api_is_running():
                yield
                return
            if process.poll() is not None:
                output = process.stdout.read() if process.stdout else ""
                pytest.fail(f"Backend exited before becoming healthy:\n{output}")
            time.sleep(0.5)
        pytest.fail("Backend did not become healthy within 20 seconds")
    finally:
        if process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
