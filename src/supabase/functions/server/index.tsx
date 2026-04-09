import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize demo data
const initializeDemoData = async () => {
  try {
    // Check if courses already exist
    const existingCourses = await kv.getByPrefix('course:');
    if (existingCourses.length === 0) {
      // Create demo courses
      const courses = [
        { id: 'CS101', name: 'Introduction to Computer Science', unitCode: 'CS101' },
        { id: 'BUS201', name: 'Business Management Fundamentals', unitCode: 'BUS201' },
        { id: 'ENG301', name: 'Software Engineering Principles', unitCode: 'ENG301' },
        { id: 'DATA202', name: 'Data Structures and Algorithms', unitCode: 'DATA202' },
        { id: 'WEB303', name: 'Web Development', unitCode: 'WEB303' },
        { id: 'AI401', name: 'Artificial Intelligence', unitCode: 'AI401' },
        { id: 'DB205', name: 'Database Systems', unitCode: 'DB205' },
        { id: 'NET304', name: 'Computer Networks', unitCode: 'NET304' },
      ];

      for (const course of courses) {
        await kv.set(`course:${course.id}`, course);
      }
      console.log('Demo courses initialized');
    }

    // Check if demo users exist
    const existingUsers = await kv.getByPrefix('user:');
    if (existingUsers.length === 0) {
      // Create demo users
      await kv.set('user:student@cihe.edu', {
        email: 'student@cihe.edu',
        password: 'student123',
        name: 'John Student',
        role: 'student',
        ciheId: 'CIHE231554',
      });

      await kv.set('user:sarah@cihe.edu', {
        email: 'sarah@cihe.edu',
        password: 'student123',
        name: 'Sarah Johnson',
        role: 'student',
        ciheId: 'CIHE231555',
      });

      await kv.set('user:michael@cihe.edu', {
        email: 'michael@cihe.edu',
        password: 'student123',
        name: 'Michael Chen',
        role: 'student',
        ciheId: 'CIHE231556',
      });

      await kv.set('user:emma@cihe.edu', {
        email: 'emma@cihe.edu',
        password: 'student123',
        name: 'Emma Williams',
        role: 'student',
        ciheId: 'CIHE231557',
      });

      await kv.set('user:admin@cihe.edu', {
        email: 'admin@cihe.edu',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
      });
      console.log('Demo users initialized');

      // Create some demo preferences to show overlap analysis
      await kv.set('preference:student@cihe.edu:CS101:demo1', {
        id: 'student@cihe.edu:CS101:demo1',
        studentEmail: 'student@cihe.edu',
        courseId: 'CS101',
        timePreference: 'morning',
        dayPreference: 'Monday',
        status: 'pending',
        submittedAt: new Date().toISOString(),
      });

      await kv.set('preference:sarah@cihe.edu:CS101:demo2', {
        id: 'sarah@cihe.edu:CS101:demo2',
        studentEmail: 'sarah@cihe.edu',
        courseId: 'CS101',
        timePreference: 'morning',
        dayPreference: 'Monday',
        status: 'approved',
        submittedAt: new Date().toISOString(),
      });

      await kv.set('preference:michael@cihe.edu:CS101:demo3', {
        id: 'michael@cihe.edu:CS101:demo3',
        studentEmail: 'michael@cihe.edu',
        courseId: 'CS101',
        timePreference: 'evening',
        dayPreference: 'Tuesday',
        status: 'approved',
        submittedAt: new Date().toISOString(),
      });

      await kv.set('preference:sarah@cihe.edu:BUS201:demo4', {
        id: 'sarah@cihe.edu:BUS201:demo4',
        studentEmail: 'sarah@cihe.edu',
        courseId: 'BUS201',
        timePreference: 'evening',
        dayPreference: 'Wednesday',
        status: 'pending',
        submittedAt: new Date().toISOString(),
      });

      await kv.set('preference:emma@cihe.edu:WEB303:demo5', {
        id: 'emma@cihe.edu:WEB303:demo5',
        studentEmail: 'emma@cihe.edu',
        courseId: 'WEB303',
        timePreference: 'morning',
        dayPreference: 'Monday',
        status: 'approved',
        submittedAt: new Date().toISOString(),
      });

      console.log('Demo preferences initialized');
    }
  } catch (error) {
    console.error('Error initializing demo data:', error);
  }
};

// Initialize demo data on server start
initializeDemoData();

// Health check endpoint
app.get("/make-server-42a92e76/health", (c) => {
  return c.json({ status: "ok" });
});

// Login endpoint
app.post("/make-server-42a92e76/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const user = await kv.get(`user:${email}`);

    if (!user || user.password !== password) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    return c.json({
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        ciheId: user.ciheId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Register endpoint
app.post("/make-server-42a92e76/register", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    if (!email || !password || !name || !role) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    const existingUser = await kv.get(`user:${email}`);
    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400);
    }

    // Generate CIHE ID for students
    const ciheId = role === 'student' ? `CIHE${Math.floor(100000 + Math.random() * 900000)}` : undefined;

    const user = {
      email,
      password,
      name,
      role,
      ciheId,
    };

    await kv.set(`user:${email}`, user);

    return c.json({
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        ciheId: user.ciheId,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// Get all courses
app.get("/make-server-42a92e76/courses", async (c) => {
  try {
    const courses = await kv.getByPrefix('course:');
    return c.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return c.json({ error: 'Failed to fetch courses' }, 500);
  }
});

// Get student preferences
app.get("/make-server-42a92e76/preferences/:email", async (c) => {
  try {
    const email = c.req.param('email');
    const allPreferences = await kv.getByPrefix('preference:');
    const studentPreferences = allPreferences.filter(p => p.studentEmail === email);
    return c.json({ preferences: studentPreferences });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return c.json({ error: 'Failed to fetch preferences' }, 500);
  }
});

// Submit course preference
app.post("/make-server-42a92e76/preferences", async (c) => {
  try {
    const { studentEmail, courseId, timePreference, dayPreference } = await c.req.json();

    if (!studentEmail || !courseId || !timePreference || !dayPreference) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    const preferenceId = `${studentEmail}:${courseId}:${Date.now()}`;
    const preference = {
      id: preferenceId,
      studentEmail,
      courseId,
      timePreference,
      dayPreference,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    await kv.set(`preference:${preferenceId}`, preference);

    return c.json({ preference });
  } catch (error) {
    console.error('Error submitting preference:', error);
    return c.json({ error: 'Failed to submit preference' }, 500);
  }
});

// Admin: Get all preferences
app.get("/make-server-42a92e76/admin/preferences", async (c) => {
  try {
    const preferences = await kv.getByPrefix('preference:');
    return c.json({ preferences });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return c.json({ error: 'Failed to fetch preferences' }, 500);
  }
});

// Admin: Update preference status
app.put("/make-server-42a92e76/admin/preferences/:id", async (c) => {
  try {
    const id = decodeURIComponent(c.req.param('id'));
    const { status } = await c.req.json();

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }

    const preference = await kv.get(`preference:${id}`);
    if (!preference) {
      return c.json({ error: 'Preference not found' }, 404);
    }

    preference.status = status;
    await kv.set(`preference:${id}`, preference);

    return c.json({ preference });
  } catch (error) {
    console.error('Error updating preference:', error);
    return c.json({ error: 'Failed to update preference' }, 500);
  }
});

// Admin: Get statistics
app.get("/make-server-42a92e76/admin/statistics", async (c) => {
  try {
    const preferences = await kv.getByPrefix('preference:');
    const courses = await kv.getByPrefix('course:');

    const statistics = courses.map(course => {
      const coursePreferences = preferences.filter(p => p.courseId === course.id);
      const morningPrefs = coursePreferences.filter(p => p.timePreference === 'morning');
      const eveningPrefs = coursePreferences.filter(p => p.timePreference === 'evening');
      
      return {
        courseId: course.id,
        courseName: course.name,
        unitCode: course.unitCode,
        total: coursePreferences.length,
        approved: coursePreferences.filter(p => p.status === 'approved').length,
        pending: coursePreferences.filter(p => p.status === 'pending').length,
        rejected: coursePreferences.filter(p => p.status === 'rejected').length,
        morning: morningPrefs.length,
        evening: eveningPrefs.length,
        morningStudents: morningPrefs.map(p => p.studentEmail),
        eveningStudents: eveningPrefs.map(p => p.studentEmail),
      };
    });

    return c.json({ statistics });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return c.json({ error: 'Failed to fetch statistics' }, 500);
  }
});

// Admin: Get overlap analysis
app.get("/make-server-42a92e76/admin/overlap-analysis", async (c) => {
  try {
    console.log('Fetching overlap analysis...');
    const preferences = await kv.getByPrefix('preference:');
    const courses = await kv.getByPrefix('course:');
    const users = await kv.getByPrefix('user:');
    console.log(`Found ${preferences.length} preferences, ${courses.length} courses, ${users.length} users`);

    // Group preferences by student
    const studentPreferences = new Map();
    preferences.forEach(pref => {
      if (!studentPreferences.has(pref.studentEmail)) {
        studentPreferences.set(pref.studentEmail, []);
      }
      studentPreferences.get(pref.studentEmail).push(pref);
    });

    // Find overlaps (same time slot)
    const overlaps = [];
    studentPreferences.forEach((prefs, studentEmail) => {
      const user = users.find(u => u.email === studentEmail);
      const morningCourses = prefs.filter(p => p.timePreference === 'morning');
      const eveningCourses = prefs.filter(p => p.timePreference === 'evening');

      if (morningCourses.length > 1) {
        overlaps.push({
          studentEmail,
          studentName: user?.name || 'Unknown',
          ciheId: user?.ciheId || 'N/A',
          timeSlot: 'morning',
          courses: morningCourses.map(p => ({
            courseId: p.courseId,
            courseName: courses.find(c => c.id === p.courseId)?.name || p.courseId,
            unitCode: courses.find(c => c.id === p.courseId)?.unitCode || p.courseId,
            status: p.status,
          })),
          count: morningCourses.length,
        });
      }

      if (eveningCourses.length > 1) {
        overlaps.push({
          studentEmail,
          studentName: user?.name || 'Unknown',
          ciheId: user?.ciheId || 'N/A',
          timeSlot: 'evening',
          courses: eveningCourses.map(p => ({
            courseId: p.courseId,
            courseName: courses.find(c => c.id === p.courseId)?.name || p.courseId,
            unitCode: courses.find(c => c.id === p.courseId)?.unitCode || p.courseId,
            status: p.status,
          })),
          count: eveningCourses.length,
        });
      }
    });

    // Course-Time breakdown with student details
    const courseTimeBreakdown = courses.map(course => {
      const coursePrefs = preferences.filter(p => p.courseId === course.id);
      const morningPrefs = coursePrefs.filter(p => p.timePreference === 'morning');
      const eveningPrefs = coursePrefs.filter(p => p.timePreference === 'evening');

      const morningStudents = morningPrefs.map(p => {
        const user = users.find(u => u.email === p.studentEmail);
        return {
          email: p.studentEmail,
          name: user?.name || 'Unknown',
          ciheId: user?.ciheId || 'N/A',
          status: p.status,
        };
      });

      const eveningStudents = eveningPrefs.map(p => {
        const user = users.find(u => u.email === p.studentEmail);
        return {
          email: p.studentEmail,
          name: user?.name || 'Unknown',
          ciheId: user?.ciheId || 'N/A',
          status: p.status,
        };
      });

      return {
        courseId: course.id,
        courseName: course.name,
        unitCode: course.unitCode,
        morning: {
          total: morningPrefs.length,
          approved: morningPrefs.filter(p => p.status === 'approved').length,
          pending: morningPrefs.filter(p => p.status === 'pending').length,
          students: morningStudents,
        },
        evening: {
          total: eveningPrefs.length,
          approved: eveningPrefs.filter(p => p.status === 'approved').length,
          pending: eveningPrefs.filter(p => p.status === 'pending').length,
          students: eveningStudents,
        },
      };
    });

    // Generate detailed course-day-time grouping for reports
    const detailedBreakdown = [];
    courses.forEach(course => {
      const coursePrefs = preferences.filter(p => p.courseId === course.id);
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const times = ['morning', 'evening'];
      
      days.forEach(day => {
        times.forEach(time => {
          const matchingPrefs = coursePrefs.filter(
            p => p.dayPreference === day && p.timePreference === time
          );
          
          if (matchingPrefs.length > 0) {
            detailedBreakdown.push({
              courseId: course.id,
              courseName: course.name,
              unitCode: course.unitCode,
              day,
              time,
              studentCount: matchingPrefs.length,
              students: matchingPrefs.map(p => {
                const user = users.find(u => u.email === p.studentEmail);
                return {
                  email: p.studentEmail,
                  name: user?.name || 'Unknown',
                  ciheId: user?.ciheId || 'N/A',
                  status: p.status,
                };
              }),
            });
          }
        });
      });
    });

    return c.json({ 
      overlaps,
      courseTimeBreakdown,
      detailedBreakdown,
      totalOverlaps: overlaps.length,
    });
  } catch (error) {
    console.error('Error fetching overlap analysis:', error);
    return c.json({ error: 'Failed to fetch overlap analysis' }, 500);
  }
});

Deno.serve(app.fetch);
