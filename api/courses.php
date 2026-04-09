<?php
/**
 * Courses API
 * Handles course retrieval and schedule management
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../includes/functions.php';

startSession();

$action = $_GET['action'] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if ($action === 'list') {
        listCourses($pdo);
    } elseif ($action === 'schedules') {
        getCourseSchedules($pdo);
    } elseif ($action === 'details') {
        getCourseDetails($pdo, $_GET['course_id'] ?? null);
    } else {
        sendResponse('error', 'Invalid action', null, HTTP_BAD_REQUEST);
    }
} elseif ($method === 'POST' && isLoggedIn() && getCurrentUserRole() === 'admin') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($action === 'create') {
        createCourse($pdo, $data);
    } elseif ($action === 'add_schedule') {
        addSchedule($pdo, $data);
    } else {
        sendResponse('error', 'Invalid action', null, HTTP_BAD_REQUEST);
    }
} elseif ($method === 'DELETE' && isLoggedIn() && getCurrentUserRole() === 'admin') {
    if ($action === 'delete') {
        deleteCourse($pdo, $_GET['course_id'] ?? null);
    } elseif ($action === 'delete_schedule') {
        deleteSchedule($pdo, $_GET['schedule_id'] ?? null);
    } else {
        sendResponse('error', 'Invalid action', null, HTTP_BAD_REQUEST);
    }
} else {
    sendResponse('error', 'Unauthorized', null, HTTP_UNAUTHORIZED);
}

/**
 * Get all active courses
 */
function listCourses($pdo) {
    try {
        $stmt = $pdo->prepare("
            SELECT c.*, cs.day_of_week, cs.time_id, st.time_slot, st.start_time, st.end_time
            FROM courses c
            LEFT JOIN course_schedules cs ON c.course_id = cs.course_id AND cs.is_active = TRUE
            LEFT JOIN schedule_times st ON cs.time_id = st.time_id
            WHERE c.is_active = TRUE
            ORDER BY c.course_code
        ");
        $stmt->execute();
        $courses = $stmt->fetchAll();
        
        sendResponse('success', 'Courses retrieved', $courses);
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to retrieve courses: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Get course schedules
 */
function getCourseSchedules($pdo) {
    try {
        $courseId = $_GET['course_id'] ?? null;
        $semester = $_GET['semester'] ?? CURRENT_SEMESTER;
        
        if ($courseId) {
            $stmt = $pdo->prepare("
                SELECT cs.*, st.time_slot, st.start_time, st.end_time, c.course_code, c.course_name
                FROM course_schedules cs
                JOIN schedule_times st ON cs.time_id = st.time_id
                JOIN courses c ON cs.course_id = c.course_id
                WHERE cs.course_id = ? AND cs.semester = ? AND cs.is_active = TRUE
                ORDER BY cs.day_of_week, cs.time_id
            ");
            $stmt->execute([$courseId, $semester]);
        } else {
            $stmt = $pdo->prepare("
                SELECT cs.*, st.time_slot, st.start_time, st.end_time, c.course_code, c.course_name
                FROM course_schedules cs
                JOIN schedule_times st ON cs.time_id = st.time_id
                JOIN courses c ON cs.course_id = c.course_id
                WHERE cs.semester = ? AND cs.is_active = TRUE
                ORDER BY c.course_code, cs.day_of_week, cs.time_id
            ");
            $stmt->execute([$semester]);
        }
        
        $schedules = $stmt->fetchAll();
        sendResponse('success', 'Schedules retrieved', $schedules);
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to retrieve schedules: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Get course details
 */
function getCourseDetails($pdo, $courseId) {
    if (!$courseId) {
        sendResponse('error', 'Course ID is required', null, HTTP_BAD_REQUEST);
    }
    
    try {
        // Get course info
        $stmt = $pdo->prepare("SELECT * FROM courses WHERE course_id = ?");
        $stmt->execute([$courseId]);
        $course = $stmt->fetch();
        
        if (!$course) {
            sendResponse('error', 'Course not found', null, HTTP_NOT_FOUND);
        }
        
        // Get schedules
        $stmt = $pdo->prepare("
            SELECT cs.*, st.time_slot, st.start_time, st.end_time
            FROM course_schedules cs
            JOIN schedule_times st ON cs.time_id = st.time_id
            WHERE cs.course_id = ? AND cs.is_active = TRUE
            ORDER BY cs.day_of_week, cs.time_id
        ");
        $stmt->execute([$courseId]);
        $course['schedules'] = $stmt->fetchAll();
        
        sendResponse('success', 'Course details retrieved', $course);
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to retrieve course: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Create new course (Admin)
 */
function createCourse($pdo, $data) {
    if (empty($data['course_code']) || empty($data['course_name']) || empty($data['semester'])) {
        sendResponse('error', 'Course code, name, and semester are required', null, HTTP_BAD_REQUEST);
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO courses (course_code, course_name, description, credits, semester)
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            sanitizeInput($data['course_code']),
            sanitizeInput($data['course_name']),
            sanitizeInput($data['description'] ?? ''),
            $data['credits'] ?? 3,
            $data['semester']
        ]);
        
        $courseId = $pdo->lastInsertId();
        
        // If day_of_week and time_slot are provided, add schedule
        if (!empty($data['day_of_week']) && !empty($data['time_slot'])) {
            $stmt = $pdo->prepare("
                INSERT INTO course_schedules (course_id, day_of_week, time_id, room, semester)
                VALUES (?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $courseId,
                sanitizeInput($data['day_of_week']),
                $data['time_slot'],
                sanitizeInput($data['room'] ?? ''),
                $data['semester']
            ]);
        }
        
        sendResponse('success', 'Course created', ['course_id' => $courseId], HTTP_CREATED);
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to create course: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Add course schedule (Admin)
 */
function addSchedule($pdo, $data) {
    if (empty($data['course_id']) || empty($data['day_of_week']) || empty($data['time_id']) || empty($data['semester'])) {
        sendResponse('error', 'Course ID, day, time, and semester are required', null, HTTP_BAD_REQUEST);
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO course_schedules (course_id, day_of_week, time_id, room, semester)
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['course_id'],
            sanitizeInput($data['day_of_week']),
            $data['time_id'],
            sanitizeInput($data['room'] ?? ''),
            $data['semester']
        ]);
        
        sendResponse('success', 'Schedule added', ['schedule_id' => $pdo->lastInsertId()], HTTP_CREATED);
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to add schedule: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Delete course (Admin)
 */
function deleteCourse($pdo, $courseId) {
    if (!$courseId) {
        sendResponse('error', 'Course ID is required', null, HTTP_BAD_REQUEST);
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE courses SET is_active = FALSE WHERE course_id = ?");
        $stmt->execute([$courseId]);
        
        sendResponse('success', 'Course deleted');
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to delete course: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

/**
 * Delete schedule (Admin)
 */
function deleteSchedule($pdo, $scheduleId) {
    if (!$scheduleId) {
        sendResponse('error', 'Schedule ID is required', null, HTTP_BAD_REQUEST);
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE course_schedules SET is_active = FALSE WHERE schedule_id = ?");
        $stmt->execute([$scheduleId]);
        
        sendResponse('success', 'Schedule deleted');
        
    } catch (PDOException $e) {
        sendResponse('error', 'Failed to delete schedule: ' . $e->getMessage(), null, HTTP_INTERNAL_ERROR);
    }
}

?>
