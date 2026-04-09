-- Migration: Add batch management to enrollment system
-- This adds support for creating multiple class batches when capacity is exceeded

-- Add batch_number column to course_schedules
ALTER TABLE course_schedules ADD COLUMN batch_number INT DEFAULT 1 AFTER room;

-- Create class_batches table to track separate batches
CREATE TABLE IF NOT EXISTS class_batches (
    batch_id INT PRIMARY KEY AUTO_INCREMENT,
    schedule_id INT NOT NULL,
    batch_number INT NOT NULL,
    room VARCHAR(50),
    max_capacity INT DEFAULT 30,
    current_enrollment INT DEFAULT 0,
    status ENUM('open', 'closed', 'full') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES course_schedules(schedule_id) ON DELETE CASCADE,
    UNIQUE KEY unique_batch (schedule_id, batch_number)
);

-- Add batch_id to enrollments to track which batch student is in
ALTER TABLE enrollments ADD COLUMN batch_id INT AFTER schedule_id;
ALTER TABLE enrollments ADD FOREIGN KEY (batch_id) REFERENCES class_batches(batch_id) ON DELETE SET NULL;

-- Create course_groupings table to track courses that should be on same day
CREATE TABLE IF NOT EXISTS course_groupings (
    grouping_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id_1 INT NOT NULL,
    course_id_2 INT NOT NULL,
    semester INT NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id_1) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id_2) REFERENCES courses(course_id) ON DELETE CASCADE,
    UNIQUE KEY unique_grouping (course_id_1, course_id_2, semester)
);

-- Create index for better performance
CREATE INDEX idx_class_batches_schedule ON class_batches(schedule_id);
CREATE INDEX idx_class_batches_status ON class_batches(status);
CREATE INDEX idx_enrollments_batch ON enrollments(batch_id);
CREATE INDEX idx_course_groupings_semester ON course_groupings(semester);

-- Create password_resets table for password reset functionality
CREATE TABLE IF NOT EXISTS password_resets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_expires ON password_resets(expires_at);

-- Insert default course groupings for this semester
INSERT INTO course_groupings (course_id_1, course_id_2, semester, reason) VALUES
((SELECT course_id FROM courses WHERE course_code = 'ICT307'), 
 (SELECT course_id FROM courses WHERE course_code = 'ICT309'), 
 2, 'Group together: Project1 and GRC'),
((SELECT course_id FROM courses WHERE course_code = 'ICT206'), 
 (SELECT course_id FROM courses WHERE course_code = 'ICT203'), 
 2, 'Group together: Software Eng and Web App Dev');
