import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { enrollmentsAPI, coursesAPI } from '../services/api';
import '../styles/admin.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    course_code: '',
    course_name: '',
    credits: 3,
    semester: 2,
    day_of_week: 'Monday',
    time_slot: '1'
  });

  const timeSlots = [
    { id: '1', label: '8:15am - 11:15am' },
    { id: '2', label: '11:30am - 2:30pm' },
    { id: '3', label: '2:45pm - 5:45pm' },
    { id: '4', label: '6:00pm - 9:00pm' }
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pendRes, statsRes, coursesRes] = await Promise.all([
        enrollmentsAPI.getPendingEnrollments(),
        enrollmentsAPI.getStats(),
        coursesAPI.listCourses()
      ]);

      setPendingEnrollments(pendRes.data.data);
      setStats(statsRes.data.data);
      setCourses(coursesRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (enrollmentId) => {
    try {
      await enrollmentsAPI.approveEnrollment(enrollmentId);
      await loadData();
      alert('Enrollment approved!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleRejectClick = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setRejectReason('');
  };

  const handleReject = async () => {
    try {
      await enrollmentsAPI.rejectEnrollment(
        selectedEnrollment.enrollment_id,
        rejectReason
      );
      await loadData();
      setSelectedEnrollment(null);
      alert('Enrollment rejected!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    }
  };

  const handleAddCourse = async () => {
    try {
      if (!newCourse.course_code || !newCourse.course_name) {
        alert('Please fill in all required fields');
        return;
      }
      await coursesAPI.createCourse(newCourse);
      setShowAddCourseForm(false);
      setNewCourse({ course_code: '', course_name: '', credits: 3, semester: 2, day_of_week: 'Monday', time_slot: '1' });
      await loadData();
      alert('Course added successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add course');
    }
  };

  const handleRemoveCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to remove this course?')) {
      try {
        await coursesAPI.deleteCourse(courseId);
        await loadData();
        alert('Course removed successfully!');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to remove course');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="container">
          <h1>Administrator - Pre-Enrollment System</h1>
          <div className="nav-items">
            <span>Welcome, {user?.username}</span>
            <button onClick={handleLogout} className="btn btn-logout">Logout</button>
          </div>
        </div>
      </nav>

      <div className="container">
        {error && <div className="alert alert-error">{error}</div>}

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{stats.total}</h3>
              <p>Total Enrollments</p>
            </div>
            <div className="stat-card">
              <h3>{stats.by_status?.find(s => s.status === 'pending')?.count || 0}</h3>
              <p>Pending</p>
            </div>
            <div className="stat-card">
              <h3>{stats.by_status?.find(s => s.status === 'approved')?.count || 0}</h3>
              <p>Approved</p>
            </div>
            <div className="stat-card">
              <h3>{stats.by_status?.find(s => s.status === 'rejected')?.count || 0}</h3>
              <p>Rejected</p>
            </div>
          </div>
        )}

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Enrollments ({pendingEnrollments.length})
          </button>
          <button 
            className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            Manage Courses ({courses.length})
          </button>
          <button 
            className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="content">
            <h2>Pending Enrollments</h2>
            {pendingEnrollments.length === 0 ? (
              <p>No pending enrollments</p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Schedule</th>
                      <th>Requested</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingEnrollments.map(enrollment => (
                      <tr key={enrollment.enrollment_id}>
                        <td>
                          <strong>{enrollment.first_name} {enrollment.last_name}</strong>
                          <br/><small>{enrollment.student_number}</small>
                        </td>
                        <td>{enrollment.course_code} - {enrollment.course_name}</td>
                        <td>
                          {enrollment.day_of_week} {enrollment.time_slot}
                          <br/><small>{enrollment.room}</small>
                        </td>
                        <td>{new Date(enrollment.enrolled_at).toLocaleDateString()}</td>
                        <td>
                          <button 
                            onClick={() => handleApprove(enrollment.enrollment_id)}
                            className="btn btn-success btn-sm"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectClick(enrollment)}
                            className="btn btn-danger btn-sm"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="content">
            <div className="content-header">
              <h2>Manage Courses</h2>
              <button 
                onClick={() => setShowAddCourseForm(!showAddCourseForm)}
                className="btn btn-primary"
              >
                {showAddCourseForm ? 'Cancel' : '+ Add Course'}
              </button>
            </div>

            {showAddCourseForm && (
              <div className="form-card">
                <h3>Add New Course</h3>
                <div className="form-group">
                  <label>Course Code *</label>
                  <input
                    type="text"
                    value={newCourse.course_code}
                    onChange={(e) => setNewCourse({...newCourse, course_code: e.target.value})}
                    placeholder="e.g., ICT310"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Course Name *</label>
                  <input
                    type="text"
                    value={newCourse.course_name}
                    onChange={(e) => setNewCourse({...newCourse, course_name: e.target.value})}
                    placeholder="e.g., Information Security"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Credits</label>
                  <input
                    type="number"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({...newCourse, credits: parseInt(e.target.value)})}
                    min="1"
                    max="4"
                  />
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <input
                    type="number"
                    value={newCourse.semester}
                    onChange={(e) => setNewCourse({...newCourse, semester: parseInt(e.target.value)})}
                    min="1"
                    max="2"
                  />
                </div>
                <div className="form-group">
                  <label>Day of Week *</label>
                  <select
                    value={newCourse.day_of_week}
                    onChange={(e) => setNewCourse({...newCourse, day_of_week: e.target.value})}
                    required
                  >
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Time Slot *</label>
                  <select
                    value={newCourse.time_slot}
                    onChange={(e) => setNewCourse({...newCourse, time_slot: e.target.value})}
                    required
                  >
                    {timeSlots.map(slot => (
                      <option key={slot.id} value={slot.id}>{slot.label}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={handleAddCourse}
                  className="btn btn-success"
                >
                  Add Course
                </button>
              </div>
            )}

            {courses.length === 0 ? (
              <p>No courses available. Add one to get started.</p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Day</th>
                      <th>Time</th>
                      <th>Credits</th>
                      <th>Semester</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.course_id}>
                        <td><strong>{course.course_code}</strong></td>
                        <td>{course.course_name}</td>
                        <td>{course.day_of_week}</td>
                        <td>
                          {timeSlots.find(slot => slot.id === String(course.time_slot))?.label || 'N/A'}
                        </td>
                        <td>{course.credits}</td>
                        <td>Semester {course.semester}</td>
                        <td>
                          <span className={`badge ${course.is_active ? 'badge-success' : 'badge-inactive'}`}>
                            {course.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button 
                            onClick={() => handleRemoveCourse(course.course_id)}
                            className="btn btn-danger btn-sm"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="content">
            <h2>Enrollment Reports</h2>
            
            {stats && (
              <>
                <div className="report-section">
                  <h3>Enrollments by Course</h3>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Enrollments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.by_course.map((course, idx) => (
                        <tr key={idx}>
                          <td>{course.course_code}</td>
                          <td>{course.course_name}</td>
                          <td>{course.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="report-section">
                  <h3>Enrollments by Day</h3>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Enrollments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.by_day.map((day, idx) => (
                        <tr key={idx}>
                          <td>{day.day_of_week}</td>
                          <td>{day.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {selectedEnrollment && (
          <div className="modal-overlay" onClick={() => setSelectedEnrollment(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>Reject Enrollment</h3>
              <p>
                {selectedEnrollment.course_code} - {selectedEnrollment.course_name}
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason"
                rows="4"
              />
              <div className="modal-actions">
                <button 
                  onClick={handleReject}
                  className="btn btn-danger"
                >
                  Reject
                </button>
                <button 
                  onClick={() => setSelectedEnrollment(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
