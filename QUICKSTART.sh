#!/bin/bash

# QUICK START GUIDE FOR PRE-ENROLLMENT SYSTEM

echo "Pre-Enrollment System - Quick Start"
echo "===================================="
echo ""

# Step 1: Check XAMPP
echo "Step 1: Ensuring XAMPP is running..."
echo "Please make sure Apache and MySQL are running in XAMPP Control Panel"
read -p "Press Enter when XAMPP is running..."

# Step 2: Database Setup
echo ""
echo "Step 2: Setting up database..."
echo ""
read -p "Drop existing database and recreate? (y/n, default: n): " dropDb

if [[ "$dropDb" == "y" || "$dropDb" == "Y" ]]; then
    echo "Dropping existing database..."
    mysql -u root -e "DROP DATABASE IF EXISTS enrollment_db;" 2>/dev/null
fi

echo "Creating/checking database..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS enrollment_db;" 2>/dev/null

echo "Importing database schema..."
mysql -u root enrollment_db < database/enrollment.sql 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✓ Database successfully set up!"
else
    echo "✗ Error setting up database. Make sure MySQL is running."
    echo "Opening phpMyAdmin for manual import..."
    open http://localhost/phpmyadmin 2>/dev/null || xdg-open http://localhost/phpmyadmin
    read -p "Press Enter after manual import..."
fi

# Step 3: Admin Account
echo ""
echo "Step 3: Creating admin account..."
echo "Opening admin setup page in 2 seconds..."
sleep 2
open http://localhost/PreEnrollment/setup_admin.php 2>/dev/null || xdg-open http://localhost/PreEnrollment/setup_admin.php

echo ""
echo "Admin Setup Instructions:"
echo "1. If admin already exists, that's fine - you can proceed"
echo "2. If not, fill in admin details and create account"
echo "3. Then CLOSE the browser tab and return here"
read -p "Press Enter after finishing admin setup..."

# Step 4: Install Frontend
echo ""
echo "Step 4: Installing frontend dependencies..."
cd frontend
npm install

# Step 5: Start Frontend
echo ""
echo "Step 5: Starting React development server..."
echo "The application will open in your browser..."
npm start
