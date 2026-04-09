import React, { useState, useEffect } from 'react';
import '../styles/admin.css';

/**
 * Reports Component - Handles generation and export of enrollment reports
 */
export function AdminReports() {
  const [reportType, setReportType] = useState('course_enrolled');
  const [semester, setSemester] = useState(2);
  const [courses, setCourses] = useState([]);
  const [selectedCourse1, setSelectedCourse1] = useState('');
  const [selectedCourse2, setSelectedCourse2] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Fetch available courses
  useEffect(() => {
    if (semester) {
      fetchAvailableCourses();
    }
  }, [semester]);

  const fetchAvailableCourses = async () => {
    try {
      const response = await fetch(
        `/PreEnrollment/api/reports.php?action=get_available_courses&semester=${semester}`
      );
      const result = await response.json();
      if (result.status === 'success') {
        setCourses(result.data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let url = `/PreEnrollment/api/reports.php?`;

      switch (reportType) {
        case 'course_enrolled':
          if (!selectedCourse1) {
            setError('Please select a course');
            setLoading(false);
            return;
          }
          url += `action=course_enrolled&course_id=${selectedCourse1}&semester=${semester}`;
          break;

        case 'shared_courses':
          if (!selectedCourse1 || !selectedCourse2) {
            setError('Please select two courses');
            setLoading(false);
            return;
          }
          url += `action=shared_courses&course_id_1=${selectedCourse1}&course_id_2=${selectedCourse2}&semester=${semester}`;
          break;

        case 'same_day':
          url += `action=same_day&day=${selectedDay}&semester=${semester}`;
          break;

        default:
          setError('Invalid report type');
          setLoading(false);
          return;
      }

      // Trigger CSV download
      window.location.href = url;
      setSuccess('Report generated successfully!');
    } catch (err) {
      setError('Error generating report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-reports">
      <h2>Generate Reports</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-group">
        <label>Semester:</label>
        <select value={semester} onChange={(e) => setSemester(e.target.value)}>
          <option value={1}>Semester 1</option>
          <option value={2}>Semester 2</option>
        </select>
      </div>

      <div className="form-group">
        <label>Report Type:</label>
        <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
          <option value="course_enrolled">Students Enrolled in Course (CSV)</option>
          <option value="shared_courses">Students in Same Two Courses (CSV)</option>
          <option value="same_day">Students with Classes on Same Day (CSV)</option>
        </select>
      </div>

      {reportType === 'course_enrolled' && (
        <div className="form-group">
          <label>Select Course:</label>
          <select value={selectedCourse1} onChange={(e) => setSelectedCourse1(e.target.value)}>
            <option value="">-- Select a course --</option>
            {courses.map((course) => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_code} - {course.course_name} ({course.total_enrolled} enrolled)
              </option>
            ))}
          </select>
        </div>
      )}

      {reportType === 'shared_courses' && (
        <>
          <div className="form-group">
            <label>Select First Course:</label>
            <select value={selectedCourse1} onChange={(e) => setSelectedCourse1(e.target.value)}>
              <option value="">-- Select a course --</option>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_code} - {course.course_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Select Second Course:</label>
            <select value={selectedCourse2} onChange={(e) => setSelectedCourse2(e.target.value)}>
              <option value="">-- Select a course --</option>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_code} - {course.course_name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {reportType === 'same_day' && (
        <div className="form-group">
          <label>Select Day:</label>
          <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
      )}

      <button 
        onClick={handleGenerateReport} 
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? 'Generating...' : 'Generate & Download Report (CSV)'}
      </button>
    </div>
  );
}

export default AdminReports;
