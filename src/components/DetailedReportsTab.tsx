import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Download, AlertCircle, Users, BookOpen } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DetailedReportsTabProps {
  overlapData: any;
  statistics: any[];
  preferences: any[];
  loading: boolean;
  onGenerateReport: () => void;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#f97316', '#14b8a6'];

export function DetailedReportsTab({ 
  overlapData, 
  statistics, 
  preferences,
  loading, 
  onGenerateReport 
}: DetailedReportsTabProps) {
  // Report Type 1: Group students by individual course
  const generateSameCourseReport = () => {
    const courseGroups: { [courseId: string]: any[] } = {};
    
    preferences.forEach(pref => {
      if (!courseGroups[pref.courseId]) {
        courseGroups[pref.courseId] = [];
      }
      courseGroups[pref.courseId].push(pref);
    });
    
    return Object.entries(courseGroups)
      .filter(([_, students]) => students.length > 0)
      .map(([courseId, students]) => {
        const stat = statistics.find(s => s.unitCode === courseId);
        return {
          courseId,
          courseName: stat?.courseName || courseId,
          unitCode: stat?.unitCode || courseId,
          students: students.map(s => ({
            email: s.studentEmail,
            timePreference: s.timePreference,
            dayPreference: s.dayPreference,
            status: s.status,
            submittedAt: s.submittedAt
          })),
          totalStudents: students.length,
          approved: students.filter(s => s.status === 'approved').length,
          pending: students.filter(s => s.status === 'pending').length,
          rejected: students.filter(s => s.status === 'rejected').length
        };
      })
      .sort((a, b) => b.totalStudents - a.totalStudents);
  };
  
  // Report Type 2: Find students enrolled in same 2 courses
  const generateSameTwoCoursesReport = () => {
    // Group preferences by student
    const studentCourses: { [email: string]: any[] } = {};
    
    preferences.forEach(pref => {
      if (!studentCourses[pref.studentEmail]) {
        studentCourses[pref.studentEmail] = [];
      }
      studentCourses[pref.studentEmail].push(pref);
    });
    
    // Find course pairs
    const coursePairs: { [key: string]: Set<string> } = {};
    
    Object.entries(studentCourses).forEach(([email, courses]) => {
      // For each pair of courses this student has
      for (let i = 0; i < courses.length; i++) {
        for (let j = i + 1; j < courses.length; j++) {
          const course1 = courses[i].courseId;
          const course2 = courses[j].courseId;
          
          // Create consistent key (alphabetically sorted)
          const pairKey = [course1, course2].sort().join('::');
          
          if (!coursePairs[pairKey]) {
            coursePairs[pairKey] = new Set();
          }
          coursePairs[pairKey].add(email);
        }
      }
    });
    
    // Convert to array and filter pairs with multiple students
    return Object.entries(coursePairs)
      .filter(([_, students]) => students.size > 1)
      .map(([pairKey, studentSet]) => {
        const [course1Id, course2Id] = pairKey.split('::');
        const stat1 = statistics.find(s => s.unitCode === course1Id);
        const stat2 = statistics.find(s => s.unitCode === course2Id);
        
        const students = Array.from(studentSet).map(email => {
          const course1Pref = preferences.find(p => p.studentEmail === email && p.courseId === course1Id);
          const course2Pref = preferences.find(p => p.studentEmail === email && p.courseId === course2Id);
          
          return {
            email,
            course1Status: course1Pref?.status || 'unknown',
            course2Status: course2Pref?.status || 'unknown',
            course1Time: course1Pref?.timePreference || 'N/A',
            course2Time: course2Pref?.timePreference || 'N/A',
            course1Day: course1Pref?.dayPreference || 'N/A',
            course2Day: course2Pref?.dayPreference || 'N/A'
          };
        });
        
        return {
          course1: {
            id: course1Id,
            name: stat1?.courseName || course1Id,
            unitCode: stat1?.unitCode || course1Id
          },
          course2: {
            id: course2Id,
            name: stat2?.courseName || course2Id,
            unitCode: stat2?.unitCode || course2Id
          },
          students,
          totalStudents: students.length
        };
      })
      .sort((a, b) => b.totalStudents - a.totalStudents);
  };

  const sameCourseData = generateSameCourseReport();
  const sameTwoCoursesData = generateSameTwoCoursesReport();

  // Get user details from localStorage
  const getUserDetails = (email: string) => {
    const users = JSON.parse(localStorage.getItem('cihe_users') || '[]');
    const user = users.find((u: any) => u.email === email);
    return {
      name: user?.name || email,
      ciheId: user?.ciheId || 'N/A'
    };
  };

  return (
    <div className="space-y-6">
      {/* Header with Download Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 mb-1">Enrollment Reports</h2>
          <p className="text-gray-500">Two types of comprehensive enrollment analysis</p>
        </div>
        <Button onClick={onGenerateReport} className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Download Full Report (CSV)
        </Button>
      </div>

      {/* Report Type 1: Students Enrolled in Same Course */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <CardTitle>Report Type 1: Students Enrolled in Same Course</CardTitle>
          </div>
          <CardDescription>
            Lists all students enrolled in each course (regardless of time or day preference)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : sameCourseData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No enrollment data available</p>
          ) : (
            <div className="space-y-6">
              {sameCourseData.map((course, index) => (
                <div key={`course-${course.courseId}-${index}`} className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-gray-900 mb-2">{course.courseName}</h3>
                      <Badge variant="outline" className="text-blue-600 border-blue-300">{course.unitCode}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 mb-1">Total Students</p>
                      <p className="text-blue-700">{course.totalStudents}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <Badge className="bg-green-500">
                      Approved: {course.approved}
                    </Badge>
                    <Badge className="bg-orange-500">
                      Pending: {course.pending}
                    </Badge>
                    {course.rejected > 0 && (
                      <Badge className="bg-red-500">
                        Rejected: {course.rejected}
                      </Badge>
                    )}
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-700 mb-3">Enrolled Students:</p>
                    <div className="space-y-2">
                      {course.students.map((student: any, idx: number) => {
                        const userDetails = getUserDetails(student.email);
                        return (
                          <div key={`${student.email}-${idx}`} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                            <div className="flex-1">
                              <p className="text-gray-900">{userDetails.name}</p>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                <Badge variant="outline" className="text-blue-600">
                                  {userDetails.ciheId}
                                </Badge>
                                <span className="text-gray-500 text-sm">{student.email}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <Badge variant="outline" className="text-purple-600">
                                {student.dayPreference || 'N/A'} - {student.timePreference}
                              </Badge>
                              <Badge variant={
                                student.status === 'approved' ? 'default' : 
                                student.status === 'pending' ? 'secondary' : 'destructive'
                              }>
                                {student.status}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Type 2: Students Enrolled in Same Two Courses */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            <CardTitle>Report Type 2: Students Enrolled in Same Two Courses</CardTitle>
          </div>
          <CardDescription>
            Shows course pair combinations where multiple students are enrolled in both courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : sameTwoCoursesData.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-900 mb-1">No Course Pair Overlaps Found</p>
              <p className="text-gray-500">No students are currently enrolled in the same two courses</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sameTwoCoursesData.map((pair, index) => (
                <div key={`pair-${pair.course1.id}-${pair.course2.id}-${index}`} className="border rounded-lg p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-gray-900 mb-3">Course Pair Combination</h3>
                      <div className="flex gap-3 items-center flex-wrap">
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <p className="text-gray-900">{pair.course1.name}</p>
                          <Badge variant="outline" className="mt-1 text-purple-600 border-purple-300">
                            {pair.course1.unitCode}
                          </Badge>
                        </div>
                        <span className="text-gray-500">+</span>
                        <div className="bg-white rounded-lg p-3 border border-pink-200">
                          <p className="text-gray-900">{pair.course2.name}</p>
                          <Badge variant="outline" className="mt-1 text-pink-600 border-pink-300">
                            {pair.course2.unitCode}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 mb-1">Shared Students</p>
                      <p className="text-purple-700">{pair.totalStudents}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-700 mb-3">Students enrolled in both courses:</p>
                    <div className="space-y-3">
                      {pair.students.map((student: any, idx: number) => {
                        const userDetails = getUserDetails(student.email);
                        return (
                          <div key={`${student.email}-pair-${idx}`} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="text-gray-900">{userDetails.name}</p>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline" className="text-blue-600">
                                    {userDetails.ciheId}
                                  </Badge>
                                  <span className="text-gray-500 text-sm">{student.email}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-3">
                              <div className="bg-purple-50 border border-purple-200 rounded p-3">
                                <p className="text-purple-900 mb-2">{pair.course1.unitCode}</p>
                                <div className="flex gap-2 flex-wrap">
                                  <Badge variant="outline" className="text-purple-600">
                                    {student.course1Day} - {student.course1Time}
                                  </Badge>
                                  <Badge variant={
                                    student.course1Status === 'approved' ? 'default' : 
                                    student.course1Status === 'pending' ? 'secondary' : 'destructive'
                                  }>
                                    {student.course1Status}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="bg-pink-50 border border-pink-200 rounded p-3">
                                <p className="text-pink-900 mb-2">{pair.course2.unitCode}</p>
                                <div className="flex gap-2 flex-wrap">
                                  <Badge variant="outline" className="text-pink-600">
                                    {student.course2Day} - {student.course2Time}
                                  </Badge>
                                  <Badge variant={
                                    student.course2Status === 'approved' ? 'default' : 
                                    student.course2Status === 'pending' ? 'secondary' : 'destructive'
                                  }>
                                    {student.course2Status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {pair.totalStudents > 5 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-700 mt-0.5" />
                      <div className="text-yellow-800">
                        <p className="font-medium">High Enrollment Alert</p>
                        <p className="text-sm">{pair.totalStudents} students are taking both courses. Consider coordination between course schedules.</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}