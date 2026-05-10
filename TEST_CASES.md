# CIHE Pre-Enrolment System — Test Case Document

**Version:** 1.0  
**Date:** 2026-05-11  
**Tester:** _________________  
**Build / Commit:** _________________

---

## 0. Pre-conditions / Environment Setup

| # | Step | Expected | Pass/Fail | Notes |
|---|------|----------|-----------|-------|
| 0.1 | Start backend: `cd backend; npm run dev` | Console shows `Server running on port ...` and DB connected | | |
| 0.2 | Start frontend: `npm run dev` | Vite dev server starts; URL printed (e.g. http://localhost:5173) | | |
| 0.3 | Open the URL in browser | Login page loads with no console errors | | |
| 0.4 | DB has at least: 12 units, 10 students, 15 enrollments | Pre-seeded demo data visible after admin login | | |

---

## 1. Authentication

### TC-1.1 Admin login (valid)
- **Steps:** Enter admin credentials → click Login.
- **Expected:** Redirects to Admin Dashboard. Header shows admin name.

### TC-1.2 Student login (valid)
- **Steps:** Enter student credentials → click Login.
- **Expected:** Redirects to Student Dashboard.

### TC-1.3 Invalid login
- **Steps:** Enter wrong password.
- **Expected:** Error toast/message; no redirect.

### TC-1.4 Logout
- **Steps:** Click Logout in header.
- **Expected:** Returns to login page; protected routes inaccessible.

### TC-1.5 Password reset
- **Steps:** Click "Forgot password" → enter registered email → submit.
- **Expected:** Confirmation message; reset email/link generated.

---

## 2. Student Dashboard

### TC-2.1 View available units
- **Expected:** All active units listed with code, name, day, time.

### TC-2.2 Enrol in a unit
- **Steps:** Select unit → choose day/time → submit.
- **Expected:** Success toast; unit appears under "My Enrolments".

### TC-2.3 Day-conflict prevention
- **Steps:** Try to enrol in two units on the same day at overlapping times.
- **Expected:** System blocks or warns about clash.

### TC-2.4 Attendance day rule (target ≤ 2, max 3, ban 4+)
- **Steps:** Enrol across 1, 2, 3, then 4 distinct days.
- **Expected:** 1–2 days = OK, 3 = warning ("Acceptable"), 4+ = blocked or flagged.

### TC-2.5 Withdraw from unit
- **Steps:** Click drop on an enrolled unit.
- **Expected:** Removed from list; admin reports reflect the change.

---

## 3. Admin Dashboard — Overview

### TC-3.1 Stat cards
- **Expected:** Cards show correct totals (Students, Units, Enrolments, Multi-unit students).

### TC-3.2 Navigation tabs
- **Expected:** All tabs (Overview, Students, Units, Overlap, Reports) load without error.

---

## 4. Student Management

| # | Action | Expected |
|---|--------|----------|
| TC-4.1 | View student list | All students listed with CIHE ID, email |
| TC-4.2 | Search by name | Results filter live |
| TC-4.3 | Add new student | New row appears; appears in Reports |
| TC-4.4 | Edit student | Changes persist after page refresh |
| TC-4.5 | Delete student | Removed from list, reports, and matrix |

---

## 5. Unit Management

| # | Action | Expected |
|---|--------|----------|
| TC-5.1 | View unit list | All units with code, name, day, time |
| TC-5.2 | Add unit | Appears in matrix and reports immediately |
| TC-5.3 | Edit unit | Updates propagate to enrolment views |
| TC-5.4 | Delete unit | Removed everywhere; related enrolments handled gracefully |

---

## 6. Unit Overlap Matrix  ⭐ Core feature

### TC-6.1 Matrix renders
- **Expected:** N×N grid with all unit codes on rows + columns. Diagonal = dark slate cells. Legend visible (Unit Total / No Overlap / Low / Medium / High).

### TC-6.2 Diagonal value = unit total
- **Steps:** Pick any unit (e.g. ICT103). Note its diagonal number.
- **Cross-check:** Export *Unit Enrollment List* → "Total in Unit" for that unit must equal the diagonal value.

### TC-6.3 Diagonal click opens "Enrolled Students" modal
- **Steps:** Click ICT103 diagonal cell.
- **Expected:** Modal titled "Enrolled Students — ICT103 (X students)" listing names + CIHE IDs + emails. Count matches diagonal value.

### TC-6.4 Off-diagonal cell click opens "Overlapping Students" modal
- **Steps:** Click a non-zero off-diagonal cell, e.g. ICT101 ↔ ICT103.
- **Expected:** Modal titled "Overlapping Students — ICT101 ↔ ICT103 (X students)". Every listed student appears in both units' diagonal modals.

### TC-6.5 Symmetry
- **Expected:** Cell (A,B) value equals cell (B,A).

### TC-6.6 Colour coding
- 0 = white-grey, 1 = green, 2 = yellow, 3+ = red, diagonal = slate.

### TC-6.7 High-overlap warning panel
- **Expected:** Below matrix, a red warning lists pairs with 3+ common students and "→ Avoid scheduling at same time".

### TC-6.8 Matrix CSV export
- **Steps:** Click "Matrix CSV".
- **Expected:** Downloaded `.csv` opens in Excel as N×N grid; values match on-screen.

### TC-6.9 Pair Table CSV export
- **Steps:** Click "Pair Table CSV".
- **Expected:** Downloaded file lists each overlapping pair with count, level, and student names (CIHE IDs).

### TC-6.10 Empty / zero state
- **Steps:** Click a 0-value off-diagonal cell.
- **Expected:** No modal opens; not clickable.

---

## 7. Reports Module  ⭐ Core feature

### TC-7.1 Student Enrollment Report (CSV)
- **Headers:** `Student #, Student Name, CIHE ID, Email, Total Units, Unit Code, Unit Name, Day, Time`
- **Expected:** One row per enrolment; students with no enrolments still appear (one row, blanks).
- **Cross-check:** `Total Units` for student X equals the count of rows for that student where Unit Code is non-blank.

### TC-7.2 Unit Enrollment List (CSV)
- **Headers:** `Unit Code, Unit Name, Total in Unit, Student Name, CIHE ID, Email, Day, Time`
- **Cross-check vs matrix:** "Total in Unit" must equal that unit's diagonal value in the matrix (TC-6.2).

### TC-7.3 Student Attendance Days (CSV)
- **Headers:** `Student Name, CIHE ID, Email, Units Enrolled, Unit Codes, Distinct Days, Days, Status`
- **Status logic:** 0 → "No Enrollments", 1–2 → "OK (Target)", 3 → "Acceptable", 4+ → "Not Allowed (4+)".
- **Cross-check:** Pick a student → `Distinct Days` should equal the count of unique days in their `Days` column.

### TC-7.4 CSV opens cleanly in Excel
- **Expected:** UTF-8 BOM honoured; no broken characters; commas inside names escaped correctly.

### TC-7.5 No "Generate Report" button duplication
- **Expected:** Each report card has exactly one Generate Report button. Other tabs (Students, Units) do **not** have report buttons.

---

## 8. Cross-Module Consistency Checks

| # | Check | Pass/Fail |
|---|-------|-----------|
| TC-8.1 | Matrix diagonal (ICT103) = "Total in Unit" in Unit Enrolment List | |
| TC-8.2 | Matrix diagonal modal student list = filtered Unit Enrolment List rows for that unit | |
| TC-8.3 | Matrix off-diagonal modal students all appear under both units in Student Enrollment Report | |
| TC-8.4 | Distinct Days in Attendance report ≤ 3 for everyone (else flagged red) | |
| TC-8.5 | Total Enrolments stat card = sum of "Total in Unit" across Unit Enrolment List | |

---

## 9. Negative / Edge Cases

| # | Case | Expected |
|---|------|----------|
| TC-9.1 | Enrol same unit twice | Blocked with error |
| TC-9.2 | Delete unit that has enrolments | Cascade or warning, no orphaned data |
| TC-9.3 | Student with 0 enrolments | Appears in Reports with blanks; Attendance status = "No Enrollments" |
| TC-9.4 | Empty matrix (no enrolments) | Renders all zeros without crash |
| TC-9.5 | Long unit name | Truncates in matrix header but full name shown on hover |
| TC-9.6 | Network/backend down | Friendly error toast, no white screen |

---

## 10. UI / UX

| # | Check | Pass/Fail |
|---|-------|-----------|
| TC-10.1 | Responsive layout on 1280×720 | |
| TC-10.2 | Modal closes on ESC and click-outside | |
| TC-10.3 | All toasts auto-dismiss after a few seconds | |
| TC-10.4 | Tooltips appear on hover (matrix cells, unit codes) | |
| TC-10.5 | Loading states show while data fetches | |

---

## 11. Sign-off

- All critical (TC-1.x, TC-6.x, TC-7.x) cases pass: ☐
- Known issues recorded: ☐
- Tester signature: _________________  Date: __________
