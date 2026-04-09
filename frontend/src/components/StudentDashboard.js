import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { coursesAPI, enrollmentsAPI, notificationsAPI } from '../services/api';
import '../styles/student.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [enrollments, setEnrollments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('courses');
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [enrollmentStats, setEnrollmentStats] = useState({
    total: 0,
    approved: 0,
    pending: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesRes, enrollmentsRes, notificationsRes, unreadRes] = await Promise.all([
        coursesAPI.listCourses(),
        enrollmentsAPI.getMyEnrollments(),
        notificationsAPI.getNotifications(5),
        notificationsAPI.getUnreadCount()
      ]);

      setCourses(coursesRes.data.data);
      setEnrollments(enrollmentsRes.data.data);
      setNotifications(notificationsRes.data.data);
      setUnreadCount(unreadRes.data.data.count);

      // Calculate stats
      const stats = enrollmentsRes.data.data.reduce((acc, e) => {
        acc.total++;
        if (e.status === 'approved') acc.approved++;
        else if (e.status === 'pending') acc.pending++;
        return acc;
      }, { total: 0, approved: 0, pending: 0 });
      setEnrollmentStats(stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadSchedulesForCourse = async (courseId) => {
    try {
      const schedulesRes = await coursesAPI.getCourseSchedules(courseId, 2);
      setSchedules(prev => ({
        ...prev,
        [courseId]: schedulesRes.data.data
      }));
    } catch (err) {
      alert('Failed to load schedules: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleExpandCourse = (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
      if (!schedules[courseId]) {
        loadSchedulesForCourse(courseId);
      }
    }
  };

  const handleEnroll = async (courseId, scheduleId) => {
    try {
      await enrollmentsAPI.enrollCourse({
        course_id: courseId,
        schedule_id: scheduleId,
        semester: 2
      });
      await loadData();
      setExpandedCourse(null);
      alert('Enrollment request submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const handleCancel = async (enrollmentId) => {
    if (!window.confirm('Cancel this enrollment?')) return;

    try {
      await enrollmentsAPI.cancelEnrollment(enrollmentId);
      await loadData();
      alert('Enrollment cancelled successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
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
          <h1>Pre-Enrollment System</h1>
          <div className="nav-items">
            <span>Welcome, {user?.username}</span>
            <button onClick={handleLogout} className="btn btn-logout">Logout</button>
          </div>
        </div>
      </nav>

      <div className="container">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <h3>{enrollmentStats.approved}</h3>
            <p>Approved Courses</p>
          </div>
          <div className="stat-card">
            <h3>{enrollmentStats.pending}</h3>
            <p>Pending Courses</p>
          </div>
          <div className="stat-card">
            <h3>{unreadCount}</h3>
            <p>Notifications</p>
          </div>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            Available Courses
          </button>
          <button 
            className={`tab ${activeTab === 'enrollments' ? 'active' : ''}`}
            onClick={() => setActiveTab('enrollments')}
          >
            My Enrollments
          </button>
          <button 
            className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
        </div>

        {activeTab === 'courses' && (
          <div className="content">
            <h2>Available Courses</h2>
            <div className="courses-list">
              {courses.map(course => (
                <div key={course.course_id} className="course-item">
                  <div className="course-header">
                    <div className="course-info">
                      <h3>{course.course_code}</h3>
                      <h4>{course.course_name}</h4>
                      <p className="credits">Credits: {course.credits}</p>
                    </div>
                    <button 
                      onClick={() => handleExpandCourse(course.course_id)}
                      className="btn btn-primary"
                    >
                      {expandedCourse === course.course_id ? 'Hide Schedules' : 'Show Schedules'}
                    </button>
                  </div>

                  {expandedCourse === course.course_id && (
                    <div className="course-schedules">
                      <h4>Available Schedules</h4>
                      {schedules[course.course_id] && schedules[course.course_id].length > 0 ? (
                        <table className="schedule-table">
                          <thead>
                            <tr>
                              <th>Day</th>
                              <th>Time</th>
                              <th>Room</th>
                              <th>Available Slots</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {schedules[course.course_id].map(schedule => (
                              <tr key={schedule.schedule_id}>
                                <td>{schedule.day_of_week}</td>
                                <td>{schedule.time_slot}</td>
                                <td>{schedule.room || 'TBD'}</td>
                                <td>{schedule.max_students - schedule.enrolled_count}/{schedule.max_students}</td>
                                <td>
                                  {schedule.enrolled_count < schedule.max_students ? (
                                    <button 
                                      onClick={() => handleEnroll(course.course_id, schedule.schedule_id)}
                                      className="btn btn-success btn-sm"
                                    >
                                      Enroll
                                    </button>
                                  ) : (
                                    <span className="text-muted">Full</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p>No schedules available for this course</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'enrollments' && (
          <div className="content">
            <h2>My Enrollments</h2>
            <div className="enrollments-list">
              {enrollments.length === 0 ? (
                <p>No enrollments yet</p>
              ) : (
                enrollments.map(enrollment => (
                  <div key={enrollment.enrollment_id} className="enrollment-item">
                    <div className="enrollment-info">
                      <h3>{enrollment.course_code} - {enrollment.course_name}</h3>
                      <p>{enrollment.day_of_week} {enrollment.time_slot}</p>
                      <p>Room: {enrollment.room}</p>
                      <span className={`status ${enrollment.status}`}>
                        {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                      </span>
                    </div>
                    {enrollment.status === 'pending' && (
                      <button 
                        onClick={() => handleCancel(enrollment.enrollment_id)}
                        className="btn btn-danger"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="content">
            <h2>Notifications</h2>
            <div className="notifications-list">
              {notifications.length === 0 ? (
                <p>No notifications</p>
              ) : (
                notifications.map(notif => (
                  <div key={notif.notification_id} className="notification-item">
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <small>{new Date(notif.created_at).toLocaleDateString()}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
