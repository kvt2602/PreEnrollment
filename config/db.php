<?php
/**
 * Database Configuration
 * Sets up PDO connection to MySQL database
 */

// Database credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'enrollment_db');

try {
    // Create PDO connection
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
    
    // Set timezone
    $pdo->exec("SET time_zone = '+00:00'");
} catch (PDOException $e) {
    die('Database connection failed: ' . $e->getMessage());
}
?>
