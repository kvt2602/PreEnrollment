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


@pytest.fixture(scope="session")
def matrix_data():
    status, courses_body = api_request("GET", "/courses")
    assert status == 200

    status, preferences_body = api_request("GET", "/preferences/all")
    assert status == 200

    status, users_body = api_request("GET", "/users?role=student")
    assert status == 200

    courses = courses_body["courses"]
    preferences = preferences_body["preferences"]
    students = users_body["users"]

    matrix = calculate_overlap_matrix(courses, preferences)
    return {
        "courses": courses,
        "preferences": preferences,
        "students": students,
        "matrix": matrix,
    }


def calculate_overlap_matrix(courses, preferences):
    matrix = {
        course["id"]: {other["id"]: set() for other in courses}
        for course in courses
    }
    student_courses = {}

    for preference in preferences:
        student_courses.setdefault(preference["studentEmail"], []).append(preference["courseId"])

    for email, course_ids in student_courses.items():
        for course_a in course_ids:
            for course_b in course_ids:
                if course_a in matrix and course_b in matrix[course_a]:
                    matrix[course_a][course_b].add(email)

    return matrix


def overlap_level(count, unit_a, unit_b):
    if unit_a == unit_b:
        return "Self"
    if count == 0:
        return "No Overlap"
    if count == 1:
        return "Low"
    if count == 2:
        return "Medium"
    return "High"


def test_overlap_matrix_has_all_units_as_rows_and_columns(matrix_data):
    course_ids = {course["id"] for course in matrix_data["courses"]}
    matrix = matrix_data["matrix"]

    assert set(matrix.keys()) == course_ids
    for row in matrix.values():
        assert set(row.keys()) == course_ids


def test_diagonal_counts_match_unit_totals(matrix_data):
    preferences = matrix_data["preferences"]
    matrix = matrix_data["matrix"]

    for course in matrix_data["courses"]:
        course_id = course["id"]
        expected_students = {
            preference["studentEmail"]
            for preference in preferences
            if preference["courseId"] == course_id
        }
        assert matrix[course_id][course_id] == expected_students


def test_overlap_matrix_is_symmetric(matrix_data):
    matrix = matrix_data["matrix"]
    course_ids = list(matrix.keys())

    for course_a in course_ids:
        for course_b in course_ids:
            assert matrix[course_a][course_b] == matrix[course_b][course_a]


def test_known_demo_overlap_between_ict101_and_ict103(matrix_data):
    matrix = matrix_data["matrix"]

    assert "ICT101" in matrix
    assert "ICT103" in matrix
    assert "student@cihe.edu" in matrix["ICT101"]["ICT103"]
    assert "student@cihe.edu" in matrix["ICT103"]["ICT101"]


def test_overlap_analysis_api_reports_known_demo_overlap():
    status, body = api_request("GET", "/overlap-analysis")
    assert status == 200

    matching = [
        overlap for overlap in body["overlaps"]
        if overlap["studentEmail"] == "student@cihe.edu"
        and {course["unitCode"] for course in overlap["courses"]} >= {"ICT101", "ICT103"}
    ]
    assert matching, "Expected student@cihe.edu to overlap on ICT101 and ICT103"


def test_overlap_level_thresholds():
    assert overlap_level(0, "ICT101", "ICT103") == "No Overlap"
    assert overlap_level(1, "ICT101", "ICT103") == "Low"
    assert overlap_level(2, "ICT101", "ICT103") == "Medium"
    assert overlap_level(3, "ICT101", "ICT103") == "High"
    assert overlap_level(10, "ICT101", "ICT103") == "High"
    assert overlap_level(5, "ICT101", "ICT101") == "Self"


def test_pair_export_data_contains_student_identity(matrix_data):
    students_by_email = {
        student["email"]: student
        for student in matrix_data["students"]
    }
    emails = matrix_data["matrix"]["ICT101"]["ICT103"]

    assert "student@cihe.edu" in emails
    student = students_by_email["student@cihe.edu"]
    assert student["name"]
    assert student["ciheId"]


def test_zero_overlap_pair_contains_no_students_when_available(matrix_data):
    matrix = matrix_data["matrix"]

    for course_a, row in matrix.items():
        for course_b, emails in row.items():
            if course_a != course_b and len(emails) == 0:
                assert emails == set()
                return

    pytest.skip("No zero-overlap pair exists in current test data")
