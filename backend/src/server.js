import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import { seedDatabase } from './seedData.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}));
app.use(express.json());

const mapUser = (row) => ({
  email: row.email,
  name: row.name,
  role: row.role,
  ciheId: row.cihe_id,
});

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

app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true });
});

app.post('/api/setup/seed', async (req, res) => {
  const force = Boolean(req.body?.force);
  const result = await seedDatabase(pool, { force });
  res.json(result);
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const [rows] = await pool.query(
    'SELECT email, name, role, cihe_id FROM users WHERE email = ? AND password = ? LIMIT 1',
    [email, password]
  );

  if (!rows.length) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  return res.json({ user: mapUser(rows[0]) });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, role } = req.body || {};
  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: 'Email, password, name, and role are required' });
  }

  if (role !== 'student' && role !== 'admin') {
    return res.status(400).json({ message: 'Role must be student or admin' });
  }

  const [existing] = await pool.query('SELECT email FROM users WHERE email = ? LIMIT 1', [email]);
  if (existing.length) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const ciheId = role === 'student' ? `CIHE${Math.floor(100000 + Math.random() * 900000)}` : null;

  await pool.query(
    'INSERT INTO users (email, password, name, role, cihe_id) VALUES (?, ?, ?, ?, ?)',
    [email, password, name, role, ciheId]
  );

  return res.status(201).json({
    user: {
      email,
      name,
      role,
      ciheId,
    },
  });
});

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

app.get('/api/courses', async (_req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, unit_code, semester, day_of_week, time_slot, created_at FROM courses ORDER BY unit_code ASC'
  );
  res.json({ courses: rows.map(mapCourse) });
});

app.post('/api/courses', async (req, res) => {
  const { name, unitCode, semester, dayOfWeek, timeSlot } = req.body || {};
  if (!name || !unitCode || !semester || !dayOfWeek || !timeSlot) {
    return res.status(400).json({ message: 'All course fields are required' });
  }

  const [existing] = await pool.query('SELECT id FROM courses WHERE unit_code = ? LIMIT 1', [unitCode]);
  if (existing.length) {
    return res.status(409).json({ message: 'A course with this unit code already exists' });
  }

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

app.put('/api/courses/:id', async (req, res) => {
  const { id } = req.params;
  const { name, unitCode, semester, dayOfWeek, timeSlot } = req.body || {};
  if (!name || !unitCode || !semester || !dayOfWeek || !timeSlot) {
    return res.status(400).json({ message: 'All course fields are required' });
  }

  const [existingById] = await pool.query('SELECT id, unit_code FROM courses WHERE id = ? LIMIT 1', [id]);
  if (!existingById.length) {
    return res.status(404).json({ message: 'Course not found' });
  }

  const currentUnitCode = existingById[0].unit_code;
  if (unitCode !== currentUnitCode) {
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

app.delete('/api/courses/:id', async (req, res) => {
  const { id } = req.params;

  const [prefRows] = await pool.query('SELECT COUNT(*) AS count FROM preferences WHERE course_id = ?', [id]);
  if (Number(prefRows[0].count) > 0) {
    return res.status(409).json({ message: 'Cannot delete course that has student enrollments' });
  }

  await pool.query('DELETE FROM courses WHERE id = ?', [id]);
  return res.json({ success: true });
});

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

app.get('/api/preferences/all', async (_req, res) => {
  const [rows] = await pool.query(
    'SELECT id, student_email, course_id, time_preference, day_preference, status, submitted_at FROM preferences ORDER BY submitted_at DESC'
  );
  return res.json({ preferences: rows.map(mapPreference) });
});

app.post('/api/preferences', async (req, res) => {
  const { studentEmail, courseId, timePreference, dayPreference } = req.body || {};
  if (!studentEmail || !courseId || !timePreference || !dayPreference) {
    return res.status(400).json({ message: 'All preference fields are required' });
  }

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

app.delete('/api/preferences/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM preferences WHERE id = ?', [id]);
  return res.json({ success: true });
});

app.delete('/api/preferences', async (_req, res) => {
  await pool.query('DELETE FROM preferences');
  return res.json({ success: true });
});

app.get('/api/statistics', async (_req, res) => {
  const [coursesRows] = await pool.query(
    'SELECT id, name, unit_code, semester, day_of_week, time_slot, created_at FROM courses ORDER BY unit_code ASC'
  );
  const [preferencesRows] = await pool.query(
    'SELECT id, student_email, course_id, time_preference, day_preference, status, submitted_at FROM preferences'
  );

  const courses = coursesRows.map(mapCourse);
  const preferences = preferencesRows.map(mapPreference);

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

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ message });
});

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
