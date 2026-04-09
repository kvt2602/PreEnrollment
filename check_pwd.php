<?php
$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'enrollment_db';

try {
    $pdo = new PDO('mysql:host=' . $host . ';dbname=' . $db . ';charset=utf8mb4', $user, $pass);
    $stmt = $pdo->query('SELECT username, password, role FROM users');
    
    echo "Users in database:\n";
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        echo "Username: {$row['username']}\n";
        echo "  Role: {$row['role']}\n";
        echo "  Password (first 30 chars): " . substr($row['password'], 0, 30) . "\n";
        echo "  Password length: " . strlen($row['password']) . "\n";
        echo "  Looks bcrypt hashed: " . (strpos($row['password'], '$2') === 0 ? 'YES' : 'NO') . "\n";
        echo "\n";
    }
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}
?>
