CREATE DATABASE IF NOT EXISTS pre_enrolment;
USE pre_enrolment;

CREATE TABLE IF NOT EXISTS users (
  email VARCHAR(255) NOT NULL PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') NOT NULL,
  cihe_id VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  unit_code VARCHAR(50) NOT NULL UNIQUE,
  semester VARCHAR(20) NOT NULL,
  day_of_week VARCHAR(20) NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS preferences (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  student_email VARCHAR(255) NOT NULL,
  course_id VARCHAR(50) NOT NULL,
  time_preference VARCHAR(20) NOT NULL,
  day_preference VARCHAR(20) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  submitted_at DATETIME NOT NULL,
  CONSTRAINT fk_preferences_user FOREIGN KEY (student_email) REFERENCES users(email) ON DELETE CASCADE,
  CONSTRAINT fk_preferences_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
