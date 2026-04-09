#!/bin/bash
# Quick setup script for Linux/Mac

# Check if XAMPP is available
if ! command -v mysql &> /dev/null; then
    echo "MySQL not found. Please install XAMPP first."
    exit 1
fi

# Create database
echo "Creating database..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS enrollment_db;"
mysql -u root enrollment_db < database/enrollment.sql

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start XAMPP (Apache and MySQL)"
echo "2. Visit http://localhost/PreEnrollment/setup_admin.php to create admin account"
echo "3. Run: cd frontend && npm start"
echo "4. Open http://localhost:3000"
