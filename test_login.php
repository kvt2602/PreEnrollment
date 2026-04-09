<?php
/**
 * Login Test Script - Tests the authentication API directly
 */

// Simulate the request
echo "=== Login API Test ===\n";

header('Content-Type: application/json');
require_once 'config/cors.php';
require_once 'includes/functions.php';

startSession();

// Test data
$testUsers = [
    ['username' => 'admin', 'password' => 'admin123'],
    ['username' => 'student1', 'password' => 'student123'],
];

echo "\nAttempting to test login with database...\n";

try {
    require 'config/db.php';
    
    foreach ($testUsers as $testData) {
        echo "\n--- Testing login: {$testData['username']} ---\n";
        
        $username = sanitizeInput($testData['username']);
        $password = $testData['password'];
        
        $stmt = $pdo->prepare("
            SELECT id, username, password, role, is_active 
            FROM users 
            WHERE username = ?
        ");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo "❌ User not found\n";
            continue;
        }
        
        echo "✓ User found: {$user['username']} ({$user['role']})\n";
        echo "  Active: " . ($user['is_active'] ? 'Yes' : 'NO') . "\n";
        
        if (!verifyPassword($password, $user['password'])) {
            echo "❌ Password verification FAILED\n";
            // Try plain text for debugging
            if ($password === $user['password']) {
                echo "   (but plain text match works - password may not be hashed)\n";
            }
        } else {
            echo "✓ Password verification PASSED\n";
        }
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

echo "\n--- Functions Available ---\n";
echo "sanitizeInput: " . (function_exists('sanitizeInput') ? '✓' : '✗') . "\n";
echo "verifyPassword: " . (function_exists('verifyPassword') ? '✓' : '✗') . "\n";
echo "hashPassword: " . (function_exists('hashPassword') ? '✓' : '✗') . "\n";
echo "startSession: " . (function_exists('startSession') ? '✓' : '✗') . "\n";
echo "sendResponse: " . (function_exists('sendResponse') ? '✓' : '✗') . "\n";

?>
