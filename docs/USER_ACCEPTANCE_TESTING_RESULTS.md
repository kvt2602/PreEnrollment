# User Acceptance Testing Results

**Project:** CIHE Pre-Enrolment System  
**Module tested:** Student and Admin core workflows, including Overlap Analysis  
**UAT source document:** `ICT308_Capstone2_TestPlan_UAT_Group2-1.docx`  
**Run date:** 17 May 2026  
**Tester:** Local UAT run with Codex assistance  
**Environment:** Localhost frontend and backend with MySQL `pre_enrolment`
**Automated test suite:** `tests/test_api_uat.py`

## 1. UAT Objective

The purpose of this User Acceptance Testing run was to confirm that the system
supports the main user workflows expected by students and administrators:

- Students can log in.
- Admin users can log in.
- Invalid login is rejected.
- Admin can retrieve students, units, reports, and overlap analysis data.
- Students can view and submit preferences.
- Duplicate student preferences are rejected.
- Admin can update preference status.
- Temporary test data can be cleaned up safely.

## 2. Test Environment

| Item | Value |
|---|---|
| Frontend URL | `http://localhost:3000` |
| Backend URL | `http://localhost:4000` |
| Database | MySQL `pre_enrolment` |
| Admin test account | `admin@cihe.edu` / `admin123` |
| Student test account | `student@cihe.edu` / `student123` |
| Browser/server check | Frontend returned HTTP 200 |
| API health check | Backend returned `{"ok":true}` |
| Python test command | `python -m pytest tests/test_api_uat.py -v` |

## 3. Test Data Used

Existing demo data was used for most tests. A temporary preference was also
created during UAT and deleted after the test run.

| Test data | Value |
|---|---|
| Existing student | `student@cihe.edu` |
| Existing student preferences before test | `ICT101`, `ICT103` |
| Temporary UAT unit | `BUS101` |
| Temporary UAT time slot | `8:15-11:15` |
| Temporary UAT day | `Friday` |
| Cleanup status | Temporary `BUS101` test preference deleted successfully |

## 4. UAT Execution Summary

| Result | Count |
|---|---:|
| Passed after fix | 14 |
| Failed after fix | 0 |
| Pytest automated tests passed | 11 |
| Defects found during first run | 1 |
| Defects fixed and retested | 1 |

Final UAT outcome: **Accepted after defect fix**

## 5. UAT Test Results

| UAT ID | User story / workflow | Expected result | Actual result | Status |
|---|---|---|---|---|
| UAT-01 | User checks backend availability | `/api/health` returns `ok=true` | Backend returned `ok=true` | Pass |
| UAT-02 | User opens frontend | Login page/frontend is served | Frontend returned HTTP 200 | Pass |
| UAT-03 | Admin logs in | Admin account is accepted and role is `admin` | `admin@cihe.edu` logged in as admin | Pass |
| UAT-04 | Student logs in | Student account is accepted and role is `student` | `student@cihe.edu` logged in as student | Pass |
| UAT-05 | Invalid login attempt | Wrong password is rejected | API returned `401 Unauthorized` with invalid login message | Pass |
| UAT-06 | Admin views unit list | Unit list is returned | 23 units returned | Pass |
| UAT-07 | Admin views student list | Student list is returned | 6 students returned | Pass |
| UAT-08 | Student views own preferences | Student preference list is returned | 2 existing preferences returned | Pass |
| UAT-09 | Admin views reporting data | Statistics are available | Statistics returned for 23 units | Pass |
| UAT-10 | Admin views overlap analysis | Overlap groups are available | 1 overlap group returned | Pass |
| UAT-11 | Student submits a new preference | New preference is created with pending status | Temporary `BUS101` preference created | Pass |
| UAT-12 | Student submits same unit twice | Duplicate preference is rejected | API returned `409 Preference already exists for this course` | Pass |
| UAT-13 | Admin approves preference | Preference status updates to approved | Temporary preference status changed to approved | Pass |
| UAT-14 | Test data cleanup | Temporary test preference is deleted | Temporary preference deleted successfully | Pass |

## 6. Defect Found During UAT

| Defect ID | Description | Severity | First result | Fix applied | Retest result |
|---|---|---|---|---|---|
| UAT-D01 | The backend allowed the same student to submit the same unit preference more than once. | Medium | Duplicate `BUS101` preference was accepted with HTTP 201. | Added backend duplicate check in `POST /api/preferences`. If `student_email` and `course_id` already exist, API now returns HTTP 409. | Passed. Duplicate preference was rejected with HTTP 409. |

## 7. Fix Details

The backend preference submission route now checks whether the same student has
already submitted a preference for the same course before inserting a new row.

Expected response after the fix:

```text
HTTP 409 Conflict
Preference already exists for this course
```

This matches the expected UAT behaviour that a student should not be able to
submit duplicate preferences for the same unit.

## 8. Evidence from Final UAT Run

Final automated UAT run produced the following results:

```text
UAT-01 PASS - Backend health endpoint
UAT-02 PASS - Frontend login page is served
UAT-03 PASS - Admin can log in
UAT-04 PASS - Student can log in
UAT-05 PASS - Invalid password is rejected
UAT-06 PASS - Admin can retrieve unit list
UAT-07 PASS - Admin can retrieve student list
UAT-08 PASS - Student can view own preferences
UAT-09 PASS - Admin reporting statistics are available
UAT-10 PASS - Overlap analysis is available
UAT-11 PASS - Student submits a new preference using UI time-slot value
UAT-12 PASS - Duplicate preference is rejected
UAT-13 PASS - Admin can update preference status
UAT-14 PASS - Temporary preference cleanup
```

The same core workflows were also verified using Python `pytest`:

```text
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

11 passed in 1.48s
```

## 9. User Acceptance Feedback

| Feedback / acceptance point | Outcome |
|---|---|
| Students must be able to access the system using valid credentials. | Accepted |
| Admin users must be able to access admin data. | Accepted |
| Invalid credentials must not allow access. | Accepted |
| Unit and student data must be retrievable for admin workflows. | Accepted |
| Overlap analysis must return shared-unit data for scheduling decisions. | Accepted |
| Students must not submit duplicate preferences for the same unit. | Accepted after fix |
| Test data should not pollute the final database. | Accepted; temporary preference was deleted |

## 10. Remaining Manual UAT Recommendations

The API-backed UAT passed. Before final presentation, the following browser
click-through checks should still be demonstrated manually to the teacher:

- Login using the browser as admin.
- Open `Admin Dashboard -> Overlap Matrix`.
- Show that the matrix is visible.
- Click a non-zero overlap cell and show the student detail modal.
- Export `Matrix CSV`.
- Export `Pair Table CSV`.
- Login as student.
- Add a preference through the student dashboard.
- Try adding the same unit again and confirm duplicate prevention is visible.

## 11. Final UAT Decision

Based on the final UAT run, the system is **accepted for demonstration**.
The tested workflows passed after resolving the duplicate-preference defect.

Sign-off:

| Role | Name | Signature | Date |
|---|---|---|---|
| Tester |  |  |  |
| Project representative |  |  |  |
| Supervisor / Teacher |  |  |  |
