<?php
/**
 * Reports API
 * Generates and exports enrollment reports in CSV format
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

$userRole = getCurrentUserRole();

if ($method === 'GET') {
    if ($action === 'course_enrolled' && $userRole === 'admin') {
        generateCourseEnrollmentReport($pdo, $_GET['course_id'] ?? null, $_GET['semester'] ?? null);
    } elseif ($action === 'shared_courses' && $userRole === 'admin') {
        generateSharedCourseReport($pdo, $_GET['course_id_1'] ?? null, $_GET['course_id_2'] ?? null, $_GET['semester'] ?? null);
    } elseif ($action === 'same_day' && $userRole === 'admin') {
        generateSameDayReport($pdo, $_GET['day'] ?? null, $_GET['semester'] ?? null);
    } elseif ($action === 'get_available_courses' && $userRole === 'admin') {
        getAvailableCoursesForReport($pdo, $_GET['semester'] ?? null);
    } else {
        sendResponse('error', 'Invalid action', null, HTTP_BAD_REQUEST);
    }
} else {
    sendResponse('error', 'Invalid request method', null, HTTP_BAD_REQUEST);
}

/**
 * Generate course enrollment report (list of students in a specific course)
 * Returns CSV file with columns: Student Number, Name, Email, Batch, Day, Time, Status
 */
function generateCourseEnrollmentReport($pdo, $courseId, $semester) {
    if (!$courseId || !$semester) {
        sendResponse('error', 'Course ID and semester are required', null, HTTP_BAD_REQUEST);
    }
    
    try {
        // Get course details
        $stmt = $pdo->prepare("
            SELECT course_code, course_name FROM courses WHERE course_id = ?
        ");
        $stmt->execute([$courseId]);
        $course = $stmt->fetch();
        
        if (!$course) {
            sendResponse('error', 'Course not found', null, HTTP_NOT_FOUND);
        }
        
        // Get all approved enrollments for this course
        $stmt = $pdo->prepare("
            SELECT DISTINCT
                s.student_number,
                u.first_name,
                u.last_name,
                u.email,
                e.batch_id,
                cs.day_of_week,
                st.time_slot,
                e.status,
                e.approved_at
            FROM enrollments e
            JOIN students s ON e.student_id = s.student_id
            JOIN users u ON s.user_id = u.id
            JOIN course_schedules cs ON e.schedule_id = cs.schedule_id
            JOIN schedule_times st ON cs.time_id = st.time_id
            WHERE e.course_id = ? 
            AND e.semester = ?
            AND e.status = 'approved'
            ORDER BY s.student_number, cs.day_of_week, st.start_time
        ");
        $stmt->execute([$courseId, $semester]);
        $enrollments = $stmt->fetchAll();
        
        generateCSVReport(
            "course_" . $course['course_code'] . "_sem" . $semester . ".csv",
            ["Student Number", "First Name", "Last Name", "Email", "Batch", "Day", "Time", "Status"],
            array_map(function($e) {
                return [
                    $e['student_number'],
                    $e['first_name'],
                    $e['last_name'],
                    $e['email'],
                    $e['batch_id'] ?? 'N/A',
                    $e['day_of_week'],
                    $e['time_slot'],
                    $e['status']
                ];
            }, $enrollments)
        );
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to generate report: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Generate shared courses report (students enrolled in two specific courses)
 * Returns CSV file with columns: Student Number, Name, Email, Course 1 Day/Time, Course 2 Day/Time
 */
function generateSharedCourseReport($pdo, $courseId1, $courseId2, $semester) {
    if (!$courseId1 || !$courseId2 || !$semester) {
        sendResponse('error', 'Both course IDs and semester are required', null, HTTP_BAD_REQUEST);
    }
    
    try {
        // Get course details
        $stmt = $pdo->prepare("SELECT course_code FROM courses WHERE course_id IN (?, ?)");
        $stmt->execute([$courseId1, $courseId2]);
        $courses = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (count($courses) < 2) {
            sendResponse('error', 'One or both courses not found', null, HTTP_NOT_FOUND);
        }
        
        // Get students enrolled in BOTH courses
        $stmt = $pdo->prepare("
            SELECT DISTINCT
                s.student_number,
                u.first_name,
                u.last_name,
                u.email,
                GROUP_CONCAT(DISTINCT CONCAT(cs.day_of_week, ' ', st.time_slot) ORDER BY cs.day_of_week SEPARATOR ' | ') as schedule,
                COUNT(DISTINCT e.course_id) as course_count
            FROM enrollments e1
            JOIN enrollments e2 ON e1.student_id = e2.student_id 
                AND e1.semester = e2.semester
            JOIN students s ON e1.student_id = s.student_id
            JOIN users u ON s.user_id = u.id
            JOIN enrollments e ON e1.student_id = e.student_id 
                AND e.semester = e1.semester
                AND e.course_id IN (?, ?)
            JOIN course_schedules cs ON e.schedule_id = cs.schedule_id
            JOIN schedule_times st ON cs.time_id = st.time_id
            WHERE e1.course_id = ? 
            AND e2.course_id = ?
            AND e1.semester = ?
            AND e1.status = 'approved'
            AND e2.status = 'approved'
            GROUP BY e1.student_id
            ORDER BY s.student_number
        ");
        $stmt->execute([$courseId1, $courseId2, $courseId1, $courseId2, $semester]);
        $students = $stmt->fetchAll();
        
        generateCSVReport(
            "shared_courses_" . implode("_", $courses) . "_sem" . $semester . ".csv",
            ["Student Number", "First Name", "Last Name", "Email", "Class Schedule", "Courses Enrolled"],
            array_map(function($s) {
                return [
                    $s['student_number'],
                    $s['first_name'],
                    $s['last_name'],
                    $s['email'],
                    $s['schedule'],
                    $s['course_count']
                ];
            }, $students)
        );
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to generate report: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Generate same-day enrollment report
 * Shows all students enrolled on a specific day and their class times
 */
function generateSameDayReport($pdo, $day, $semester) {
    if (!$day || !$semester) {
        sendResponse('error', 'Day and semester are required', null, HTTP_BAD_REQUEST);
    }
    
    try {
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        if (!in_array($day, $days)) {
            sendResponse('error', 'Invalid day', null, HTTP_BAD_REQUEST);
        }
        
        $stmt = $pdo->prepare("
            SELECT DISTINCT
                s.student_number,
                u.first_name,
                u.last_name,
                u.email,
                COUNT(DISTINCT e.course_id) as num_classes,
                GROUP_CONCAT(DISTINCT CONCAT(c.course_code, ' (', st.time_slot, ')') 
                    ORDER BY st.start_time SEPARATOR ', ') as classes
            FROM enrollments e
            JOIN students s ON e.student_id = s.student_id
            JOIN users u ON s.user_id = u.id
            JOIN courses c ON e.course_id = c.course_id
            JOIN course_schedules cs ON e.schedule_id = cs.schedule_id
            JOIN schedule_times st ON cs.time_id = st.time_id
            WHERE cs.day_of_week = ? 
            AND e.semester = ?
            AND e.status = 'approved'
            GROUP BY e.student_id
            HAVING num_classes > 0
            ORDER BY num_classes DESC, s.student_number
        ");
        $stmt->execute([$day, $semester]);
        $students = $stmt->fetchAll();
        
        generateCSVReport(
            "same_day_" . strtolower($day) . "_sem" . $semester . ".csv",
            ["Student Number", "First Name", "Last Name", "Email", "Number of Classes", "Classes on " . $day],
            array_map(function($s) {
                return [
                    $s['student_number'],
                    $s['first_name'],
                    $s['last_name'],
                    $s['email'],
                    $s['num_classes'],
                    $s['classes']
                ];
            }, $students)
        );
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to generate report: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Get available courses for report generation
 */
function getAvailableCoursesForReport($pdo, $semester) {
    if (!$semester) {
        sendResponse('error', 'Semester is required', null, HTTP_BAD_REQUEST);
    }
    
    try {
        $stmt = $pdo->prepare("
            SELECT DISTINCT
                c.course_id,
                c.course_code,
                c.course_name,
                COUNT(e.enrollment_id) as total_enrolled
            FROM courses c
            LEFT JOIN enrollments e ON c.course_id = e.course_id 
                AND e.status = 'approved' 
                AND e.semester = ?
            WHERE c.semester = ?
            GROUP BY c.course_id
            ORDER BY c.course_code
        ");
        $stmt->execute([$semester, $semester]);
        $courses = $stmt->fetchAll();
        
        sendResponse('success', 'Courses retrieved', $courses);
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to retrieve courses: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Helper function to generate and download CSV file
 */
function generateCSVReport($filename, $headers, $rows) {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    $output = fopen('php://output', 'w');
    
    // BOM for Excel UTF-8
    fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));
    
    // Write headers
    fputcsv($output, $headers);
    
    // Write data rows
    foreach ($rows as $row) {
        fputcsv($output, $row);
    }
    
    fclose($output);
    exit;
}

?>
