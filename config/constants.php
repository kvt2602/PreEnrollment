<?php
/**
 * Application Constants
 */

// System settings
define('APP_NAME', 'Pre-Enrollment System');
define('APP_VERSION', '1.0.0');
define('APP_URL', 'http://localhost/PreEnrollment');
define('API_URL', APP_URL . '/api');

// Enrollment limits
define('MAX_COURSES_PER_SEMESTER', 4);
define('MAX_CLASSES_PER_DAY', 3);
define('MAX_STUDENTS_PER_CLASS', 30);

// Session timeout (in minutes)
define('SESSION_TIMEOUT', 60);

// Default semester
define('CURRENT_SEMESTER', 2);

// User roles
define('ROLE_STUDENT', 'student');
define('ROLE_ADMIN', 'admin');

// Enrollment statuses
define('STATUS_PENDING', 'pending');
define('STATUS_APPROVED', 'approved');
define('STATUS_REJECTED', 'rejected');
define('STATUS_CANCELLED', 'cancelled');

// Notification types
define('NOTIF_ENROLLMENT_APPROVED', 'enrollment_approved');
define('NOTIF_ENROLLMENT_REJECTED', 'enrollment_rejected');
define('NOTIF_COURSE_UPDATED', 'course_updated');
define('NOTIF_SYSTEM_MESSAGE', 'system_message');

// HTTP status codes
define('HTTP_OK', 200);
define('HTTP_CREATED', 201);
define('HTTP_BAD_REQUEST', 400);
define('HTTP_UNAUTHORIZED', 401);
define('HTTP_FORBIDDEN', 403);
define('HTTP_NOT_FOUND', 404);
define('HTTP_INTERNAL_ERROR', 500);
?>
