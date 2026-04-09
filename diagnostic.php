<?php
echo "=== Pre-Enrollment System Diagnostic ===\n\n";

// Test database connection
echo "1. Testing database connection...\n";
try {
    require 'config/db.php';
    echo "   ✓ Database connected successfully\n\n";
} catch (Exception $e) {
    echo "   ✗ Database connection failed: " . $e->getMessage() . "\n\n";
    die();
}

// Check tables
echo "2. Checking database tables...\n";
try {
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    if (empty($tables)) {
        echo "   ✗ No tables found. Database needs setup.\n\n";
    } else {
        echo "   ✓ Found " . count($tables) . " tables:\n";
        foreach ($tables as $table) {
            echo "      - $table\n";
        }
        echo "\n";
    }
} catch (Exception $e) {
    echo "   ✗ Error checking tables: " . $e->getMessage() . "\n\n";
}

// Check admin users
echo "3. Checking users table...\n";
try {
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    $count = $result['count'] ?? 0;
    
    if ($count == 0) {
        echo "   ✗ No users in database. Run setup_admin.php\n\n";
    } else {
        echo "   ✓ Found $count user(s):\n";
        $stmt = $pdo->query("SELECT id, username, role, is_active FROM users");
        foreach ($stmt->fetchAll() as $user) {
            $status = $user['is_active'] ? 'active' : 'INACTIVE';
            echo "      - {$user['username']} ({$user['role']}) - $status\n";
        }
        echo "\n";
    }
} catch (Exception $e) {
    echo "   ✗ Error checking users: " . $e->getMessage() . "\n\n";
}

// Check API files
echo "4. Checking API files...\n";
$files = ['api/auth.php', 'includes/functions.php', 'config/cors.php', 'config/constants.php'];
foreach ($files as $file) {
    if (file_exists($file)) {
        echo "   ✓ $file\n";
    } else {
        echo "   ✗ $file MISSING\n";
    }
}
echo "\n";

// Check frontend build
echo "5. Checking frontend files...\n";
if (file_exists('frontend/public/index.html')) {
    echo "   ✓ frontend/public/index.html exists\n";
} else {
    echo "   ✗ frontend/public/index.html MISSING\n";
}
if (file_exists('frontend/src/App.js')) {
    echo "   ✓ frontend/src/App.js exists\n";
} else {
    echo "   ✗ frontend/src/App.js MISSING\n";
}
echo "\n";

echo "=== Diagnostic Complete ===\n";
?>
