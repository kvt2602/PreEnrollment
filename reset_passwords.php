<?php
/**
 * Password Reset Script
 * Resets admin and student passwords to known values
 */

require_once 'config/db.php';
require_once 'includes/functions.php';

echo "=== Password Reset ===\n\n";

// Reset admin password to 'admin123'
$adminPassword = hashPassword('admin123');
$stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = 'admin'");
$stmt->execute([$adminPassword]);

echo "✓ Admin password reset to: admin123\n";

// Reset student1 password to 'student123'
$studentPassword = hashPassword('student123');
$stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = 'student1'");
$stmt->execute([$studentPassword]);

echo "✓ Student1 password reset to: student123\n";

echo "\n=== Now you can login with: ===\n";
echo "Admin:\n";
echo "  Username: admin\n";
echo "  Password: admin123\n\n";
echo "Student:\n";
echo "  Username: student1\n";
echo "  Password: student123\n\n";

echo "Credentials have been reset successfully!\n";
?>
