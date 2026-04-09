export const demoUsers = [
  {
    email: 'student@cihe.edu',
    password: 'student123',
    name: 'John Student',
    role: 'student',
    ciheId: 'CIHE231554',
  },
  {
    email: 'sarah@cihe.edu',
    password: 'student123',
    name: 'Sarah Johnson',
    role: 'student',
    ciheId: 'CIHE231555',
  },
  {
    email: 'michael@cihe.edu',
    password: 'student123',
    name: 'Michael Chen',
    role: 'student',
    ciheId: 'CIHE231556',
  },
  {
    email: 'emma@cihe.edu',
    password: 'student123',
    name: 'Emma Williams',
    role: 'student',
    ciheId: 'CIHE231557',
  },
  {
    email: 'admin@cihe.edu',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    ciheId: null,
  },
];

export const demoCourses = [
  { id: 'ICT101', name: 'Introduction to Information Technology', unitCode: 'ICT101', semester: '1', dayOfWeek: 'Monday', timeSlot: '8:15-11:15' },
  { id: 'ICT103', name: 'Programming', unitCode: 'ICT103', semester: '1', dayOfWeek: 'Monday', timeSlot: '11:30-14:30' },
  { id: 'BUS101', name: 'Business Communication', unitCode: 'BUS101', semester: '1', dayOfWeek: 'Monday', timeSlot: '14:45-17:45' },
  { id: 'BUS112', name: 'Management Principles and Operations', unitCode: 'BUS112', semester: '1', dayOfWeek: 'Monday', timeSlot: '18:00-21:00' },
  { id: 'BUS108', name: 'Business Ethics in Digital Age', unitCode: 'BUS108', semester: '2', dayOfWeek: 'Tuesday', timeSlot: '8:15-11:15' },
  { id: 'ICT104', name: 'Fundamentals of Computability', unitCode: 'ICT104', semester: '2', dayOfWeek: 'Tuesday', timeSlot: '11:30-14:30' },
  { id: 'ICT102', name: 'Networking', unitCode: 'ICT102', semester: '2', dayOfWeek: 'Tuesday', timeSlot: '14:45-17:45' },
  { id: 'ICT201', name: 'Database Systems', unitCode: 'ICT201', semester: '2', dayOfWeek: 'Tuesday', timeSlot: '18:00-21:00' },
  { id: 'ICT202', name: 'Cloud Computing', unitCode: 'ICT202', semester: '3', dayOfWeek: 'Wednesday', timeSlot: '8:15-11:15' },
  { id: 'ICT203', name: 'Web Application Development', unitCode: 'ICT203', semester: '3', dayOfWeek: 'Wednesday', timeSlot: '11:30-14:30' },
  { id: 'ICT206', name: 'Software Engineering', unitCode: 'ICT206', semester: '3', dayOfWeek: 'Wednesday', timeSlot: '14:45-17:45' },
  { id: 'ICT208', name: 'Algorithms and Data Structures', unitCode: 'ICT208', semester: '3', dayOfWeek: 'Wednesday', timeSlot: '18:00-21:00' },
  { id: 'ICT205', name: 'Mobile Application Development', unitCode: 'ICT205', semester: '4', dayOfWeek: 'Thursday', timeSlot: '8:15-11:15' },
  { id: 'ICT204', name: 'Cyber Security', unitCode: 'ICT204', semester: '4', dayOfWeek: 'Thursday', timeSlot: '11:30-14:30' },
  { id: 'ICT301', name: 'Information Technology Project Management', unitCode: 'ICT301', semester: '4', dayOfWeek: 'Thursday', timeSlot: '14:45-17:45' },
  { id: 'ICT303', name: 'Big Data', unitCode: 'ICT303', semester: '5', dayOfWeek: 'Friday', timeSlot: '8:15-11:15' },
  { id: 'ICT309', name: 'Information Technology Governance, Risk and Compliance', unitCode: 'ICT309', semester: '5', dayOfWeek: 'Friday', timeSlot: '11:30-14:30' },
  { id: 'ICT307', name: 'Project 1 (Analysis and Design)', unitCode: 'ICT307', semester: '5', dayOfWeek: 'Friday', timeSlot: '14:45-17:45' },
  { id: 'ICT305', name: 'Topics in IT', unitCode: 'ICT305', semester: '5', dayOfWeek: 'Friday', timeSlot: '18:00-21:00' },
  { id: 'BUS306', name: 'Work Integrated Learning (Internship)', unitCode: 'BUS306', semester: '6', dayOfWeek: 'Wednesday', timeSlot: '8:15-11:15' },
  { id: 'ICT306', name: 'Advanced Cyber Security', unitCode: 'ICT306', semester: '6', dayOfWeek: 'Wednesday', timeSlot: '8:15-11:15' },
  { id: 'ICT308', name: 'Project 2 (Programming and Testing)', unitCode: 'ICT308', semester: '6', dayOfWeek: 'Wednesday', timeSlot: '11:30-14:30' },
  { id: 'ICT310', name: 'Information Technology Services Management', unitCode: 'ICT310', semester: '6', dayOfWeek: 'Wednesday', timeSlot: '14:45-17:45' },
];

export const demoPreferences = [
  {
    id: 'student@cihe.edu:ICT101:1',
    studentEmail: 'student@cihe.edu',
    courseId: 'ICT101',
    timePreference: '8:15-11:15',
    dayPreference: 'Monday',
    status: 'pending',
    submittedAt: '2025-03-15T00:00:00.000Z',
  },
  {
    id: 'student@cihe.edu:ICT103:2',
    studentEmail: 'student@cihe.edu',
    courseId: 'ICT103',
    timePreference: '11:30-14:30',
    dayPreference: 'Monday',
    status: 'pending',
    submittedAt: '2025-03-15T00:00:00.000Z',
  },
  {
    id: 'sarah@cihe.edu:BUS112:3',
    studentEmail: 'sarah@cihe.edu',
    courseId: 'BUS112',
    timePreference: '18:00-21:00',
    dayPreference: 'Thursday',
    status: 'pending',
    submittedAt: '2025-03-18T00:00:00.000Z',
  },
  {
    id: 'michael@cihe.edu:ICT102:4',
    studentEmail: 'michael@cihe.edu',
    courseId: 'ICT102',
    timePreference: '14:45-17:45',
    dayPreference: 'Friday',
    status: 'pending',
    submittedAt: '2025-03-20T00:00:00.000Z',
  },
  {
    id: 'emma@cihe.edu:ICT205:5',
    studentEmail: 'emma@cihe.edu',
    courseId: 'ICT205',
    timePreference: '8:15-11:15',
    dayPreference: 'Thursday',
    status: 'pending',
    submittedAt: '2025-03-21T00:00:00.000Z',
  },
];

export async function seedDatabase(pool, { force = false } = {}) {
  if (force) {
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('TRUNCATE TABLE preferences');
    await pool.query('TRUNCATE TABLE courses');
    await pool.query('TRUNCATE TABLE users');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
  }

  const [userCountRows] = await pool.query('SELECT COUNT(*) AS count FROM users');
  const shouldSeed = force || Number(userCountRows[0]?.count || 0) === 0;

  if (!shouldSeed) {
    return { seeded: false };
  }

  for (const user of demoUsers) {
    await pool.query(
      `INSERT INTO users (email, password, name, role, cihe_id)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         password = VALUES(password),
         name = VALUES(name),
         role = VALUES(role),
         cihe_id = VALUES(cihe_id)`,
      [user.email, user.password, user.name, user.role, user.ciheId]
    );
  }

  for (const course of demoCourses) {
    await pool.query(
      `INSERT INTO courses (id, name, unit_code, semester, day_of_week, time_slot)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         unit_code = VALUES(unit_code),
         semester = VALUES(semester),
         day_of_week = VALUES(day_of_week),
         time_slot = VALUES(time_slot)`,
      [course.id, course.name, course.unitCode, course.semester, course.dayOfWeek, course.timeSlot]
    );
  }

  for (const preference of demoPreferences) {
    await pool.query(
      `INSERT INTO preferences (id, student_email, course_id, time_preference, day_preference, status, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         time_preference = VALUES(time_preference),
         day_preference = VALUES(day_preference),
         status = VALUES(status),
         submitted_at = VALUES(submitted_at)`,
      [
        preference.id,
        preference.studentEmail,
        preference.courseId,
        preference.timePreference,
        preference.dayPreference,
        preference.status,
        preference.submittedAt,
      ]
    );
  }

  return { seeded: true };
}
