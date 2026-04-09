@echo off
REM Quick setup script for Windows

echo Creating database...
mysql -u root < database\enrollment.sql

if errorlevel 1 (
    echo Error creating database. Make sure MySQL is running.
    exit /b 1
)

echo Installing frontend dependencies...
cd frontend
call npm install

echo Setup complete!
echo.
echo Next steps:
echo 1. Start XAMPP (Apache and MySQL^)
echo 2. Visit http://localhost/PreEnrollment/setup_admin.php to create admin account
echo 3. Run: cd frontend ^&^& npm start
echo 4. Open http://localhost:3000
