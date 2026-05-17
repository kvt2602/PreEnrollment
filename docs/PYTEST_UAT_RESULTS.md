# Pytest UAT Results

**Project:** CIHE Pre-Enrolment System  
**Test file:** `tests/test_api_uat.py`  
**Run date:** 17 May 2026  
**Environment:** Python 3.13.0, pytest 8.3.4, local MySQL database

## Purpose

This file records the Python pytest execution for the main UAT/API workflows.
It supports the Capstone 2 test plan requirement for automated functional tests
using Python and pytest.

## Setup Used

Pytest was installed in a temporary virtual environment outside the repository:

```bash
python3 -m venv /tmp/preenrollment-pytest-venv
/tmp/preenrollment-pytest-venv/bin/python -m pip install -r requirements-dev.txt
```

The test suite can also be run from any local Python environment that has
pytest installed:

```bash
python -m pytest tests/test_api_uat.py -v
```

## Test Scope

The pytest suite covers:

- Backend health endpoint.
- Admin login.
- Student login.
- Invalid login rejection.
- Unit/course retrieval.
- Student list retrieval.
- Student preference retrieval.
- Statistics endpoint.
- Overlap analysis endpoint.
- Preference creation.
- Duplicate preference rejection.
- Admin preference status update.
- Cleanup of temporary test preference.

## Result Summary

| Metric | Result |
|---|---:|
| Tests collected | 11 |
| Tests passed | 11 |
| Tests failed | 0 |
| Final status | Passed |

## Command Run

```bash
/tmp/preenrollment-pytest-venv/bin/python -m pytest tests/test_api_uat.py -v
```

## Output

```text
============================= test session starts ==============================
platform darwin -- Python 3.13.0, pytest-8.3.4
rootdir: /Users/subarnarayamajhi/PreEnrollment
collected 11 items

tests/test_api_uat.py::test_health_endpoint_returns_ok PASSED
tests/test_api_uat.py::test_admin_login_accepts_valid_credentials PASSED
tests/test_api_uat.py::test_student_login_accepts_valid_credentials PASSED
tests/test_api_uat.py::test_invalid_login_is_rejected PASSED
tests/test_api_uat.py::test_courses_endpoint_returns_units PASSED
tests/test_api_uat.py::test_student_list_endpoint_returns_students PASSED
tests/test_api_uat.py::test_student_preferences_endpoint_returns_existing_preferences PASSED
tests/test_api_uat.py::test_statistics_endpoint_returns_unit_statistics PASSED
tests/test_api_uat.py::test_overlap_analysis_endpoint_returns_overlap_data PASSED
tests/test_api_uat.py::test_preference_create_duplicate_reject_and_cleanup PASSED
tests/test_api_uat.py::test_admin_can_update_preference_status_and_cleanup PASSED

============================== 11 passed in 1.48s ==============================
```

## Acceptance Notes

The pytest run confirmed that the main UAT workflows pass at API level. The
duplicate preference test is especially important because UAT previously found
that duplicate course preferences were allowed. After the backend fix, the
pytest test confirms that the API now returns HTTP 409 for duplicate
student-course preferences.

Temporary test data was removed at the end of the relevant tests, so the
database was not left with extra UAT records.
