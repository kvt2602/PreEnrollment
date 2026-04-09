# CIHE Pre-Enrolment System - System Information

## Current Status: ✅ RUNNING WITH NODE.JS API + MYSQL

The system now runs with a real backend using **Node.js + MySQL** and optional **phpMyAdmin** for DB management. This means:

- ✅ Data is persisted in MySQL
- ✅ React frontend communicates with Node API endpoints
- ✅ phpMyAdmin can be used for database inspection and admin tasks
- ✅ Full functionality available with shared backend data

## Recent Fixes (Latest Update)

### ✅ Fixed React Warnings:
1. **Duplicate key warnings** - Updated all map() functions to use unique compound keys instead of simple indices
2. **Chart rendering** - Fixed Recharts key issues in the DetailedReportsTab component
3. **Optimized component keys** - All list items now have proper unique identifiers

The Dialog ref warning you might see is a benign development warning from Radix UI and doesn't affect functionality.

---

## How to Use the System

### Demo Accounts (Pre-loaded)

#### Students:
- **Email:** student@cihe.edu | **Password:** student123
- **Email:** sarah@cihe.edu | **Password:** student123
- **Email:** michael@cihe.edu | **Password:** student123
- **Email:** emma@cihe.edu | **Password:** student123

#### Administrator:
- **Email:** admin@cihe.edu | **Password:** admin123

---

## Features

### Student Features:
1. **Login/Register** - Students can create new accounts or use existing ones
2. **View Courses** - Browse available courses with unit codes
3. **Submit Preferences** - Select courses with:
   - Day preference (Monday-Friday)
   - Time preference (Morning 8-12 or Evening 2-6)
4. **Track Status** - Monitor approval status of preferences:
   - ✅ Approved (green)
   - ⏳ Pending (yellow)
   - ❌ Rejected (red)
5. **Real-time Notifications** - See pending approval count

### Admin Features:
1. **View All Preferences** - See all student course selections
2. **Approve/Reject** - Manage student preferences with one click
3. **Course Reports** - Generate detailed enrollment statistics
4. **Overlap Analysis** - View:
   - Students with time conflicts (same time slot, multiple courses)
   - Course enrollment by day and time
   - Student names, CIHE IDs, and detailed breakdowns
5. **Export CSV Reports** - Download comprehensive reports with:
   - Course statistics
   - Same course/same time analysis
   - Weekly schedule matrix
   - Conflict detection

---

## Pre-loaded Demo Data

The system comes with:
- **8 courses** across various disciplines (CS, Business, Engineering, etc.)
- **5 demo users** (4 students + 1 admin)
- **Sample course preferences** to demonstrate overlap analysis

---

## Data Storage

Application data is stored in **MySQL** tables:

- `users`
- `courses`
- `preferences`

Client-side `cihe_user` in browser localStorage is only used to remember the currently logged-in session in the UI.

---

## Backend Stack

- Node.js API: `backend/src/server.js`
- MySQL schema: `backend/db/init.sql`
- phpMyAdmin: available through XAMPP (usually `http://localhost/phpmyadmin`)

---

## System Architecture

```
/App.tsx                        - Main app with routing logic
/components/
  LoginPage.tsx                 - Authentication (uses mockApi)
  StudentDashboard.tsx          - Student view (uses mockApi)
  AdminDashboard.tsx            - Admin view (uses mockApi)
  DashboardHeader.tsx           - Shared header component
  DetailedReportsTab.tsx        - Advanced reporting for admins
/utils/
   mockApi.ts                    - Frontend API client for Node backend
  supabase/info.tsx            - Supabase credentials (for future use)
/supabase/functions/server/
  index.tsx                     - Edge Function (ready for deployment)
```

---

## Troubleshooting

### If you see "No data":
- Make sure MySQL is running in XAMPP
- Confirm API health at `http://localhost:4000/api/health`

### If login doesn't work:
- Check the demo accounts listed above
- Ensure you're using the correct email format

### To reset the system:
- Use the "Reset Data to Demo Defaults" button on the login page, or
- POST to `http://localhost:4000/api/setup/seed` with `{ "force": true }`

---

## Next Steps

You can now:
1. ✅ Login as a student and submit course preferences
2. ✅ Login as admin and approve/reject preferences
3. ✅ Generate detailed CSV reports
4. ✅ View overlap analysis
5. ✅ Create new student/admin accounts

Enjoy your CIHE Pre-Enrolment System! 🎓