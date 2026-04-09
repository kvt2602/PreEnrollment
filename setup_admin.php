<?php
/**
 * Admin Account Setup Script
 * Run this once to create the admin account
 * Access: http://localhost/PreEnrollment/setup_admin.php
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/constants.php';
require_once __DIR__ . '/includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = sanitizeInput($_POST['username'] ?? '');
    $email = sanitizeInput($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $first_name = sanitizeInput($_POST['first_name'] ?? '');
    $last_name = sanitizeInput($_POST['last_name'] ?? '');

    $error = '';
    $success = '';

    if (empty($username) || empty($email) || empty($password) || empty($first_name) || empty($last_name)) {
        $error = 'All fields are required';
    } elseif (!validateEmail($email)) {
        $error = 'Invalid email format';
    } elseif (strlen($password) < 8) {
        $error = 'Password must be at least 8 characters';
    } else {
        try {
            // Check if username/email exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$username, $email]);

            if ($stmt->fetch()) {
                $error = 'Username or email already exists';
            } else {
                // Create admin account
                $hashedPassword = hashPassword($password);
                $stmt = $pdo->prepare("
                    INSERT INTO users (username, email, password, first_name, last_name, role)
                    VALUES (?, ?, ?, ?, ?, 'admin')
                ");
                $stmt->execute([$username, $email, $hashedPassword, $first_name, $last_name]);

                $success = 'Admin account created successfully! You can now log in.';
            }
        } catch (PDOException $e) {
            $error = 'Error: ' . $e->getMessage();
        }
    }
}

// Check if admin exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
$stmt->execute();
$adminExists = $stmt->fetch() ? true : false;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Setup - Pre-Enrollment System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            width: 100%;
        }

        h1 {
            color: #2563eb;
            margin-bottom: 10px;
            text-align: center;
        }

        h2 {
            color: #1f2937;
            font-size: 1.2rem;
            margin-bottom: 30px;
            text-align: center;
        }

        .alert {
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            font-weight: 500;
        }

        .alert-error {
            background-color: #fee;
            color: #c33;
            border-left: 4px solid #ef4444;
        }

        .alert-success {
            background-color: #efe;
            color: #3c3;
            border-left: 4px solid #10b981;
        }

        .alert-info {
            background-color: #e0f2fe;
            color: #0369a1;
            border-left: 4px solid #0284c7;
        }

        .form-group {
            margin-bottom: 15px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #1f2937;
        }

        input {
            width: 100%;
            padding: 10px;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            font-size: 1rem;
            font-family: inherit;
        }

        input:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        button {
            width: 100%;
            padding: 12px;
            background-color: #2563eb;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        button:hover {
            background-color: #1e40af;
        }

        button:disabled {
            background-color: #9ca3af;
            cursor: not-allowed;
        }

        .info-box {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            font-size: 0.9rem;
            color: #374151;
        }

        .text-center {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Pre-Enrollment System</h1>
        <h2>Admin Setup</h2>

        <?php if ($adminExists): ?>
            <div class="alert alert-info">
                Admin account already exists. Please proceed to login at the main application.
            </div>
            <a href="/" style="display: block; text-align: center; color: #2563eb; margin-top: 20px;">Go to Login</a>
        <?php else: ?>
            <?php if (!empty($error)): ?>
                <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>

            <?php if (!empty($success)): ?>
                <div class="alert alert-success"><?php echo htmlspecialchars($success); ?></div>
            <?php endif; ?>

            <form method="POST">
                <div class="form-group">
                    <label>First Name</label>
                    <input type="text" name="first_name" required>
                </div>

                <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" name="last_name" required>
                </div>

                <div class="form-group">
                    <label>Username</label>
                    <input type="text" name="username" placeholder="admin123" required>
                </div>

                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" placeholder="admin@example.com" required>
                </div>

                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" placeholder="At least 8 characters" required>
                </div>

                <button type="submit">Create Admin Account</button>
            </form>

            <div class="info-box">
                <strong>Note:</strong> This form will only work if no admin account exists. After creating an account, log in with your credentials.
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
