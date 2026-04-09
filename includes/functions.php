<?php
/**
 * Global Helper Functions
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/constants.php';

/**
 * Send JSON response
 */
function sendResponse($status, $message, $data = null, $statusCode = HTTP_OK) {
    header('Content-Type: application/json');
    http_response_code($statusCode);
    
    $response = [
        'status' => $status,
        'message' => $message,
        'data' => $data
    ];
    
    echo json_encode($response);
    exit;
}

/**
 * Hash password
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

/**
 * Verify password
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Sanitize input
 */
function sanitizeInput($input) {
    if (is_array($input)) {
        foreach ($input as $key => $value) {
            $input[$key] = sanitizeInput($value);
        }
        return $input;
    }
    
    return trim(htmlspecialchars($input, ENT_QUOTES, 'UTF-8'));
}

/**
 * Validate email
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

/**
 * Validate username
 */
function validateUsername($username) {
    return preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username);
}

/**
 * Start session if not already started
 */
function startSession() {
    if (session_status() === PHP_SESSION_NONE) {
        // Configure session to work with cross-origin requests
        ini_set('session.cookie_samesite', 'Lax');
        ini_set('session.cookie_httponly', true);
        ini_set('session.use_only_cookies', true);
        session_start();
    }
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    startSession();
    return isset($_SESSION['user_id']) && isset($_SESSION['user_role']);
}

/**
 * Get current user ID
 */
function getCurrentUserId() {
    startSession();
    return $_SESSION['user_id'] ?? null;
}

/**
 * Get current user role
 */
function getCurrentUserRole() {
    startSession();
    return $_SESSION['user_role'] ?? null;
}

/**
 * Redirect to page
 */
function redirect($url) {
    header('Location: ' . $url);
    exit;
}

/**
 * Get student ID from user ID
 */
function getStudentId($pdo, $userId) {
    $stmt = $pdo->prepare("SELECT student_id FROM students WHERE user_id = ?");
    $stmt->execute([$userId]);
    $result = $stmt->fetch();
    return $result['student_id'] ?? null;
}

/**
 * Check enrollment conflicts (same day/time)
 */
function checkScheduleConflict($pdo, $studentId, $scheduleId, $semester) {
    // Get the schedule details
    $stmt = $pdo->prepare("
        SELECT cs.day_of_week, cs.time_id 
        FROM course_schedules cs 
        WHERE cs.schedule_id = ?
    ");
    $stmt->execute([$scheduleId]);
    $newSchedule = $stmt->fetch();
    
    if (!$newSchedule) {
        return false;
    }
    
    // Get all approved enrollments for this student
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count
        FROM enrollments e
        JOIN course_schedules cs ON e.schedule_id = cs.schedule_id
        WHERE e.student_id = ? 
        AND e.semester = ?
        AND e.status = 'approved'
        AND cs.day_of_week = ?
        AND cs.time_id = ?
    ");
    $stmt->execute([$studentId, $semester, $newSchedule['day_of_week'], $newSchedule['time_id']]);
    
    $result = $stmt->fetch();
    return $result['count'] > 0;
}

/**
 * Check max courses per semester
 */
function checkMaxCoursesPerSemester($pdo, $studentId, $semester) {
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count
        FROM enrollments
        WHERE student_id = ? 
        AND semester = ?
        AND status = 'approved'
    ");
    $stmt->execute([$studentId, $semester]);
    
    $result = $stmt->fetch();
    return $result['count'] >= MAX_COURSES_PER_SEMESTER;
}

/**
 * Check max classes per day
 */
function checkMaxClassesPerDay($pdo, $studentId, $dayOfWeek, $semester) {
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count
        FROM enrollments e
        JOIN course_schedules cs ON e.schedule_id = cs.schedule_id
        WHERE e.student_id = ? 
        AND e.semester = ?
        AND e.status = 'approved'
        AND cs.day_of_week = ?
    ");
    $stmt->execute([$studentId, $dayOfWeek, $semester]);
    
    $result = $stmt->fetch();
    return $result['count'] >= MAX_CLASSES_PER_DAY;
}

/**
 * Create notification
 */
function createNotification($pdo, $userId, $type, $title, $message, $enrollmentId = null) {
    $stmt = $pdo->prepare("
        INSERT INTO notifications (user_id, enrollment_id, type, title, message)
        VALUES (?, ?, ?, ?, ?)
    ");
    
    return $stmt->execute([$userId, $enrollmentId, $type, $title, $message]);
}

/**
 * Format date
 */
function formatDate($date) {
    return date('M d, Y', strtotime($date));
}

/**
 * Format time
 */
function formatTime($time) {
    return date('h:i A', strtotime($time));
}

/**
 * Create or get batch for a course schedule
 * Handles automatic batch creation when capacity is exceeded
 */
function getOrCreateBatch($pdo, $scheduleId) {
    try {
        // Check if there's an open batch with available capacity
        $stmt = $pdo->prepare("
            SELECT batch_id FROM class_batches 
            WHERE schedule_id = ? 
            AND current_enrollment < max_capacity 
            AND status IN ('open', 'available')
            LIMIT 1
        ");
        $stmt->execute([$scheduleId]);
        $batch = $stmt->fetch();
        
        if ($batch) {
            return $batch['batch_id'];
        }
        
        // Get the highest batch number for this schedule
        $stmt = $pdo->prepare("
            SELECT MAX(batch_number) as max_batch FROM class_batches 
            WHERE schedule_id = ?
        ");
        $stmt->execute([$scheduleId]);
        $result = $stmt->fetch();
        $nextBatchNumber = ($result['max_batch'] ?? 0) + 1;
        
        // Get schedule and course details
        $stmt = $pdo->prepare("
            SELECT cs.room FROM course_schedules cs WHERE schedule_id = ?
        ");
        $stmt->execute([$scheduleId]);
        $schedule = $stmt->fetch();
        
        // Create new batch
        $stmt = $pdo->prepare("
            INSERT INTO class_batches (schedule_id, batch_number, room, max_capacity, current_enrollment, status)
            VALUES (?, ?, ?, 30, 0, 'open')
        ");
        $stmt->execute([$scheduleId, $nextBatchNumber, $schedule['room']]);
        
        return $pdo->lastInsertId();
        
    } catch (PDOException $e) {
        error_log("Error in getOrCreateBatch: " . $e->getMessage());
        return false;
    }
}

/**
 * Check if student is violating grouping constraints
 * Some courses should be on the same day for grouping purposes
 */
function checkCourseGroupingConstraints($pdo, $studentId, $courseId, $dayOfWeek, $semester) {
    try {
        // Check if this course has grouping requirements
        $stmt = $pdo->prepare("
            SELECT cg.course_id_1, cg.course_id_2 FROM course_groupings cg
            WHERE (cg.course_id_1 = ? OR cg.course_id_2 = ?)
            AND cg.semester = ?
        ");
        $stmt->execute([$courseId, $courseId, $semester]);
        $groupings = $stmt->fetchAll();
        
        if (empty($groupings)) {
            return ['valid' => true]; // No grouping constraints
        }
        
        // Get all courses this student is already enrolled in for this semester
        $stmt = $pdo->prepare("
            SELECT DISTINCT e.course_id, cs.day_of_week
            FROM enrollments e
            JOIN course_schedules cs ON e.schedule_id = cs.schedule_id
            WHERE e.student_id = ? 
            AND e.semester = ? 
            AND e.status = 'approved'
        ");
        $stmt->execute([$studentId, $semester]);
        $enrolledCourses = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        // For each grouping constraint, check if we need alignment
        foreach ($groupings as $grouping) {
            $pairedCourseId = ($grouping['course_id_1'] == $courseId) 
                ? $grouping['course_id_2'] 
                : $grouping['course_id_1'];
            
            if (isset($enrolledCourses[$pairedCourseId])) {
                $pairedCourseDay = $enrolledCourses[$pairedCourseId];
                
                // Check if attempting to put grouped courses on different days
                if ($pairedCourseDay !== $dayOfWeek) {
                    return [
                        'valid' => false,
                        'message' => 'This course must be on the same day as another grouped course for optimal scheduling'
                    ];
                }
            }
        }
        
        return ['valid' => true];
        
    } catch (PDOException $e) {
        error_log("Error in checkCourseGroupingConstraints: " . $e->getMessage());
        return ['valid' => true]; // Don't block on error
    }
}

/**
 * Get students who share the same two courses
 */
function getStudentsInCommonCourses($pdo, $courseId1, $courseId2, $semester) {
    try {
        $stmt = $pdo->prepare("
            SELECT DISTINCT
                s.student_id,
                s.student_number,
                u.first_name,
                u.last_name,
                u.email
            FROM enrollments e1
            JOIN enrollments e2 ON e1.student_id = e2.student_id 
                AND e1.semester = e2.semester
            JOIN students s ON e1.student_id = s.student_id
            JOIN users u ON s.user_id = u.id
            WHERE e1.course_id = ? 
            AND e2.course_id = ? 
            AND e1.semester = ?
            AND e1.status = 'approved'
            AND e2.status = 'approved'
            ORDER BY s.student_number
        ");
        $stmt->execute([$courseId1, $courseId2, $semester]);
        return $stmt->fetchAll();
        
    } catch (PDOException $e) {
        error_log("Error in getStudentsInCommonCourses: " . $e->getMessage());
        return [];
    }
}

/**
 * Check if student already has max classes on a given day
 * Max = 3 classes per day maximum but should try to limit to 2 days total
 */
function getStudentClassSchedule($pdo, $studentId, $semester) {
    try {
        $stmt = $pdo->prepare("
            SELECT DISTINCT
                cs.day_of_week,
                COUNT(DISTINCT e.course_id) as class_count
            FROM enrollments e
            JOIN course_schedules cs ON e.schedule_id = cs.schedule_id
            WHERE e.student_id = ? 
            AND e.semester = ?
            AND e.status = 'approved'
            GROUP BY cs.day_of_week
            ORDER BY cs.day_of_week
        ");
        $stmt->execute([$studentId, $semester]);
        return $stmt->fetchAll();
        
    } catch (PDOException $e) {
        error_log("Error in getStudentClassSchedule: " . $e->getMessage());
        return [];
    }
}

/**
 * Count unique days student has classes
 */
function countUniqueDaysWithClasses($pdo, $studentId, $semester) {
    try {
        $stmt = $pdo->prepare("
            SELECT COUNT(DISTINCT cs.day_of_week) as unique_days
            FROM enrollments e
            JOIN course_schedules cs ON e.schedule_id = cs.schedule_id
            WHERE e.student_id = ? 
            AND e.semester = ?
            AND e.status = 'approved'
        ");
        $stmt->execute([$studentId, $semester]);
        $result = $stmt->fetch();
        return $result['unique_days'] ?? 0;
        
    } catch (PDOException $e) {
        error_log("Error in countUniqueDaysWithClasses: " . $e->getMessage());
        return 0;
    }
}

/**
 * Update batch enrollment count
 */
function updateBatchEnrollmentCount($pdo, $batchId) {
    try {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as count FROM enrollments WHERE batch_id = ?
        ");
        $stmt->execute([$batchId]);
        $result = $stmt->fetch();
        
        $stmt = $pdo->prepare("
            UPDATE class_batches SET current_enrollment = ? WHERE batch_id = ?
        ");
        $stmt->execute([$result['count'], $batchId]);
        
        // Update status
        $stmt = $pdo->prepare("
            SELECT max_capacity FROM class_batches WHERE batch_id = ?
        ");
        $stmt->execute([$batchId]);
        $batch = $stmt->fetch();
        
        $status = ($result['count'] >= $batch['max_capacity']) ? 'full' : 'open';
        $stmt = $pdo->prepare("
            UPDATE class_batches SET status = ? WHERE batch_id = ?
        ");
        $stmt->execute([$status, $batchId]);
        
        return true;
        
    } catch (PDOException $e) {
        error_log("Error in updateBatchEnrollmentCount: " . $e->getMessage());
        return false;
    }
}

/**
 * Get enrollment statistics with batch information
 */
function getEnrollmentStatsWithBatches($pdo, $semester) {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                c.course_code,
                c.course_name,
                COUNT(DISTINCT cb.batch_id) as num_batches,
                COUNT(DISTINCT e.student_id) as total_students,
                GROUP_CONCAT(cb.batch_number ORDER BY cb.batch_number SEPARATOR ', ') as batch_numbers
            FROM courses c
            LEFT JOIN course_schedules cs ON c.course_id = cs.course_id
            LEFT JOIN class_batches cb ON cs.schedule_id = cb.schedule_id
            LEFT JOIN enrollments e ON cb.batch_id = e.batch_id AND e.status = 'approved'
            WHERE c.semester = ?
            GROUP BY c.course_id
            ORDER BY c.course_code
        ");
        $stmt->execute([$semester]);
        return $stmt->fetchAll();
        
    } catch (PDOException $e) {
        error_log("Error in getEnrollmentStatsWithBatches: " . $e->getMessage());
        return [];
    }
}

?>
