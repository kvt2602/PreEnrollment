import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import pool from './db.js';
import { seedDatabase } from './seedData.js';

// Load environment variables from a .env file before the server starts.
dotenv.config();

// Create the Express application and resolve the port once at startup.
const app = express();
const port = Number(process.env.PORT || 4000);

// Security headers — sets X-Content-Type-Options, X-Frame-Options, removes X-Powered-By, etc.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Allow the frontend to call this API and accept JSON request bodies.
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
}));
// Limit request body size to prevent payload-based DoS.
app.use(express.json({ limit: '10kb' }));

// Convert a database user row into the shape expected by the frontend.
const mapUser = (row) => ({
  email: row.email,
  name: row.name,
  role: row.role,
  ciheId: row.cihe_id,
});

// Convert a database course row into API-friendly camelCase fields.
const mapCourse = (row) => ({
  id: row.id,
  name: row.name,
  unitCode: row.unit_code,
  semester: row.semester,
  dayOfWeek: row.day_of_week,
  timeSlot: row.time_slot,
  createdAt: row.created_at,
});

const mapPreference = (row) => ({
  id: row.id,
  studentEmail: row.student_email,
  courseId: row.course_id,
  timePreference: row.time_preference,
  dayPreference: row.day_preference,
  status: row.status,
  submittedAt: row.submitted_at,
});

// Group time values into morning/evening buckets so reports stay consistent
// even when the stored value is either a label or a clock time.
function toBucket(slot) {
  const value = (slot || '').toLowerCase();
  if (value === 'morning' || value === 'evening') {
    return value;
  }
  const hour = Number(value.split(':')[0]);
  if (!Number.isNaN(hour) && hour < 12) {
    return 'morning';
  }
  return 'evening';
}

// --- Input validation helpers ---

// Validate email format.
function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Strip HTML tags and trim whitespace to prevent stored XSS.
function sanitize(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/<[^>]*>/g, '').trim();
}

// Validate password: minimum 8 chars, at least one letter and one digit.
function isStrongPassword(password) {
  return typeof password === 'string' && password.length >= 8 &&
    /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}

// --- Simple health check used to confirm the API and database connection are alive.
app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true });
});

// Seed the database on demand for local setup or resetting demo data.
app.post('/api/setup/seed', async (req, res) => {
  const force = Boolean(req.body?.force);
  const result = await seedDatabase(pool, { force });
  res.json(result);
});

// Authenticate a user by email and compare the submitted password to the hashed password.
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  if (typeof password !== 'string' || password.length > 128) {
    return res.status(400).json({ message: 'Invalid password' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Fetch by email only — never compare passwords in SQL to prevent timing attacks.
  const [rows] = await pool.query(
    'SELECT email, name, role, cihe_id, password FROM users WHERE email = ? LIMIT 1',
    [normalizedEmail]
  );

  if (!rows.length) {
    // Return the same error regardless of whether the email exists (prevent user enumeration).
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const userRow = rows[0];
  const passwordMatches = await bcrypt.compare(password, userRow.password);

  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  return res.json({ user: mapUser(userRow) });
});

// Register a new student or admin account after validating and hashing the password.
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, role } = req.body || {};

  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: 'Email, password, name, and role are required' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  if (!isStrongPassword(password)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters and contain a letter and a digit' });
  }
  const cleanName = sanitize(name);
  if (!cleanName || cleanName.length > 100) {
    return res.status(400).json({ message: 'Name must be between 1 and 100 characters' });
  }
  if (role !== 'student' && role !== 'admin') {
    return res.status(400).json({ message: 'Role must be student or admin' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const [existing] = await pool.query('SELECT email FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
  if (existing.length) {
    return res.status(409).json({ message: 'User already exists' });
  }

  // Hash the password with bcrypt before storing (cost factor 12).
  const hashedPassword = await bcrypt.hash(password, 12);

  // Student accounts receive a generated CIHE identifier; admins do not.
  const ciheId = role === 'student' ? `CIHE${Math.floor(100000 + Math.random() * 900000)}` : null;

  await pool.query(
    'INSERT INTO users (email, password, name, role, cihe_id) VALUES (?, ?, ?, ?, ?)',
    [normalizedEmail, hashedPassword, cleanName, role, ciheId]
  return res.status(201).json({
    user: {
      email: normalizedEmail,
      name: cleanName,
      role,
      ciheId,
    },
  });
});

// Return all users, or only users for a specific role when requested.
app.get('/api/users', async (req, res) => {
  const role = req.query.role;
  let query = 'SELECT email, name, role, cihe_id FROM users';
  const params = [];

  if (role) {
    query += ' WHERE role = ?';
    params.push(role);
  }

  query += ' ORDER BY name ASC';

  const [rows] = await pool.query(query, params);
  res.json({ users: rows.map(mapUser) });
});

// Return the current list of courses for dashboards and forms.
app.get('/api/courses', async (_req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, unit_code, semester, day_of_week, time_slot, created_at FROM courses ORDER BY unit_code ASC'
  );
  res.json({ courses: rows.map(mapCourse) });
});

// Create a new course after checking for missing fields and duplicate unit codes.
app.post('/api/courses', async (req, res) => {
  let { name, unitCode, semester, dayOfWeek, timeSlot } = req.body || {};
  name = sanitize(name); unitCode = sanitize(unitCode);
  semester = sanitize(semester); dayOfWeek = sanitize(dayOfWeek); timeSlot = sanitize(timeSlot);
  if (!name || !unitCode || !semester || !dayOfWeek || !timeSlot) {
    return res.status(400).json({ message: 'All course fields are required' });
  }
  if (name.length > 200 || unitCode.length > 20 || semester.length > 50 || dayOfWeek.length > 20 || timeSlot.length > 50) {
    return res.status(400).json({ message: 'One or more course fields exceed the maximum allowed length' });
  }

  const [existing] = await pool.query('SELECT id FROM courses WHERE unit_code = ? LIMIT 1', [unitCode]);
  if (existing.length) {
    return res.status(409).json({ message: 'A course with this unit code already exists' });
  }

  // Use the unit code as the course identifier so the ID is stable and readable.
  const id = unitCode;
  await pool.query(
    'INSERT INTO courses (id, name, unit_code, semester, day_of_week, time_slot) VALUES (?, ?, ?, ?, ?, ?)',
    [id, name, unitCode, semester, dayOfWeek, timeSlot]
  );

  const [rows] = await pool.query(
    'SELECT id, name, unit_code, semester, day_of_week, time_slot, created_at FROM courses WHERE id = ? LIMIT 1',
    [id]
  );

  return res.status(201).json({ course: mapCourse(rows[0]) });
});

// Update an existing course while preserving unit-code uniqueness.
app.put('/api/courses/:id', async (req, res) => {
  const { id } = req.params;
  let { name, unitCode, semester, dayOfWeek, timeSlot } = req.body || {};
  name = sanitize(name); unitCode = sanitize(unitCode);
  semester = sanitize(semester); dayOfWeek = sanitize(dayOfWeek); timeSlot = sanitize(timeSlot);
  if (!name || !unitCode || !semester || !dayOfWeek || !timeSlot) {
    return res.status(400).json({ message: 'All course fields are required' });
  }
  if (name.length > 200 || unitCode.length > 20 || semester.length > 50 || dayOfWeek.length > 20 || timeSlot.length > 50) {
    return res.status(400).json({ message: 'One or more course fields exceed the maximum allowed length' });
  }

  const [existingById] = await pool.query('SELECT id, unit_code FROM courses WHERE id = ? LIMIT 1', [id]);
  if (!existingById.length) {
    return res.status(404).json({ message: 'Course not found' });
  }

  const currentUnitCode = existingById[0].unit_code;
  if (unitCode !== currentUnitCode) {
    // Only perform the duplicate check when the unit code is actually changing.
    const [duplicate] = await pool.query(
      'SELECT id FROM courses WHERE unit_code = ? AND id <> ? LIMIT 1',
      [unitCode, id]
    );
    if (duplicate.length) {
      return res.status(409).json({ message: 'A course with this unit code already exists' });
    }
  }

  await pool.query(
    'UPDATE courses SET name = ?, unit_code = ?, semester = ?, day_of_week = ?, time_slot = ? WHERE id = ?',
    [name, unitCode, semester, dayOfWeek, timeSlot, id]
  );

  const [rows] = await pool.query(
    'SELECT id, name, unit_code, semester, day_of_week, time_slot, created_at FROM courses WHERE id = ? LIMIT 1',
    [id]
  );

  return res.json({ course: mapCourse(rows[0]) });
});

// Prevent deleting a course that is already referenced by student preferences.
app.delete('/api/courses/:id', async (req, res) => {
  const { id } = req.params;

  const [prefRows] = await pool.query('SELECT COUNT(*) AS count FROM preferences WHERE course_id = ?', [id]);
  if (Number(prefRows[0].count) > 0) {
    return res.status(409).json({ message: 'Cannot delete course that has student enrollments' });
  }

  await pool.query('DELETE FROM courses WHERE id = ?', [id]);
  return res.json({ success: true });
});

// Return preference submissions, optionally filtered to a single student.
app.get('/api/preferences', async (req, res) => {
  const { email } = req.query;
  let query = 'SELECT id, student_email, course_id, time_preference, day_preference, status, submitted_at FROM preferences';
  const params = [];

  if (email) {
    query += ' WHERE student_email = ?';
    params.push(email);
  }

  query += ' ORDER BY submitted_at DESC';

  const [rows] = await pool.query(query, params);
  return res.json({ preferences: rows.map(mapPreference) });
});

// Admin-focused endpoint that returns all preferences without filters.
app.get('/api/preferences/all', async (_req, res) => {
  const [rows] = await pool.query(
    'SELECT id, student_email, course_id, time_preference, day_preference, status, submitted_at FROM preferences ORDER BY submitted_at DESC'
  );
  return res.json({ preferences: rows.map(mapPreference) });
});

// Create a new preference submission for a student's chosen course and timeslot.
app.post('/api/preferences', async (req, res) => {
  let { studentEmail, courseId, timePreference, dayPreference } = req.body || {};
  studentEmail = sanitize(studentEmail);
  courseId = sanitize(courseId);
  timePreference = sanitize(timePreference);
  dayPreference = sanitize(dayPreference);
  if (!studentEmail || !courseId || !timePreference || !dayPreference) {
    return res.status(400).json({ message: 'All preference fields are required' });
  }
  if (!isValidEmail(studentEmail)) {
    return res.status(400).json({ message: 'Invalid student email format' });
  }
  if (!['morning', 'evening'].includes(timePreference.toLowerCase())) {
    return res.status(400).json({ message: 'Time preference must be morning or evening' });
  }

  // Build a simple unique ID from the student, course, and submission time.
  const id = `${studentEmail}:${courseId}:${Date.now()}`;
  const submittedAt = new Date();

  await pool.query(
    `INSERT INTO preferences
      (id, student_email, course_id, time_preference, day_preference, status, submitted_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
    [id, studentEmail, courseId, timePreference, dayPreference, submittedAt]
  );

  const [rows] = await pool.query(
    'SELECT id, student_email, course_id, time_preference, day_preference, status, submitted_at FROM preferences WHERE id = ? LIMIT 1',
    [id]
  );

  return res.status(201).json({ preference: mapPreference(rows[0]) });
});

// Allow admins to approve, reject, or reset an enrollment preference.
app.patch('/api/preferences/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be pending, approved, or rejected' });
  }

  const [result] = await pool.query('UPDATE preferences SET status = ? WHERE id = ?', [status, id]);
  if (!result.affectedRows) {
    return res.status(404).json({ message: 'Preference not found' });
  }

  const [rows] = await pool.query(
    'SELECT id, student_email, course_id, time_preference, day_preference, status, submitted_at FROM preferences WHERE id = ? LIMIT 1',
    [id]
  );

  return res.json({ preference: mapPreference(rows[0]) });
});

// Delete one specific preference submission.
app.delete('/api/preferences/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM preferences WHERE id = ?', [id]);
  return res.json({ success: true });
});

// Clear every preference record. This is useful for resets but should be used carefully.
app.delete('/api/preferences', async (_req, res) => {
  await pool.query('DELETE FROM preferences');
  return res.json({ success: true });
});

// Build summary statistics used by admin reporting screens.
app.get('/api/statistics', async (_req, res) => {
  const [coursesRows] = await pool.query(
    'SELECT id, name, unit_code, semester, day_of_week, time_slot, created_at FROM courses ORDER BY unit_code ASC'
  );
  const [preferencesRows] = await pool.query(
    'SELECT id, student_email, course_id, time_preference, day_preference, status, submitted_at FROM preferences'
  );

  const courses = coursesRows.map(mapCourse);
  const preferences = preferencesRows.map(mapPreference);

  // For each course, count total submissions, status breakdown, and time-of-day demand.
  const statistics = courses.map((course) => {
    const coursePreferences = preferences.filter((p) => p.courseId === course.id);
    const morningPrefs = coursePreferences.filter((p) => toBucket(p.timePreference) === 'morning');
    const eveningPrefs = coursePreferences.filter((p) => toBucket(p.timePreference) === 'evening');

    return {
      courseId: course.id,
      courseName: course.name,
      unitCode: course.unitCode,
      total: coursePreferences.length,
      approved: coursePreferences.filter((p) => p.status === 'approved').length,
      pending: coursePreferences.filter((p) => p.status === 'pending').length,
      rejected: coursePreferences.filter((p) => p.status === 'rejected').length,
      morning: morningPrefs.length,
      evening: eveningPrefs.length,
      morningStudents: morningPrefs.map((p) => p.studentEmail),
      eveningStudents: eveningPrefs.map((p) => p.studentEmail),
    };
  });

  return res.json({ statistics });
});

// Detect students who selected multiple courses in the same time bucket,
// which may indicate timetable overlap or delivery conflicts.
app.get('/api/overlap-analysis', async (_req, res) => {
  const [preferencesRows] = await pool.query(
    'SELECT id, student_email, course_id, time_preference, day_preference, status, submitted_at FROM preferences'
  );
  const [coursesRows] = await pool.query(
    'SELECT id, name, unit_code, semester, day_of_week, time_slot, created_at FROM courses'
  );
  const [usersRows] = await pool.query('SELECT email, name, role, cihe_id FROM users');

  const preferences = preferencesRows.map(mapPreference);
  const courses = coursesRows.map(mapCourse);
  const users = usersRows.map(mapUser);

  // Group all preference records by student so each student can be checked once.
  const studentPreferences = new Map();
  preferences.forEach((pref) => {
    if (!studentPreferences.has(pref.studentEmail)) {
      studentPreferences.set(pref.studentEmail, []);
    }
    studentPreferences.get(pref.studentEmail).push(pref);
  });

  const overlaps = [];
  studentPreferences.forEach((prefs, studentEmail) => {
    const user = users.find((u) => u.email === studentEmail);
    const morningCourses = prefs.filter((p) => toBucket(p.timePreference) === 'morning');
    const eveningCourses = prefs.filter((p) => toBucket(p.timePreference) === 'evening');

    // A student appears in the report when they have more than one course in the same bucket.
    if (morningCourses.length > 1) {
      overlaps.push({
        studentEmail,
        studentName: user?.name || 'Unknown',
        ciheId: user?.ciheId || 'N/A',
        timeSlot: 'morning',
        courses: morningCourses.map((p) => {
          const course = courses.find((c) => c.id === p.courseId);
          return {
            courseId: p.courseId,
            courseName: course?.name || p.courseId,
            unitCode: course?.unitCode || p.courseId,
            status: p.status,
          };
        }),
        count: morningCourses.length,
      });
    }

    if (eveningCourses.length > 1) {
      overlaps.push({
        studentEmail,
        studentName: user?.name || 'Unknown',
        ciheId: user?.ciheId || 'N/A',
        timeSlot: 'evening',
        courses: eveningCourses.map((p) => {
          const course = courses.find((c) => c.id === p.courseId);
          return {
            courseId: p.courseId,
            courseName: course?.name || p.courseId,
            unitCode: course?.unitCode || p.courseId,
            status: p.status,
          };
        }),
        count: eveningCourses.length,
      });
    }
  });

  return res.json({
    overlaps,
    totalOverlaps: overlaps.length,
    courseTimeBreakdown: [],
    detailedBreakdown: [],
  });
});

// Centralized error handler so async route failures return JSON instead of crashing silently.
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ message });
});

// Start the HTTP server and try to verify that the database is reachable.
// If the database is not ready yet, the API still starts so local development can continue.
app.listen(port, async () => {
  try {
    await pool.query('SELECT 1');
    await seedDatabase(pool, { force: false });
    console.log(`API server running at http://localhost:${port}`);
  } catch (error) {
    console.error('API startup warning. Database not ready yet:', error.message);
    console.log(`API server running at http://localhost:${port}`);
  }
});
