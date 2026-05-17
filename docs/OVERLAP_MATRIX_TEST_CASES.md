# Unit Overlap Matrix Test Cases

**Project:** CIHE Pre-Enrolment System  
**Module:** Admin Dashboard - Unit Overlap Matrix  
**Test type:** Functional, acceptance, and usability testing  
**Prepared for:** ICT308 Capstone 2 UAT evidence  
**Date:** 17 May 2026

## 1. Test Objective

The purpose of this test file is to verify that the Unit Overlap Matrix works
correctly for admin users. The matrix should help administrators identify units
that share the same students, so that high-overlap unit pairs are not scheduled
at the same time.

## 2. Scope

These test cases cover:

- Matrix rendering.
- Unit total values on diagonal cells.
- Overlap values on off-diagonal cells.
- Clickable detail modal for enrolled or overlapping students.
- Colour coding for overlap levels.
- High-overlap warning panel.
- Matrix CSV export.
- Unit pair CSV export.
- Empty or zero-overlap behaviour.
- Basic usability and readability.

## 3. Preconditions

| Item | Requirement |
|---|---|
| Backend | Running at `http://localhost:4000` |
| Frontend | Running at `http://localhost:3000` |
| Database | MySQL database `pre_enrolment` is available |
| Test user | Admin account exists, e.g. `admin@cihe.edu` |
| Test data | Courses, students, and preferences/enrolments are seeded |
| Browser | Chrome, Edge, or Safari |

## 4. Test Data

Suggested demo accounts:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@cihe.edu` | `admin123` |
| Student | `student@cihe.edu` | `student123` |

Suggested overlap example:

| Student | Unit 1 | Unit 2 | Expected overlap |
|---|---|---|---|
| `student@cihe.edu` | `ICT101` | `ICT103` | Student appears in both units |

## 5. Test Cases

| Test ID | Test case | Steps | Expected result | Status |
|---|---|---|---|---|
| OM-01 | Open overlap matrix | Log in as admin, open Admin Dashboard, select `Overlap Matrix` tab. | Unit Overlap Matrix loads without blank screen or console crash. | Not run |
| OM-02 | Matrix displays all units | Compare matrix row/column labels with the unit list. | Every active unit appears as both a row and a column. | Not run |
| OM-03 | Diagonal cell shows unit total | Pick a unit such as `ICT101`; compare the diagonal value with the number of students enrolled/preferred in that unit. | Diagonal value equals total students for that unit. | Not run |
| OM-04 | Off-diagonal cell shows shared students | Find a non-zero pair such as `ICT101` and `ICT103`. | Cell value equals the number of students common to both units. | Not run |
| OM-05 | Matrix symmetry | Compare cell `ICT101 -> ICT103` with `ICT103 -> ICT101`. | Both cells show the same number. | Not run |
| OM-06 | Diagonal click opens detail modal | Click a diagonal cell with count greater than 0. | Modal opens with title `Enrolled Students` and lists student name, CIHE ID, and email. | Not run |
| OM-07 | Off-diagonal click opens overlap modal | Click a non-zero off-diagonal cell. | Modal opens with title `Overlapping Students` and lists students shared by both units. | Not run |
| OM-08 | Zero cell is safe | Click an off-diagonal cell with value `0`. | No modal opens and no error occurs. | Not run |
| OM-09 | Colour coding - zero overlap | Locate a `0` overlap cell. | Cell uses light grey/white styling. | Not run |
| OM-10 | Colour coding - low overlap | Locate a cell with value `1`. | Cell uses green styling. | Not run |
| OM-11 | Colour coding - medium overlap | Locate a cell with value `2`. | Cell uses yellow styling. | Not run |
| OM-12 | Colour coding - high overlap | Locate a cell with value `3` or more. | Cell uses red styling. | Not run |
| OM-13 | Diagonal colour | Check any diagonal cell. | Diagonal cells use dark slate styling to show unit totals. | Not run |
| OM-14 | High-overlap warning panel | Ensure at least one pair has 3+ shared students. | Warning panel appears and lists high-overlap pairs with recommendation to avoid same-time scheduling. | Not run |
| OM-15 | Matrix CSV export | Click `Matrix CSV`. | CSV file downloads and contains unit codes as rows and columns with matching matrix values. | Not run |
| OM-16 | Pair Table CSV export | Click `Pair Table CSV`. | CSV file downloads and includes unit pair, count, overlap level, student names, and CIHE IDs. | Not run |
| OM-17 | Long unit names readability | Check unit headers for units with long names. | Matrix remains readable using unit codes; full names are available through context/detail text. | Not run |
| OM-18 | Responsive horizontal scroll | Resize browser to tablet/mobile width. | Matrix remains usable with horizontal scrolling and no layout break. | Not run |
| OM-19 | Modal close behaviour | Open a modal, then close it using outside click or close action. | Modal closes and user returns to matrix without data loss. | Not run |
| OM-20 | Empty data behaviour | Test with no preferences/enrolments. | Matrix renders zeros without crashing; high-overlap panel does not appear. | Not run |

## 6. Acceptance Criteria

The Unit Overlap Matrix is accepted when:

- The matrix renders for all units.
- Diagonal values correctly show total students per unit.
- Off-diagonal values correctly show shared students between unit pairs.
- Non-zero cells open a readable student detail modal.
- Zero cells do not trigger errors.
- Colour coding matches the expected overlap levels.
- CSV exports download successfully and match the on-screen values.
- High-overlap pairs are clearly highlighted for timetable planning.

## 7. Usability Feedback Checklist

| Usability item | Expected outcome | Status |
|---|---|---|
| Admin can understand what the matrix means | Legend explains diagonal, zero, low, medium, and high overlap cells. | Not run |
| Admin can identify risky unit pairs quickly | High-overlap pairs use red styling and warning panel. | Not run |
| Admin can inspect student details | Clicking a non-zero cell shows student names, CIHE IDs, and emails. | Not run |
| Admin can export evidence | Matrix and pair table CSV downloads are available. | Not run |
| Admin can use the matrix on smaller screens | Horizontal scrolling prevents layout breakage. | Not run |

## 8. Defect Log

| Defect ID | Description | Severity | Status | Notes |
|---|---|---|---|---|
| N/A | No defects recorded in this test file yet. | N/A | N/A | Update after manual UAT execution. |

## 9. Sign-Off

| Role | Name | Signature | Date |
|---|---|---|---|
| Tester |  |  |  |
| Supervisor / Reviewer |  |  |  |

## 10. Notes for Report

This test file supports Section 4.2 Acceptance and Usability Testing. It can be
used as evidence that the project team prepared a focused UAT plan for the
overlap analysis feature, which is one of the main admin decision-support tools
in the final system.
