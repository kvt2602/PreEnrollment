<?php
require_once 'config/db.php';
require_once 'includes/functions.php';

// Get stored password hashes
$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'enrollment_db';

$pdo = new PDO('mysql:host=' . $host . ';dbname=' . $db . ';charset=utf8mb4', $user, $pass);
$stmt = $pdo->query('SELECT username, password FROM users');
$dbUsers = [];
foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $dbUsers[$row['username']] = $row['password'];
}

// Test common default passwords
$testPasswords = [
    'admin123', 
    'admin@123',
    'password', 
    'password123',
    '12345678',
    'Admin@123',
    'admin',
    'password@123'
];

echo "=== Testing Password Verification ===\n\n";

foreach ($dbUsers as $username => $storedHash) {
    echo "Testing user: $username\n";
    echo "Stored hash: " . substr($storedHash, 0, 30) . "...\n";
    
    $found = false;
    foreach ($testPasswords as $testPassword) {
        if (password_verify($testPassword, $storedHash)) {
            echo "✓ MATCH FOUND: password is '$testPassword'\n";
            $found = true;
            break;
        }
    }
    
    if (!$found) {
        echo "✗ No matching password found in test list\n";
    }
    echo "\n";
}

echo "\n=== Hash Information ===\n";
echo "To reset passwords to known values, use setup_admin.php\n";
echo "Or run:\n";
echo "UPDATE users SET password = '" . hashPassword('admin123') . "' WHERE username = 'admin';\n";
?>
