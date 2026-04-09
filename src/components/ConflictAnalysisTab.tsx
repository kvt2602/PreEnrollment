import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, Users, Calendar, Clock, Download } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface ConflictAnalysisTabProps {
  preferences: any[];
  courses: any[];
  loading: boolean;
}

export function ConflictAnalysisTab({ preferences, courses, loading }: ConflictAnalysisTabProps) {
  // Helper function to get user details
  const getUserDetails = (email: string) => {
    const users = JSON.parse(localStorage.getItem('cihe_users') || '[]');
    const user = users.find((u: any) => u.email === email);
    return {
      name: user?.name || email,
      ciheId: user?.ciheId || 'N/A'
    };
  };

  // Get course details
  const getCourseDetails = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return {
      name: course?.name || courseId,
      unitCode: course?.unitCode || courseId,
    };
  };

  // Group preferences by day and time slot to find conflicts
  const conflictAnalysis = () => {
    const timeSlotGroups: { [key: string]: any[] } = {};

    preferences.forEach(pref => {
      const key = `${pref.dayPreference}-${pref.timePreference}`;
      if (!timeSlotGroups[key]) {
        timeSlotGroups[key] = [];
      }
      timeSlotGroups[key].push(pref);
    });

    // Find time slots with multiple different courses
    const conflicts = Object.entries(timeSlotGroups)
      .map(([key, prefs]) => {
        const [day, time] = key.split('-');
        const uniqueCourses = [...new Set(prefs.map(p => p.courseId))];
        
        // Group by course to see how many students per course
        const courseGroups: { [courseId: string]: any[] } = {};
        prefs.forEach(pref => {
          if (!courseGroups[pref.courseId]) {
            courseGroups[pref.courseId] = [];
          }
          courseGroups[pref.courseId].push(pref);
        });

        return {
          day,
          time,
          totalStudents: prefs.length,
          courseCount: uniqueCourses.length,
          courses: Object.entries(courseGroups).map(([courseId, students]) => ({
            courseId,
            ...getCourseDetails(courseId),
            studentCount: students.length,
            students: students.map(s => ({
              ...getUserDetails(s.studentEmail),
              email: s.studentEmail,
            })),
          })),
          hasConflict: uniqueCourses.length > 1,
        };
      })
      .sort((a, b) => b.totalStudents - a.totalStudents);

    return conflicts;
  };

  const conflicts = conflictAnalysis();
  const highConflicts = conflicts.filter(c => c.hasConflict && c.totalStudents > 1);

  // Build Overlap Matrix - showing which courses share students at the same time
  const buildOverlapMatrix = () => {
    // Get all courses that have preferences
    const coursesWithPrefs = [...new Set(preferences.map(p => p.courseId))];
    
    // Build matrix: for each pair of courses, count students enrolled in both at the same time
    const matrix: { [key: string]: { 
      course1: string; 
      course2: string; 
      sharedStudents: Set<string>;
      timeSlots: { day: string; time: string; students: string[] }[];
    } } = {};

    // Group preferences by student
    const studentPrefs: { [email: string]: any[] } = {};
    preferences.forEach(pref => {
      if (!studentPrefs[pref.studentEmail]) {
        studentPrefs[pref.studentEmail] = [];
      }
      studentPrefs[pref.studentEmail].push(pref);
    });

    // For each student, find course pairs that have time conflicts
    Object.entries(studentPrefs).forEach(([email, prefs]) => {
      for (let i = 0; i < prefs.length; i++) {
        for (let j = i + 1; j < prefs.length; j++) {
          const pref1 = prefs[i];
          const pref2 = prefs[j];
          
          // Check if they have the same day AND time
          if (pref1.dayPreference === pref2.dayPreference && 
              pref1.timePreference === pref2.timePreference) {
            const course1 = pref1.courseId;
            const course2 = pref2.courseId;
            const pairKey = [course1, course2].sort().join('::');
            
            if (!matrix[pairKey]) {
              matrix[pairKey] = {
                course1,
                course2,
                sharedStudents: new Set(),
                timeSlots: [],
              };
            }
            
            matrix[pairKey].sharedStudents.add(email);
            
            // Add time slot info
            const timeSlotKey = `${pref1.dayPreference}-${pref1.timePreference}`;
            const existingSlot = matrix[pairKey].timeSlots.find(
              ts => ts.day === pref1.dayPreference && ts.time === pref1.timePreference
            );
            
            if (existingSlot) {
              if (!existingSlot.students.includes(email)) {
                existingSlot.students.push(email);
              }
            } else {
              matrix[pairKey].timeSlots.push({
                day: pref1.dayPreference,
                time: pref1.timePreference,
                students: [email],
              });
            }
          }
        }
      }
    });

    // Convert to array and sort by number of shared students
    return Object.values(matrix)
      .map(item => ({
        ...item,
        sharedCount: item.sharedStudents.size,
      }))
      .sort((a, b) => b.sharedCount - a.sharedCount);
  };

  const overlapMatrix = buildOverlapMatrix();

  // Export Overlap Matrix Report
  const exportOverlapMatrixReport = () => {
    if (overlapMatrix.length === 0) {
      toast.error('No overlapping enrollments found to export');
      return;
    }

    let csvContent = 'CIHE PRE-ENROLMENT SYSTEM - COURSE OVERLAP MATRIX REPORT\\n';
    csvContent += `Generated: ${new Date().toLocaleString()}\\n\\n`;
    csvContent += '================================================================================\\n';
    csvContent += 'STUDENTS ENROLLED IN MULTIPLE COURSES AT THE SAME TIME\\n';
    csvContent += '================================================================================\\n\\n';
    csvContent += 'This report identifies course pairs where students are enrolled in both courses\\n';
    csvContent += 'at the same time, creating scheduling conflicts.\\n\\n';

    overlapMatrix.forEach((overlap, index) => {
      const course1Details = getCourseDetails(overlap.course1);
      const course2Details = getCourseDetails(overlap.course2);
      
      csvContent += `\\n${index + 1}. COURSE PAIR CONFLICT:\\n`;
      csvContent += `   Course 1: ${course1Details.name} (${course1Details.unitCode})\\n`;
      csvContent += `   Course 2: ${course2Details.name} (${course2Details.unitCode})\\n`;
      csvContent += `   Total Students Affected: ${overlap.sharedCount}\\n`;
      csvContent += '--------------------------------------------------------------------------------\\n';
      
      // Time slots breakdown
      overlap.timeSlots.forEach(slot => {
        csvContent += `\\n   Time Slot: ${slot.day} at ${slot.time}\\n`;
        csvContent += `   Students Enrolled in Both Courses:\\n`;
        csvContent += '   Student Name,CIHE ID,Email\\n';
        
        slot.students.forEach(email => {
          const userDetails = getUserDetails(email);
          csvContent += `   \"${userDetails.name}\",${userDetails.ciheId},${email}\\n`;
        });
      });
      
      csvContent += '\\n';
    });

    // Summary
    csvContent += '\\n================================================================================\\n';
    csvContent += 'SUMMARY\\n';
    csvContent += '================================================================================\\n';
    csvContent += 'Course 1,Unit Code 1,Course 2,Unit Code 2,Students Affected,Time Slots\\n';
    overlapMatrix.forEach(overlap => {
      const course1Details = getCourseDetails(overlap.course1);
      const course2Details = getCourseDetails(overlap.course2);
      const timeSlotSummary = overlap.timeSlots.map(ts => `${ts.day} ${ts.time}`).join('; ');
      csvContent += `\"${course1Details.name}\",${course1Details.unitCode},\"${course2Details.name}\",${course2Details.unitCode},${overlap.sharedCount},\"${timeSlotSummary}\"\\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overlap-matrix-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Overlap Matrix report downloaded successfully!');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-gray-500 text-center">Loading conflict analysis...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Time & Date Conflict Analysis</CardTitle>
              <CardDescription>
                Identify courses with overlapping schedules based on student preferences
              </CardDescription>
            </div>
            {highConflicts.length > 0 && (
              <Badge variant="destructive" className="text-lg px-4 py-2">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {highConflicts.length} Conflict{highConflicts.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* All Time Slot Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Time Slot Breakdown</CardTitle>
          <CardDescription>
            All time slots with student preferences, showing potential conflicts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {conflicts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No student preferences submitted yet</p>
          ) : (
            <div className="space-y-6">
              {conflicts.map((slot, index) => (
                <div
                  key={`${slot.day}-${slot.time}-${index}`}
                  className={`border rounded-lg p-5 ${
                    slot.hasConflict ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  {/* Time Slot Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <Calendar className={`h-5 w-5 ${slot.hasConflict ? 'text-red-600' : 'text-gray-600'}`} />
                        <h3 className={`text-lg ${slot.hasConflict ? 'text-red-900' : 'text-gray-900'}`}>
                          {slot.day}
                        </h3>
                        <span className="text-gray-400">|</span>
                        <Clock className={`h-5 w-5 ${slot.hasConflict ? 'text-red-600' : 'text-gray-600'}`} />
                        <span className={slot.hasConflict ? 'text-red-900' : 'text-gray-900'}>
                          {slot.time}
                        </span>
                      </div>
                      <p className={slot.hasConflict ? 'text-red-700' : 'text-gray-600'}>
                        {slot.courseCount} course{slot.courseCount !== 1 ? 's' : ''} · {slot.totalStudents} student{slot.totalStudents !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {slot.hasConflict && (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Schedule Conflict
                      </Badge>
                    )}
                  </div>

                  {/* Courses in This Time Slot */}
                  <div className="space-y-3">
                    {slot.courses.map((course, courseIdx) => (
                      <div
                        key={`${course.courseId}-${courseIdx}`}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-gray-900">{course.name}</h4>
                              <Badge variant="outline">{course.unitCode}</Badge>
                            </div>
                          </div>
                          <Badge className="bg-blue-600">
                            <Users className="h-3 w-3 mr-1" />
                            {course.studentCount} Student{course.studentCount !== 1 ? 's' : ''}
                          </Badge>
                        </div>

                        {/* Students List */}
                        <div className="space-y-2">
                          <p className="text-gray-700 mb-2">Students:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {course.students.map((student, studentIdx) => (
                              <div
                                key={`${student.email}-${studentIdx}`}
                                className="bg-gray-50 border border-gray-200 rounded p-2"
                              >
                                <p className="text-gray-900">{student.name}</p>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {student.ciheId}
                                  </Badge>
                                  <span className="text-gray-500 text-xs">{student.email}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Conflict Warning */}
                  {slot.hasConflict && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-red-900 mb-1">
                            <strong>Scheduling Conflict Detected!</strong>
                          </p>
                          <p className="text-red-800">
                            {slot.courseCount} different courses are scheduled for the same time slot ({slot.day} at {slot.time}).
                            This affects {slot.totalStudents} student{slot.totalStudents !== 1 ? 's' : ''} total.
                            Consider adjusting course schedules to avoid conflicts.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overlap Matrix Report */}
      <Card>
        <CardHeader>
          <CardTitle>Overlap Matrix Report</CardTitle>
          <CardDescription>
            Identify course pairs with overlapping enrollments and download a detailed report
          </CardDescription>
        </CardHeader>
        <CardContent>
          {overlapMatrix.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No overlapping enrollments found</p>
          ) : (
            <div className="space-y-6">
              {overlapMatrix.map((overlap, index) => (
                <div
                  key={`${overlap.course1}-${overlap.course2}-${index}`}
                  className={`border rounded-lg p-5 ${
                    overlap.sharedCount > 0 ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  {/* Course Pair Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <AlertTriangle className={`h-5 w-5 ${overlap.sharedCount > 0 ? 'text-red-600' : 'text-gray-600'}`} />
                        <h3 className={`text-lg ${overlap.sharedCount > 0 ? 'text-red-900' : 'text-gray-900'}`}>
                          Course Pair Conflict
                        </h3>
                      </div>
                      <p className={overlap.sharedCount > 0 ? 'text-red-700' : 'text-gray-600'}>
                        {overlap.sharedCount} student{overlap.sharedCount !== 1 ? 's' : ''} enrolled in both courses
                      </p>
                    </div>
                    {overlap.sharedCount > 0 && (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Schedule Conflict
                      </Badge>
                    )}
                  </div>

                  {/* Courses in This Time Slot */}
                  <div className="space-y-3">
                    {overlap.timeSlots.map((slot, slotIdx) => (
                      <div
                        key={`${slot.day}-${slot.time}-${slotIdx}`}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-gray-900">{slot.day} at {slot.time}</h4>
                            </div>
                          </div>
                          <Badge className="bg-blue-600">
                            <Users className="h-3 w-3 mr-1" />
                            {slot.students.length} Student{slot.students.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>

                        {/* Students List */}
                        <div className="space-y-2">
                          <p className="text-gray-700 mb-2">Students:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {slot.students.map((email, studentIdx) => {
                              const student = getUserDetails(email);
                              return (
                                <div
                                  key={`${email}-${studentIdx}`}
                                  className="bg-gray-50 border border-gray-200 rounded p-2"
                                >
                                  <p className="text-gray-900">{student.name}</p>
                                  <div className="flex gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {student.ciheId}
                                    </Badge>
                                    <span className="text-gray-500 text-xs">{email}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Conflict Warning */}
                  {overlap.sharedCount > 0 && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-red-900 mb-1">
                            <strong>Scheduling Conflict Detected!</strong>
                          </p>
                          <p className="text-red-800">
                            {overlap.sharedCount} student{overlap.sharedCount !== 1 ? 's' : ''} are enrolled in both courses at the same time.
                            Consider adjusting course schedules to avoid conflicts.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={exportOverlapMatrixReport}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Overlap Matrix Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}