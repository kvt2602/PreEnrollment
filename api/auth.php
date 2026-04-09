<?php
/**
 * Authentication API
 * Handles user registration and login
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../includes/functions.php';

startSession();

$action = $_GET['action'] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($action === 'register') {
        register($pdo, $data);
    } elseif ($action === 'login') {
        login($pdo, $data);
    } else {
        sendResponse('error', 'Invalid action', null, HTTP_BAD_REQUEST);
    }
} elseif ($method === 'GET') {
    if ($action === 'logout') {
        logout();
    } elseif ($action === 'check') {
        checkAuth();
    } else {
        sendResponse('error', 'Invalid action', null, HTTP_BAD_REQUEST);
    }
}

/**
 * Register new student
 */
function register($pdo, $data) {
    // Validate input
    if (empty($data['username']) || empty($data['email']) || empty($data['password']) || 
        empty($data['first_name']) || empty($data['last_name']) || empty($data['student_number'])) {
        sendResponse('error', 'All fields are required', null, HTTP_BAD_REQUEST);
    }
    
    $username = sanitizeInput($data['username']);
    $email = sanitizeInput($data['email']);
    $password = $data['password'];
    $first_name = sanitizeInput($data['first_name']);
    $last_name = sanitizeInput($data['last_name']);
    $student_number = sanitizeInput($data['student_number']);
    
    // Validate format
    if (!validateUsername($username)) {
        sendResponse('error', 'Username must be 3-20 characters and contain only letters, numbers, and underscores', null, HTTP_BAD_REQUEST);
    }
    
    if (!validateEmail($email)) {
        sendResponse('error', 'Invalid email format', null, HTTP_BAD_REQUEST);
    }
    
    if (strlen($password) < 8) {
        sendResponse('error', 'Password must be at least 8 characters', null, HTTP_BAD_REQUEST);
    }
    
    try {
        // Check if username or email exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $email]);
        
        if ($stmt->fetch()) {
            sendResponse('error', 'Username or email already exists', null, HTTP_BAD_REQUEST);
        }
        
        // Create user
        $hashedPassword = hashPassword($password);
        $stmt = $pdo->prepare("
            INSERT INTO users (username, email, password, first_name, last_name, role)
            VALUES (?, ?, ?, ?, ?, 'student')
        ");
        $stmt->execute([$username, $email, $hashedPassword, $first_name, $last_name]);
        
        $userId = $pdo->lastInsertId();
        
        // Create student record
        $stmt = $pdo->prepare("
            INSERT INTO students (user_id, student_number)
            VALUES (?, ?)
        ");
        $stmt->execute([$userId, $student_number]);
        
        sendResponse('success', 'Registration successful. Please log in.', null, HTTP_CREATED);
        
    } catch (PDOException $e) {
        sendResponse('error', 'Registration failed: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Login user
 */
function login($pdo, $data) {
    if (empty($data['username']) || empty($data['password'])) {
        sendResponse('error', 'Username and password are required', null, HTTP_BAD_REQUEST);
    }
    
    $username = sanitizeInput($data['username']);
    $password = $data['password'];
    
    try {
        $stmt = $pdo->prepare("
            SELECT id, username, password, role, is_active 
            FROM users 
            WHERE username = ?
        ");
        $stmt->execute([$username]);
        
        $user = $stmt->fetch();
        
        if (!$user) {
            error_log("Login failed: User not found - $username");
            sendResponse('error', 'Invalid username or password', null, HTTP_UNAUTHORIZED);
        }
        
        if (!$user['is_active']) {
            error_log("Login failed: Account inactive - $username");
            sendResponse('error', 'Account is inactive', null, HTTP_UNAUTHORIZED);
        }
        
        if (!verifyPassword($password, $user['password'])) {
            error_log("Login failed: Password mismatch for $username");
            sendResponse('error', 'Invalid username or password', null, HTTP_UNAUTHORIZED);
        }
        
        // Update last login
        $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);
        
        // Set session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['username'] = $user['username'];
        
        error_log("Login successful for $username");
        
        sendResponse('success', 'Login successful', [
            'user_id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role']
        ]);
        
    } catch (PDOException $e) {
        error_log("Login error: " . $e->getMessage());
        sendResponse('error', 'Login failed: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Logout user
 */
function logout() {
    session_destroy();
    sendResponse('success', 'Logout successful');
}

/**
 * Check authentication status
 */
function checkAuth() {
    if (isLoggedIn()) {
        sendResponse('success', 'Authenticated', [
            'user_id' => getCurrentUserId(),
            'role' => getCurrentUserRole()
        ]);
    } else {
        sendResponse('error', 'Not authenticated', null, HTTP_UNAUTHORIZED);
    }
}

?>
