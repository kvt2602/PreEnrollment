@echo off
REM QUICK START GUIDE FOR PRE-ENROLLMENT SYSTEM (WINDOWS)

setlocal enabledelayedexpansion

echo Pre-Enrollment System - Quick Start
echo ====================================
echo.

REM Step 1: Check XAMPP
echo Step 1: Ensuring XAMPP is running...
echo Please make sure Apache and MySQL are running in XAMPP Control Panel
pause

REM Step 2: Database Setup
echo.
echo Step 2: Setting up database...
echo.
echo If database already exists, would you like to:
echo 1. Drop and recreate the database (fresh start^)
echo 2. Keep existing database and just reinitialize (recommended^)
echo.
set /p dbChoice="Enter your choice (1 or 2^): "

if "%dbChoice%"=="1" (
    echo Dropping existing database...
    mysql -u root -e "DROP DATABASE IF EXISTS enrollment_db; CREATE DATABASE enrollment_db;" 2>nul
) else (
    echo Using existing database...
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS enrollment_db;" 2>nul
)

echo.
echo Importing database schema...
mysql -u root enrollment_db < database\enrollment.sql

if errorlevel 1 (
    echo Error importing database. Please make sure MySQL is running.
    echo Opening phpMyAdmin for manual import...
    start http://localhost/phpmyadmin
    echo Please manually import database/enrollment.sql to enrollment_db
    pause
) else (
    echo Database successfully imported!
)

REM Step 3: Admin Account
echo.
echo Step 3: Creating admin account...
echo Opening admin setup page...
start http://localhost/PreEnrollment/setup_admin.php

echo.
echo Please create your admin account, then return here.
pause

REM Step 4: Install Frontend
echo.
echo Step 4: Installing frontend dependencies...
echo This may take a few minutes...
cd frontend
call npm install

if errorlevel 1 (
    echo Error installing npm packages
    echo Please ensure Node.js and npm are installed
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Step 5: Start Frontend
echo.
echo Step 5: Starting React development server...
echo.
echo IMPORTANT: The React app will open at http://localhost:3000
echo Use THAT address to log in with your admin credentials
echo.
echo Starting in 3 seconds...
timeout /t 3 /nobreak
call npm start

endlocal
