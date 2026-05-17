# Overlap Matrix Pytest Results

**Project:** CIHE Pre-Enrolment System  
**Feature:** Admin Unit Overlap Matrix  
**Test file:** `tests/test_overlap_matrix.py`  
**Run date:** 17 May 2026  
**Environment:** Python 3.13.0, pytest 8.3.4, local MySQL database

## Purpose

This file replaces the earlier manual overlap-matrix test checklist with
executable Python `pytest` evidence. The tests verify that the overlap matrix
data is calculated correctly from the system's units, preferences, and students.

## Test Scope

The pytest suite verifies:

- Every unit appears as a matrix row and column.
- Diagonal cells match total students for each unit.
- Off-diagonal overlap values are symmetric.
- The known demo overlap between `ICT101` and `ICT103` includes
  `student@cihe.edu`.
- The `/api/overlap-analysis` endpoint reports the known overlap.
- Overlap level thresholds are correct:
  - `0` = No Overlap
  - `1` = Low
  - `2` = Medium
  - `3+` = High
  - diagonal = Self
- Pair export data has student identity details such as name and CIHE ID.
- Zero-overlap pairs contain no students.

## Command Run

```bash
/tmp/preenrollment-pytest-venv/bin/python -m pytest tests/test_overlap_matrix.py -v
```

## Result Summary

| Metric | Result |
|---|---:|
| Tests collected | 8 |
| Tests passed | 8 |
| Tests failed | 0 |
| Final status | Passed |

## Output

```text
============================= test session starts ==============================
platform darwin -- Python 3.13.0, pytest-8.3.4
rootdir: /Users/subarnarayamajhi/PreEnrollment
collected 8 items

tests/test_overlap_matrix.py::test_overlap_matrix_has_all_units_as_rows_and_columns PASSED
tests/test_overlap_matrix.py::test_diagonal_counts_match_unit_totals PASSED
tests/test_overlap_matrix.py::test_overlap_matrix_is_symmetric PASSED
tests/test_overlap_matrix.py::test_known_demo_overlap_between_ict101_and_ict103 PASSED
tests/test_overlap_matrix.py::test_overlap_analysis_api_reports_known_demo_overlap PASSED
tests/test_overlap_matrix.py::test_overlap_level_thresholds PASSED
tests/test_overlap_matrix.py::test_pair_export_data_contains_student_identity PASSED
tests/test_overlap_matrix.py::test_zero_overlap_pair_contains_no_students_when_available PASSED

============================== 8 passed in 0.60s ===============================
```

## Acceptance Decision

The overlap matrix feature is accepted at the API/data-calculation level. The
tests confirm that the matrix data used by the admin interface is correct,
symmetric, and aligned with the overlap analysis endpoint.

The previous manual overlap-matrix checklist file was removed and replaced by
the Python pytest test file plus this result record.
