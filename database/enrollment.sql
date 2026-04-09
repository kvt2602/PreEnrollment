-- Pre-Enrollment System Database Schema
-- Created for semester-based course enrollment management

-- Create database
CREATE DATABASE IF NOT EXISTS enrollment_db;
USE enrollment_db;

-- Users table (for both students and admins)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Students table (additional student info)
CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    student_number VARCHAR(20) UNIQUE NOT NULL,
    program VARCHAR(100),
    year_level INT DEFAULT 1,
    contact_number VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Courses table
CREATE TABLE courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(200) NOT NULL,
    description TEXT,
    credits INT DEFAULT 3,
    max_capacity INT DEFAULT 30,
    semester INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Schedule times (fixed times for classes)
CREATE TABLE schedule_times (
    time_id INT PRIMARY KEY AUTO_INCREMENT,
    time_slot VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    UNIQUE KEY unique_time_slot (time_slot)
);

-- Course Schedules table
CREATE TABLE course_schedules (
    schedule_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    day_of_week VARCHAR(10) NOT NULL,
    time_id INT NOT NULL,
    room VARCHAR(50),
    max_students INT DEFAULT 30,
    enrolled_count INT DEFAULT 0,
    semester INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (time_id) REFERENCES schedule_times(time_id),
    UNIQUE KEY unique_course_schedule (course_id, day_of_week, time_id, semester)
);

-- Enrollments table
CREATE TABLE enrollments (
    enrollment_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    schedule_id INT NOT NULL,
    semester INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
    approved_by INT,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES course_schedules(schedule_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id),
    UNIQUE KEY unique_enrollment (student_id, course_id, semester)
);

-- Notifications table
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    enrollment_id INT,
    type ENUM('enrollment_approved', 'enrollment_rejected', 'course_updated', 'system_message') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_enrollments_semester ON enrollments(semester);
CREATE INDEX idx_course_schedules_course ON course_schedules(course_id);
CREATE INDEX idx_course_schedules_semester ON course_schedules(semester);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Insert default schedule times
INSERT INTO schedule_times (time_slot, start_time, end_time) VALUES
('Morning', '08:15:00', '11:15:00'),
('Afternoon', '11:30:00', '14:30:00'),
('Evening', '15:00:00', '18:00:00');

-- Insert sample courses for Semester 2
INSERT INTO courses (course_code, course_name, description, credits, semester) VALUES
('ICT310', 'ITSM', 'IT Service Management', 3, 2),
('ICT309', 'GRC', 'Governance, Risk and Compliance', 3, 2),
('ICT307', 'Project1', 'Project Management 1', 3, 2),
('ICT305', 'Topics in IT', 'Current Topics in Information Technology', 3, 2),
('ICT301', 'ICT PM', 'ICT Project Management', 3, 2),
('ICT206', 'Software Eng', 'Software Engineering', 3, 2),
('ICT204', 'Cyber Security', 'Cybersecurity Fundamentals', 3, 2),
('ICT203', 'Web App Dev', 'Web Application Development', 3, 2),
('ICT202', 'Cloud Comp', 'Cloud Computing', 3, 2),
('ICT201', 'DBS', 'Database Systems', 3, 2),
('ICT103', 'Programming', 'Programming Fundamentals', 3, 2);
