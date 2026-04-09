import axios from 'axios';

const API_BASE_URL = 'http://localhost/PreEnrollment/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth.php?action=register', userData),
  login: (credentials) => api.post('/auth.php?action=login', credentials),
  logout: () => api.get('/auth.php?action=logout'),
  checkAuth: () => api.get('/auth.php?action=check')
};

// Courses API calls
export const coursesAPI = {
  listCourses: () => api.get('/courses.php?action=list'),
  getCourseSchedules: (courseId, semester) => 
    api.get('/courses.php?action=schedules', { 
      params: { course_id: courseId, semester } 
    }),
  getAllSchedules: (semester) => 
    api.get('/courses.php?action=schedules', { 
      params: { semester } 
    }),
  getCourseDetails: (courseId) => 
    api.get('/courses.php?action=details', { 
      params: { course_id: courseId } 
    }),
  createCourse: (courseData) => 
    api.post('/courses.php?action=create', courseData),
  deleteCourse: (courseId) => 
    api.delete('/courses.php?action=delete', { 
      params: { course_id: courseId } 
    })
};

// Enrollments API calls
export const enrollmentsAPI = {
  getMyEnrollments: () => api.get('/enrollments.php?action=my_enrollments'),
  enrollCourse: (enrollmentData) => 
    api.post('/enrollments.php?action=enroll', enrollmentData),
  cancelEnrollment: (enrollmentId) => 
    api.delete('/enrollments.php?action=cancel', { 
      params: { enrollment_id: enrollmentId } 
    }),
  getPendingEnrollments: () => 
    api.get('/enrollments.php?action=pending'),
  approveEnrollment: (enrollmentId) => 
    api.post('/enrollments.php?action=approve', { enrollment_id: enrollmentId }),
  rejectEnrollment: (enrollmentId, reason) => 
    api.post('/enrollments.php?action=reject', { 
      enrollment_id: enrollmentId, 
      rejection_reason: reason 
    }),
  getStats: () => api.get('/enrollments.php?action=stats')
};

// Notifications API calls
export const notificationsAPI = {
  getNotifications: (limit = 20) => 
    api.get('/notifications.php?action=list', { 
      params: { limit } 
    }),
  getUnreadCount: () => 
    api.get('/notifications.php?action=unread'),
  markAsRead: (notificationId) => 
    api.put('/notifications.php?action=mark_read', { 
      notification_id: notificationId 
    })
};

export default api;
