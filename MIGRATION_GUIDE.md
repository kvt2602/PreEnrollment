# Quick Setup Guide - Database Migration & Backend Configuration

## Step 1: Apply Database Migration

### Option A: Using MySQL Command Line

```bash
cd c:\xampp\htdocs\PreEnrollment\database
mysql -u root enrollment_db < migration_add_batches.sql
```

### Option B: Using phpMyAdmin

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Select database: `enrollment_db`
3. Click "Import" tab
4. Upload file: `database/migration_add_batches.sql`
5. Click "Go"

### Option C: Manual SQL Execution

1. Open phpMyAdmin → SQL tab
2. Copy and paste contents of `migration_add_batches.sql`
3. Execute

## Step 2: Verify Migration Success

Run this query in phpMyAdmin SQL tab to verify:

```sql
-- Check new tables exist
SHOW TABLES LIKE '%batch%';
SHOW TABLES LIKE '%reset%';
SHOW TABLES LIKE '%grouping%';

-- Should return: class_batches, password_resets, course_groupings

-- Check new columns
DESC enrollments;
-- Should show: batch_id column

DESC course_schedules;
-- Should show: batch_number column
```

## Step 3: Verify Course Groupings Inserted

```sql
SELECT * FROM course_groupings;

-- Should show:
-- ICT307 (Project1) ↔ ICT309 (GRC)
-- ICT206 (Software Eng) ↔ ICT203 (Web App Dev)
```

## Step 4: Configure Frontend Routes

Update your `frontend/src/App.js` to include new routes:

```javascript
import AdminReports from './components/AdminReports';
import AdvancedAdminDashboard from './components/AdvancedAdminDashboard';
import PasswordReset from './components/PasswordReset';

// Add to your router configuration:
<Route path="/admin/reports" element={<AdminReports />} />
<Route path="/admin/dashboard-advanced" element={<AdvancedAdminDashboard />} />
<Route path="/reset-password" element={<PasswordReset />} />
```

## Step 5: Update Login Page

Add "Forgot Password?" link:

```javascript
<p className="auth-link">
  <a href="/reset-password">Forgot password?</a>
</p>
```

## Step 6: Test All Features

### Test Reports
```
http://localhost:3000/admin/reports
- Generate course enrollment report
- Download CSV
```

### Test Admin Dashboard
```
http://localhost:3000/admin/dashboard-advanced
- View statistics
- Approve/reject enrollments
- View batch info
```

### Test Password Reset
```
http://localhost/PreEnrollment/
- Go to login
- Click "Forgot password?"
- Enter email
- Use token to reset (dev mode) or check email (production)
```

## Step 7: Create Test Data (Optional)

If you want to test with sample data:

```sql
-- Insert test schedule times if not present
INSERT INTO schedule_times (time_slot, start_time, end_time) 
SELECT 'Morning', '08:15:00', '11:15:00'
WHERE NOT EXISTS (SELECT 1 FROM schedule_times WHERE time_slot = 'Morning');

-- Create sample course schedules
INSERT INTO course_schedules (course_id, day_of_week, time_id, max_students, semester)
SELECT 1, 'Monday', 1, 30, 2
WHERE NOT EXISTS (SELECT 1 FROM course_schedules WHERE course_id = 1 AND day_of_week = 'Monday');

-- Insert batch for sample enrollment
INSERT INTO class_batches (schedule_id, batch_number, max_capacity, current_enrollment, status)
SELECT 1, 1, 30, 0, 'open'
WHERE NOT EXISTS (SELECT 1 FROM class_batches WHERE schedule_id = 1 AND batch_number = 1);
```

## Important Notes

### Existing Data Compatibility
- ✅ All existing enrollments remain unchanged
- ✅ New `batch_id` column is nullable - old enrollments don't need immediate batch assignment
- ⚠️ When old enrollments are approved by admin again, they'll be assigned to batches

### Migration Rollback (if needed)
```sql
-- Drop new tables
DROP TABLE IF EXISTS course_groupings;
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS class_batches;

-- Remove new columns
ALTER TABLE enrollments DROP COLUMN batch_id;
ALTER TABLE course_schedules DROP COLUMN batch_number;
```

## Troubleshooting Migration Issues

### Error: Table 'enrollment_db' doesn't exist
- Ensure database exists: `CREATE DATABASE IF NOT EXISTS enrollment_db;`
- Check database name in config/db.php

### Error: Foreign key constraint fails
- Verify courses table exists and has data
- Check course_codes exist: `SELECT * FROM courses LIMIT 5;`

### Error: Duplicate entry for unique key
- Check if tables already exist from previous run
- Delete tables first or comment out CREATE TABLE IF NOT EXISTS

### Cannot import file
- Ensure file path is correct
- Check file permissions (read access)
- Verify file is valid SQL

## Support for Issues

If migration fails:

1. **Check phpMyAdmin Logs**:
   - Open phpMyAdmin → Errors tab
   - Messages show exact SQL error

2. **Check MySQL Error Log**:
   - Location: `C:\xampp\mysql\data\*.err`
   
3. **Run Individual Migrations**:
   - Create each table manually in phpMyAdmin → SQL tab
   - Copy sections from migration_add_batches.sql

4. **Verify Schema**:
   ```sql
   -- Check all tables exist
   SHOW TABLES;
   
   -- Check enrollment table structure
   DESC enrollments;
   DESC course_schedules;
   DESC users;
   ```

## Environment Setup Checklist

- [ ] XAMPP Apache running
- [ ] MySQL service running
- [ ] Database `enrollment_db` exists
- [ ] Migration file `migration_add_batches.sql` exists
- [ ] API files created:
  - [ ] `/api/reports.php`
  - [ ] `/api/password_reset.php`
- [ ] React components created:
  - [ ] `AdminReports.js`
  - [ ] `AdvancedAdminDashboard.js`
  - [ ] `PasswordReset.js`
- [ ] Routes added to App.js
- [ ] Frontend npm dependencies up to date
- [ ] Backend PHP files configured

## Next Steps

1. Run XAMPP (Apache + MySQL)
2. Apply database migration
3. Verify with test SQL queries
4. Add React components to frontend
5. Update App.js with new routes
6. Test each feature
7. Deploy changes

For complete documentation, see: `IMPLEMENTATION_GUIDE.md`
