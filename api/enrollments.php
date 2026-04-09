<?php
/**
 * Enrollments API
 * Handles student enrollments and admin approval
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../includes/functions.php';

startSession();

$action = $_GET['action'] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

if (!isLoggedIn()) {
    sendResponse('error', 'Not authenticated', null, HTTP_UNAUTHORIZED);
}

$userId = getCurrentUserId();
$userRole = getCurrentUserRole();

if ($method === 'GET') {
    if ($action === 'my_enrollments') {
        getMyEnrollments($pdo, $userId);
    } elseif ($action === 'pending' && $userRole === 'admin') {
        getPendingEnrollments($pdo);
    } elseif ($action === 'stats' && $userRole === 'admin') {
        getEnrollmentStats($pdo);
    } else {
        sendResponse('error', 'Invalid action', null, HTTP_BAD_REQUEST);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($action === 'enroll' && $userRole === 'student') {
        enrollCourse($pdo, $userId, $data);
    } elseif ($action === 'approve' && $userRole === 'admin') {
        approveEnrollment($pdo, $userId, $data);
    } elseif ($action === 'reject' && $userRole === 'admin') {
        rejectEnrollment($pdo, $userId, $data);
    } else {
        sendResponse('error', 'Invalid action', null, HTTP_BAD_REQUEST);
    }
} elseif ($method === 'DELETE') {
    if ($action === 'cancel' && $userRole === 'student') {
        cancelEnrollment($pdo, $userId, $_GET['enrollment_id'] ?? null);
    } else {
        sendResponse('error', 'Invalid action', null, HTTP_BAD_REQUEST);
    }
}

/**
 * Get student's enrollments
 */
function getMyEnrollments($pdo, $userId) {
    try {
        $studentId = getStudentId($pdo, $userId);
        
        if (!$studentId) {
            sendResponse('error', 'Student record not found', null, HTTP_NOT_FOUND);
        }
        
        $stmt = $pdo->prepare("
            SELECT e.*, c.course_code, c.course_name, c.credits,
                   cs.day_of_week, st.time_slot, st.start_time, st.end_time, cs.room
            FROM enrollments e
            JOIN courses c ON e.course_id = c.course_id
            JOIN course_schedules cs ON e.schedule_id = cs.schedule_id
            JOIN schedule_times st ON cs.time_id = st.time_id
            WHERE e.student_id = ?
            ORDER BY e.semester DESC, c.course_code
        ");
        $stmt->execute([$studentId]);
        $enrollments = $stmt->fetchAll();
        
        sendResponse('success', 'Enrollments retrieved', $enrollments);
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to retrieve enrollments: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Enroll student in course
 */
function enrollCourse($pdo, $userId, $data) {
    if (empty($data['course_id']) || empty($data['schedule_id']) || empty($data['semester'])) {
        sendResponse('error', 'Course ID, schedule ID, and semester are required', null, HTTP_BAD_REQUEST);
    }
    
    try {
        $studentId = getStudentId($pdo, $userId);
        
        if (!$studentId) {
            sendResponse('error', 'Student record not found', null, HTTP_NOT_FOUND);
        }
        
        $courseId = $data['course_id'];
        $scheduleId = $data['schedule_id'];
        $semester = $data['semester'];
        
        // Check if already enrolled
        $stmt = $pdo->prepare("
            SELECT id FROM enrollments 
            WHERE student_id = ? AND course_id = ? AND semester = ?
        ");
        $stmt->execute([$studentId, $courseId, $semester]);
        
        if ($stmt->fetch()) {
            sendResponse('error', 'Already enrolled in this course', null, HTTP_BAD_REQUEST);
        }
        
        // Check max courses per semester
        if (checkMaxCoursesPerSemester($pdo, $studentId, $semester)) {
            sendResponse('error', 'Maximum courses per semester (' . MAX_COURSES_PER_SEMESTER . ') exceeded', null, HTTP_BAD_REQUEST);
        }
        
        // Get schedule details
        $stmt = $pdo->prepare("
            SELECT day_of_week FROM course_schedules WHERE schedule_id = ?
        ");
        $stmt->execute([$scheduleId]);
        $schedule = $stmt->fetch();
        
        // Check max classes per day
        if (checkMaxClassesPerDay($pdo, $studentId, $schedule['day_of_week'], $semester)) {
            sendResponse('error', 'Maximum classes per day (' . MAX_CLASSES_PER_DAY . ') exceeded', null, HTTP_BAD_REQUEST);
        }
        
        // Check schedule conflicts
        if (checkScheduleConflict($pdo, $studentId, $scheduleId, $semester)) {
            sendResponse('error', 'Schedule conflict detected', null, HTTP_BAD_REQUEST);
        }
        
        // Check course capacity
        $stmt = $pdo->prepare("
            SELECT enrolled_count, max_students FROM course_schedules WHERE schedule_id = ?
        ");
        $stmt->execute([$scheduleId]);
        $scheduleInfo = $stmt->fetch();
        
        if ($scheduleInfo['enrolled_count'] >= $scheduleInfo['max_students']) {
            sendResponse('error', 'Course is at maximum capacity', null, HTTP_BAD_REQUEST);
        }
        
        // Create enrollment
        $stmt = $pdo->prepare("
            INSERT INTO enrollments (student_id, course_id, schedule_id, semester, status)
            VALUES (?, ?, ?, ?, 'pending')
        ");
        $stmt->execute([$studentId, $courseId, $scheduleId, $semester]);
        
        $enrollmentId = $pdo->lastInsertId();
        
        // Create notification
        createNotification($pdo, $userId, NOTIF_ENROLLMENT_APPROVED, 'Enrollment Pending', 
            'Your enrollment is pending admin approval', $enrollmentId);
        
        sendResponse('success', 'Enrollment request submitted', 
            ['enrollment_id' => $enrollmentId], HTTP_CREATED);
        
    } catch (PDOException $e) {
        sendResponse('error', 'Enrollment failed: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Get pending enrollments (Admin)
 */
function getPendingEnrollments($pdo) {
    try {
        $stmt = $pdo->prepare("
            SELECT e.*, c.course_code, c.course_name, u.first_name, u.last_name, u.email,
                   s.student_number, cs.day_of_week, st.time_slot, st.start_time, st.end_time
            FROM enrollments e
            JOIN courses c ON e.course_id = c.course_id
            JOIN students s ON e.student_id = s.student_id
            JOIN users u ON s.user_id = u.id
            JOIN course_schedules cs ON e.schedule_id = cs.schedule_id
            JOIN schedule_times st ON cs.time_id = st.time_id
            WHERE e.status = 'pending'
            ORDER BY e.enrolled_at DESC
        ");
        $stmt->execute();
        $enrollments = $stmt->fetchAll();
        
        sendResponse('success', 'Pending enrollments retrieved', $enrollments);
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to retrieve enrollments: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Approve enrollment (Admin)
 */
function approveEnrollment($pdo, $adminId, $data) {
    if (empty($data['enrollment_id'])) {
        sendResponse('error', 'Enrollment ID is required', null, HTTP_BAD_REQUEST);
    }
    
    try {
        $enrollmentId = $data['enrollment_id'];
        
        // Get enrollment
        $stmt = $pdo->prepare("
            SELECT e.*, s.user_id, s.student_id FROM enrollments e
            JOIN students s ON e.student_id = s.student_id
            WHERE e.enrollment_id = ?
        ");
        $stmt->execute([$enrollmentId]);
        $enrollment = $stmt->fetch();
        
        if (!$enrollment) {
            sendResponse('error', 'Enrollment not found', null, HTTP_NOT_FOUND);
        }
        
        // Check for grouping constraint violations
        $stmt = $pdo->prepare("SELECT day_of_week FROM course_schedules WHERE schedule_id = ?");
        $stmt->execute([$enrollment['schedule_id']]);
        $schedule = $stmt->fetch();
        
        $groupingCheck = checkCourseGroupingConstraints($pdo, $enrollment['student_id'], $enrollment['course_id'], $schedule['day_of_week'], $enrollment['semester']);
        if (!$groupingCheck['valid']) {
            sendResponse('error', $groupingCheck['message'], null, HTTP_BAD_REQUEST);
        }
        
        // Get or create batch for this schedule
        $batchId = getOrCreateBatch($pdo, $enrollment['schedule_id']);
        
        if (!$batchId) {
            sendResponse('error', 'Failed to assign batch', null, HTTP_INTERNAL_ERROR);
        }
        
        // Update enrollment with batch and status
        $stmt = $pdo->prepare("
            UPDATE enrollments 
            SET status = 'approved', approved_by = ?, approved_at = NOW(), batch_id = ?
            WHERE enrollment_id = ?
        ");
        $stmt->execute([$adminId, $batchId, $enrollmentId]);
        
        // Update batch enrollment count
        updateBatchEnrollmentCount($pdo, $batchId);
        
        // Create notification
        createNotification($pdo, $enrollment['user_id'], NOTIF_ENROLLMENT_APPROVED, 
            'Enrollment Approved', 'Your enrollment has been approved', $enrollmentId);
        
        sendResponse('success', 'Enrollment approved');
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to approve enrollment: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Reject enrollment (Admin)
 */
function rejectEnrollment($pdo, $adminId, $data) {
    if (empty($data['enrollment_id'])) {
        sendResponse('error', 'Enrollment ID is required', null, HTTP_BAD_REQUEST);
    }
    
    try {
        $enrollmentId = $data['enrollment_id'];
        $reason = sanitizeInput($data['rejection_reason'] ?? 'No reason provided');
        
        // Get enrollment
        $stmt = $pdo->prepare("
            SELECT e.*, s.user_id FROM enrollments e
            JOIN students s ON e.student_id = s.student_id
            WHERE e.enrollment_id = ?
        ");
        $stmt->execute([$enrollmentId]);
        $enrollment = $stmt->fetch();
        
        if (!$enrollment) {
            sendResponse('error', 'Enrollment not found', null, HTTP_NOT_FOUND);
        }
        
        // Update enrollment
        $stmt = $pdo->prepare("
            UPDATE enrollments 
            SET status = 'rejected', rejection_reason = ?
            WHERE enrollment_id = ?
        ");
        $stmt->execute([$reason, $enrollmentId]);
        
        // Create notification
        createNotification($pdo, $enrollment['user_id'], NOTIF_ENROLLMENT_REJECTED, 
            'Enrollment Rejected', 'Your enrollment has been rejected. Reason: ' . $reason, $enrollmentId);
        
        sendResponse('success', 'Enrollment rejected');
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to reject enrollment: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Cancel enrollment (Student)
 */
function cancelEnrollment($pdo, $userId, $enrollmentId) {
    if (!$enrollmentId) {
        sendResponse('error', 'Enrollment ID is required', null, HTTP_BAD_REQUEST);
    }
    
    try {
        $studentId = getStudentId($pdo, $userId);
        
        // Get enrollment
        $stmt = $pdo->prepare("
            SELECT * FROM enrollments WHERE enrollment_id = ? AND student_id = ?
        ");
        $stmt->execute([$enrollmentId, $studentId]);
        $enrollment = $stmt->fetch();
        
        if (!$enrollment) {
            sendResponse('error', 'Enrollment not found', null, HTTP_NOT_FOUND);
        }
        
        if ($enrollment['status'] !== 'pending') {
            sendResponse('error', 'Only pending enrollments can be cancelled', null, HTTP_BAD_REQUEST);
        }
        
        // Update enrollment
        $stmt = $pdo->prepare("
            UPDATE enrollments SET status = 'cancelled' WHERE enrollment_id = ?
        ");
        $stmt->execute([$enrollmentId]);
        
        sendResponse('success', 'Enrollment cancelled');
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to cancel enrollment: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Get enrollment statistics (Admin)
 */
function getEnrollmentStats($pdo) {
    try {
        // Total enrollments
        $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM enrollments");
        $stmt->execute();
        $stats = $stmt->fetch();
        
        // Enrollments by status
        $stmt = $pdo->prepare("
            SELECT status, COUNT(*) as count 
            FROM enrollments 
            GROUP BY status
        ");
        $stmt->execute();
        $stats['by_status'] = $stmt->fetchAll();
        
        // Enrollments per course
        $stmt = $pdo->prepare("
            SELECT c.course_code, c.course_name, COUNT(e.enrollment_id) as count
            FROM courses c
            LEFT JOIN enrollments e ON c.course_id = e.course_id AND e.status = 'approved'
            GROUP BY c.course_id
            ORDER BY count DESC
        ");
        $stmt->execute();
        $stats['by_course'] = $stmt->fetchAll();
        
        // Enrollments by day
        $stmt = $pdo->prepare("
            SELECT cs.day_of_week, COUNT(e.enrollment_id) as count
            FROM course_schedules cs
            LEFT JOIN enrollments e ON cs.schedule_id = e.schedule_id AND e.status = 'approved'
            GROUP BY cs.day_of_week
            ORDER BY count DESC
        ");
        $stmt->execute();
        $stats['by_day'] = $stmt->fetchAll();
        
        sendResponse('success', 'Statistics retrieved', $stats);
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to retrieve statistics: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

?>
