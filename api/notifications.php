<?php
/**
 * Notifications API
 * Handles user notifications
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../includes/functions.php';

startSession();

if (!isLoggedIn()) {
    sendResponse('error', 'Not authenticated', null, HTTP_UNAUTHORIZED);
}

$action = $_GET['action'] ?? null;
$method = $_SERVER['REQUEST_METHOD'];
$userId = getCurrentUserId();

if ($method === 'GET') {
    if ($action === 'list') {
        getNotifications($pdo, $userId);
    } elseif ($action === 'unread') {
        getUnreadCount($pdo, $userId);
    } else {
        sendResponse('error', 'Invalid action', null, HTTP_BAD_REQUEST);
    }
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($action === 'mark_read') {
        markAsRead($pdo, $userId, $data);
    } else {
        sendResponse('error', 'Invalid action', null, HTTP_BAD_REQUEST);
    }
} else {
    sendResponse('error', 'Method not allowed', null, HTTP_BAD_REQUEST);
}

/**
 * Get user notifications
 */
function getNotifications($pdo, $userId) {
    try {
        $limit = $_GET['limit'] ?? 20;
        
        $stmt = $pdo->prepare("
            SELECT * FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        ");
        $stmt->execute([$userId, $limit]);
        $notifications = $stmt->fetchAll();
        
        sendResponse('success', 'Notifications retrieved', $notifications);
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to retrieve notifications: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Get unread notification count
 */
function getUnreadCount($pdo, $userId) {
    try {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as count FROM notifications
            WHERE user_id = ? AND is_read = FALSE
        ");
        $stmt->execute([$userId]);
        $result = $stmt->fetch();
        
        sendResponse('success', 'Unread count retrieved', $result);
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to retrieve count: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Mark notification as read
 */
function markAsRead($pdo, $userId, $data) {
    if (empty($data['notification_id'])) {
        sendResponse('error', 'Notification ID is required', null, HTTP_BAD_REQUEST);
    }
    
    try {
        $stmt = $pdo->prepare("
            UPDATE notifications 
            SET is_read = TRUE 
            WHERE notification_id = ? AND user_id = ?
        ");
        $stmt->execute([$data['notification_id'], $userId]);
        
        sendResponse('success', 'Notification marked as read');
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to update notification: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

?>
