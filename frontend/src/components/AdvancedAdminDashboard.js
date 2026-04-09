import React, { useState, useEffect } from 'react';
import '../styles/admin.css';

/**
 * Advanced Admin Dashboard Component
 * Shows enrollment statistics, batch information, and student scheduling
 */
export function AdvancedAdminDashboard() {
  const [semester, setSemester] = useState(2);
  const [stats, setStats] = useState(null);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvalReason, setApprovalReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchPendingEnrollments();
  }, [semester]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/PreEnrollment/api/enrollments.php?action=stats');
      const result = await response.json();
      if (result.status === 'success') {
        setStats(result.data);
      }
    } catch (err) {
      setError('Error loading statistics: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingEnrollments = async () => {
    try {
      const response = await fetch('/PreEnrollment/api/enrollments.php?action=pending');
      const result = await response.json();
      if (result.status === 'success') {
        setPendingEnrollments(result.data);
      }
    } catch (err) {
      setError('Error loading pending enrollments: ' + err.message);
    }
  };

  const handleApprovalAction = async (enrollment, action) => {
    try {
      const response = await fetch(`/PreEnrollment/api/enrollments.php?action=${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollment_id: enrollment.enrollment_id,
          rejection_reason: action === 'reject' ? rejectionReason : undefined,
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        fetchPendingEnrollments();
        setSelectedEnrollment(null);
        setActionType(null);
        setRejectionReason('');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error processing action: ' + err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="dashboard-container">
        {/* Statistics Section */}
        <section className="dashboard-section">
          <h2>Enrollment Statistics</h2>
          
          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Enrollments</h3>
                <p className="stat-number">{stats.total}</p>
              </div>
              
              {stats.by_status && stats.by_status.map((item) => (
                <div key={item.status} className="stat-card">
                  <h3>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</h3>
                  <p className="stat-number">{item.count}</p>
                </div>
              ))}
            </div>
          )}

          <div className="stats-detailed">
            <h3>Enrollments by Course</h3>
            {stats && stats.by_course && stats.by_course.length > 0 ? (
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Code</th>
                    <th>Students Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.by_course.map((course) => (
                    <tr key={course.course_id}>
                      <td>{course.course_name}</td>
                      <td>{course.course_code}</td>
                      <td>{course.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No enrollment data available</p>
            )}
          </div>

          <div className="stats-detailed">
            <h3>Enrollments by Day</h3>
            {stats && stats.by_day && stats.by_day.length > 0 ? (
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Number of Classes</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.by_day.map((day) => (
                    <tr key={day.day_of_week}>
                      <td>{day.day_of_week}</td>
                      <td>{day.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No day-based data available</p>
            )}
          </div>
        </section>

        {/* Pending Enrollments Section */}
        <section className="dashboard-section">
          <h2>Pending Enrollment Approvals ({pendingEnrollments.length})</h2>
          
          {pendingEnrollments.length > 0 ? (
            <div className="pending-table-container">
              <table className="pending-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Student #</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Schedule (Day/Time)</th>
                    <th>Requested Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEnrollments.map((enrollment) => (
                    <tr key={enrollment.enrollment_id}>
                      <td>
                        {enrollment.first_name} {enrollment.last_name}
                      </td>
                      <td>{enrollment.student_number}</td>
                      <td>{enrollment.email}</td>
                      <td>{enrollment.course_code} - {enrollment.course_name}</td>
                      <td>
                        {enrollment.day_of_week} • {enrollment.time_slot}
                        <br />
                        <small>({enrollment.start_time} - {enrollment.end_time})</small>
                      </td>
                      <td>{new Date(enrollment.enrolled_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-small btn-success"
                          onClick={() => {
                            setSelectedEnrollment(enrollment);
                            setActionType('approve');
                          }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => {
                            setSelectedEnrollment(enrollment);
                            setActionType('reject');
                          }}
                        >
                          ✕ Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No pending enrollments</p>
          )}
        </section>
      </div>

      {/* Action Modal */}
      {selectedEnrollment && actionType && (
        <div className="modal-overlay" onClick={() => setSelectedEnrollment(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Enrollment
            </h3>
            
            <p>
              <strong>{selectedEnrollment.first_name} {selectedEnrollment.last_name}</strong> -
              {' '}{selectedEnrollment.course_code}: {selectedEnrollment.course_name}
            </p>

            {actionType === 'reject' && (
              <div className="form-group">
                <label>Rejection Reason (optional):</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={4}
                />
              </div>
            )}

            <div className="modal-actions">
              <button
                className={`btn ${actionType === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={() => handleApprovalAction(selectedEnrollment, actionType)}
              >
                {actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
              <button
                className="btn btn-gray"
                onClick={() => setSelectedEnrollment(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvancedAdminDashboard;
