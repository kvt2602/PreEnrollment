<?php
/**
 * Password Reset API
 * Handles password reset requests and token validation
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../includes/functions.php';

startSession();

$action = $_GET['action'] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($action === 'request_reset') {
        requestPasswordReset($pdo, $data);
    } elseif ($action === 'validate_token') {
        validateResetToken($pdo, $data);
    } elseif ($action === 'reset_password') {
        resetPassword($pdo, $data);
    } else {
        sendResponse('error', 'Invalid action', null, HTTP_BAD_REQUEST);
    }
} elseif ($method === 'GET') {
    if ($action === 'verify_token') {
        verifyTokenGET($pdo, $_GET['token'] ?? null);
    }
}

/**
 * Request password reset - send email with reset link
 * In production, this should send an email. For now, returns token for development
 */
function requestPasswordReset($pdo, $data) {
    if (empty($data['email'])) {
        sendResponse('error', 'Email is required', null, HTTP_BAD_REQUEST);
    }
    
    try {
        $email = sanitizeInput($data['email']);
        
        // Find user by email
        $stmt = $pdo->prepare("
            SELECT id, username, email, first_name FROM users WHERE email = ?
        ");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user) {
            // Don't reveal if email exists - security best practice
            sendResponse('success', 'If an account with this email exists, a reset link will be sent', null, HTTP_OK);
        }
        
        // Generate reset token
        $token = bin2hex(random_bytes(32));
        $resetLink = 'http://localhost:3000/reset-password?token=' . $token;
        
        // Store token in database with expiration (24 hours)
        $stmt = $pdo->prepare("
            INSERT INTO password_resets (user_id, token, expires_at)
            VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))
            ON DUPLICATE KEY UPDATE 
                token = VALUES(token),
                expires_at = VALUES(expires_at)
        ");
        $stmt->execute([$user['id'], $token]);
        
        // In production, send email here
        // sendPasswordResetEmail($user['email'], $user['first_name'], $resetLink);
        
        // For development, return the token (remove in production)
        $response = [
            'message' => 'Password reset email sent (dev mode: token = ' . $token . ')',
            'resetLink' => $resetLink,
            'token' => $token // Remove in production
        ];
        
        sendResponse('success', 'Password reset email sent', $response);
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to process reset request: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Validate reset token
 */
function validateResetToken($pdo, $data) {
    if (empty($data['token'])) {
        sendResponse('error', 'Token is required', null, HTTP_BAD_REQUEST);
    }
    
    try {
        $token = sanitizeInput($data['token']);
        
        $stmt = $pdo->prepare("
            SELECT id, user_id, token, expires_at FROM password_resets 
            WHERE token = ? AND expires_at > NOW()
        ");
        $stmt->execute([$token]);
        $reset = $stmt->fetch();
        
        if (!$reset) {
            sendResponse('error', 'Invalid or expired token', null, HTTP_BAD_REQUEST);
        }
        
        // Get user info
        $stmt = $pdo->prepare("SELECT id, username, email FROM users WHERE id = ?");
        $stmt->execute([$reset['user_id']]);
        $user = $stmt->fetch();
        
        sendResponse('success', 'Token is valid', [
            'user_id' => $user['id'],
            'email' => $user['email']
        ]);
        
    } catch (PDOException $e) {
        sendResponse('error', 'Token validation failed: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Reset password with valid token
 */
function resetPassword($pdo, $data) {
    if (empty($data['token']) || empty($data['new_password'])) {
        sendResponse('error', 'Token and new password are required', null, HTTP_BAD_REQUEST);
    }
    
    try {
        $token = sanitizeInput($data['token']);
        $newPassword = $data['new_password'];
        
        // Validate password strength
        if (strlen($newPassword) < 8) {
            sendResponse('error', 'Password must be at least 8 characters long', null, HTTP_BAD_REQUEST);
        }
        
        // Verify token is valid
        $stmt = $pdo->prepare("
            SELECT user_id FROM password_resets 
            WHERE token = ? AND expires_at > NOW()
        ");
        $stmt->execute([$token]);
        $reset = $stmt->fetch();
        
        if (!$reset) {
            sendResponse('error', 'Invalid or expired token', null, HTTP_BAD_REQUEST);
        }
        
        // Update password
        $hashedPassword = hashPassword($newPassword);
        $stmt = $pdo->prepare("
            UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?
        ");
        $stmt->execute([$hashedPassword, $reset['user_id']]);
        
        // Delete used token
        $stmt = $pdo->prepare("DELETE FROM password_resets WHERE token = ?");
        $stmt->execute([$token]);
        
        sendResponse('success', 'Password reset successfully', null, HTTP_OK);
        
    } catch (PDOException $e) {
        sendResponse('error', 'Password reset failed: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Verify token via GET request
 */
function verifyTokenGET($pdo, $token) {
    if (!$token) {
        sendResponse('error', 'Token is required', null, HTTP_BAD_REQUEST);
    }
    
    try {
        $token = sanitizeInput($token);
        
        $stmt = $pdo->prepare("
            SELECT user_id FROM password_resets 
            WHERE token = ? AND expires_at > NOW()
        ");
        $stmt->execute([$token]);
        $reset = $stmt->fetch();
        
        if (!$reset) {
            sendResponse('error', 'Invalid or expired token', null, HTTP_BAD_REQUEST);
        }
        
        sendResponse('success', 'Token is valid', ['user_id' => $reset['user_id']]);
        
    } catch (PDOException $e) {
        sendResponse('error', 'Token verification failed: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

// Helper function to send password reset email (implement in production)
function sendPasswordResetEmail($email, $name, $resetLink) {
    $to = $email;
    $subject = 'Password Reset Request - Pre-Enrollment System';
    $body = "
    <html>
    <head>
        <title>Password Reset</title>
    </head>
    <body>
        <h2>Hello {$name},</h2>
        <p>We received a request to reset your password. Click the link below to proceed:</p>
        <p><a href='{$resetLink}'>Reset Password</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>Pre-Enrollment System Team</p>
    </body>
    </html>
    ";
    
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8" . "\r\n";
    
    // mail($to, $subject, $body, $headers);
}

?>
