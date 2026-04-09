const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const request = async (path: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const mockApi = {
  initializeDemoData: async () => {
    try {
      await request('/setup/seed', {
        method: 'POST',
        body: JSON.stringify({ force: false }),
      });
    } catch (error) {
      console.warn('Seed initialization skipped:', error);
    }
  },

  login: async (email: string, password: string) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (email: string, password: string, name: string, role: string) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
  },

  getUsers: async (role = 'student') => {
    return request(`/users?role=${encodeURIComponent(role)}`);
  },

  getCourses: async () => {
    return request('/courses');
  },

  getPreferences: async (email: string) => {
    return request(`/preferences?email=${encodeURIComponent(email)}`);
  },

  submitPreference: async (
    studentEmail: string,
    courseId: string,
    timePreference: string,
    dayPreference: string
  ) => {
    return request('/preferences', {
      method: 'POST',
      body: JSON.stringify({ studentEmail, courseId, timePreference, dayPreference }),
    });
  },

  getAllPreferences: async () => {
    return request('/preferences/all');
  },

  updatePreferenceStatus: async (id: string, status: string) => {
    return request(`/preferences/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  getStatistics: async () => {
    return request('/statistics');
  },

  getOverlapAnalysis: async () => {
    return request('/overlap-analysis');
  },

  addCourse: async (
    name: string,
    unitCode: string,
    semester: string,
    dayOfWeek: string,
    timeSlot: string
  ) => {
    return request('/courses', {
      method: 'POST',
      body: JSON.stringify({ name, unitCode, semester, dayOfWeek, timeSlot }),
    });
  },

  updateCourse: async (
    id: string,
    name: string,
    unitCode: string,
    semester: string,
    dayOfWeek: string,
    timeSlot: string
  ) => {
    return request(`/courses/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ name, unitCode, semester, dayOfWeek, timeSlot }),
    });
  },

  deleteCourse: async (id: string) => {
    return request(`/courses/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  deletePreference: async (id: string) => {
    return request(`/preferences/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  clearAllPreferences: async () => {
    return request('/preferences', {
      method: 'DELETE',
    });
  },

  resetDemoData: async () => {
    return request('/setup/seed', {
      method: 'POST',
      body: JSON.stringify({ force: true }),
    });
  },
};