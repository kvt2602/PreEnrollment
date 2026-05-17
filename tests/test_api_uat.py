import json
import os
import subprocess
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

import pytest


ROOT = Path(__file__).resolve().parents[1]
API_BASE = os.environ.get("API_BASE", "http://localhost:4000/api")


def api_request(method, path, payload=None, timeout=5):
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


@pytest.fixture(scope="session", autouse=True)
def api_server():
    if api_is_running():
        yield
        return

    process = subprocess.Popen(
        ["npm", "run", "api:start"],
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
        output = process.stdout.read() if process.stdout else ""
        pytest.fail(f"Backend did not become healthy within 20 seconds:\n{output}")
    finally:
        if process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()


def get_student_preferences(email="student@cihe.edu"):
    status, body = api_request("GET", f"/preferences?email={quote(email)}")
    assert status == 200
    return body["preferences"]


def get_available_course_for_student(email="student@cihe.edu"):
    preferences = get_student_preferences(email)
    existing_course_ids = {preference["courseId"] for preference in preferences}

    status, body = api_request("GET", "/courses")
    assert status == 200
    for course in body["courses"]:
        if course["id"] not in existing_course_ids:
            return course

    pytest.skip("No available course found for temporary preference test")


def delete_preference(preference_id):
    return api_request("DELETE", f"/preferences/{quote(preference_id, safe='')}")


def create_temp_preference():
    course = get_available_course_for_student()
    payload = {
        "studentEmail": "student@cihe.edu",
        "courseId": course["id"],
        "timePreference": "8:15-11:15",
        "dayPreference": "Friday",
    }
    status, body = api_request("POST", "/preferences", payload)
    assert status == 201, body
    return body["preference"], payload


def test_health_endpoint_returns_ok():
    status, body = api_request("GET", "/health")
    assert status == 200
    assert body == {"ok": True}


def test_admin_login_accepts_valid_credentials():
    status, body = api_request(
        "POST",
        "/auth/login",
        {"email": "admin@cihe.edu", "password": "admin123"},
    )
    assert status == 200
    assert body["user"]["email"] == "admin@cihe.edu"
    assert body["user"]["role"] == "admin"


def test_student_login_accepts_valid_credentials():
    status, body = api_request(
        "POST",
        "/auth/login",
        {"email": "student@cihe.edu", "password": "student123"},
    )
    assert status == 200
    assert body["user"]["email"] == "student@cihe.edu"
    assert body["user"]["role"] == "student"


def test_invalid_login_is_rejected():
    status, body = api_request(
        "POST",
        "/auth/login",
        {"email": "student@cihe.edu", "password": "wrongpass"},
    )
    assert status == 401
    assert body["message"] == "Invalid email or password"


def test_courses_endpoint_returns_units():
    status, body = api_request("GET", "/courses")
    assert status == 200
    assert len(body["courses"]) >= 1
    assert {"id", "name", "unitCode"}.issubset(body["courses"][0])


def test_student_list_endpoint_returns_students():
    status, body = api_request("GET", "/users?role=student")
    assert status == 200
    assert len(body["users"]) >= 1
    assert all(user["role"] == "student" for user in body["users"])


def test_student_preferences_endpoint_returns_existing_preferences():
    preferences = get_student_preferences()
    assert isinstance(preferences, list)
    assert any(preference["studentEmail"] == "student@cihe.edu" for preference in preferences)


def test_statistics_endpoint_returns_unit_statistics():
    status, body = api_request("GET", "/statistics")
    assert status == 200
    assert len(body["statistics"]) >= 1
    assert {"courseId", "total", "pending", "approved"}.issubset(body["statistics"][0])


def test_overlap_analysis_endpoint_returns_overlap_data():
    status, body = api_request("GET", "/overlap-analysis")
    assert status == 200
    assert "overlaps" in body
    assert "totalOverlaps" in body
    assert body["totalOverlaps"] == len(body["overlaps"])


def test_preference_create_duplicate_reject_and_cleanup():
    preference, payload = create_temp_preference()
    created_ids = [preference["id"]]

    try:
        status, body = api_request("POST", "/preferences", payload)
        if status == 201:
            created_ids.append(body["preference"]["id"])
        assert status == 409
        assert body["message"] == "Preference already exists for this course"
    finally:
        for preference_id in created_ids:
            delete_preference(preference_id)


def test_admin_can_update_preference_status_and_cleanup():
    preference, _payload = create_temp_preference()
    try:
        status, body = api_request(
            "PATCH",
            f"/preferences/{quote(preference['id'], safe='')}/status",
            {"status": "approved"},
        )
        assert status == 200
        assert body["preference"]["status"] == "approved"
    finally:
        delete_preference(preference["id"])
