import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DashboardHeader } from './DashboardHeader';
import { 
  Clock, 
  BookOpen,
  Plus,
  Calendar,
  Trash2
} from 'lucide-react';
import { mockApi } from '../utils/mockApi';
import { toast } from 'sonner@2.0.3';

interface StudentDashboardProps {
  user: any;
  onLogout: () => void;
}

// Predefined courses with their unit codes and semester - CIHE Bachelor of IT
const AVAILABLE_COURSES = [
  // Semester 1
  { name: 'Introduction to Information Technology', unitCode: 'ICT101', semester: '1', isElective: false, prerequisite: '' },
  { name: 'Programming', unitCode: 'ICT103', semester: '1', isElective: false, prerequisite: '' },
  { name: 'Business Communication', unitCode: 'BUS101', semester: '1', isElective: false, prerequisite: '' },
  { name: 'Management Principles and Operations', unitCode: 'BUS112', semester: '1', isElective: false, prerequisite: '' },
  
  // Semester 2
  { name: 'Business Ethics in Digital Age', unitCode: 'BUS108', semester: '2', isElective: false, prerequisite: '' },
  { name: 'Fundamentals of Computability', unitCode: 'ICT104', semester: '2', isElective: false, prerequisite: 'ICT103 Programming' },
  { name: 'Networking', unitCode: 'ICT102', semester: '2', isElective: false, prerequisite: '' },
  { name: 'Database Systems', unitCode: 'ICT201', semester: '2', isElective: false, prerequisite: 'ICT103 Programming' },
  
  // Semester 3
  { name: 'Cloud Computing', unitCode: 'ICT202', semester: '3', isElective: false, prerequisite: '' },
  { name: 'Web Application Development', unitCode: 'ICT203', semester: '3', isElective: false, prerequisite: 'ICT103 Programming' },
  { name: 'Software Engineering', unitCode: 'ICT206', semester: '3', isElective: false, prerequisite: 'ICT103 Programming' },
  { name: 'Algorithms and Data Structures', unitCode: 'ICT208', semester: '3', isElective: false, prerequisite: 'ICT104 Fundamentals of Computability' },
  
  // Semester 4
  { name: 'Mobile Application Development', unitCode: 'ICT205', semester: '4', isElective: false, prerequisite: 'ICT203 Web Application Development' },
  { name: 'Cyber Security', unitCode: 'ICT204', semester: '4', isElective: false, prerequisite: 'ICT102 Networking' },
  { name: 'Information Technology Project Management', unitCode: 'ICT301', semester: '4', isElective: false, prerequisite: 'BUS112 Management Principles and Operations' },
  
  // Semester 5
  { name: 'Big Data', unitCode: 'ICT303', semester: '5', isElective: false, prerequisite: 'ICT208 Algorithms and Data Structures' },
  { name: 'Information Technology Governance, Risk and Compliance', unitCode: 'ICT309', semester: '5', isElective: false, prerequisite: 'ICT301 Information Technology Project Management' },
  { name: 'Project 1 (Analysis and Design)', unitCode: 'ICT307', semester: '5', isElective: false, prerequisite: 'ICT206 Software Engineering' },
  { name: 'Topics in IT', unitCode: 'ICT305', semester: '5', isElective: false, prerequisite: '' },
  
  // Semester 6
  { name: 'Work Integrated Learning (Internship)', unitCode: 'BUS306', semester: '6', isElective: false, prerequisite: '' },
  { name: 'Advanced Cyber Security', unitCode: 'ICT306', semester: '6', isElective: false, prerequisite: 'ICT204 Cyber Security' },
  { name: 'Project 2 (Programming and Testing)', unitCode: 'ICT308', semester: '6', isElective: false, prerequisite: 'ICT307 Project 1 (Analysis and Design)' },
  { name: 'Information Technology Services Management', unitCode: 'ICT310', semester: '6', isElective: false, prerequisite: 'ICT301 Information Technology Project Management' },
  
  // Available Elective Options (can be selected in Semester 4, 5, or 6)
  { name: 'Managing People and Culture', unitCode: 'BUS206', semester: '4,5,6', isElective: true, prerequisite: '' },
  { name: 'Knowledge Management', unitCode: 'ICT207', semester: '4,5,6', isElective: true, prerequisite: '' },
  { name: 'The Digital Economy', unitCode: 'BUS301', semester: '4,5,6', isElective: true, prerequisite: '' },
  { name: 'Work-Integrated Learning (Internship)', unitCode: 'BUS307', semester: '4,5,6', isElective: true, prerequisite: '' },
  { name: 'Distributed Computing', unitCode: 'ICT304', semester: '4,5,6', isElective: true, prerequisite: '' },
  { name: 'Secure Software Development', unitCode: 'ICT302', semester: '4,5,6', isElective: true, prerequisite: '' },
  { name: 'Software Defined Networks', unitCode: 'ICT311', semester: '4,5,6', isElective: true, prerequisite: '' },
  { name: 'Advanced Topics in Web Development', unitCode: 'ICT312', semester: '4,5,6', isElective: true, prerequisite: '' },
];

export function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const [preferences, setPreferences] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [dayPreference, setDayPreference] = useState('');
  const [timePreference, setTimePreference] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch courses
      const coursesData = await mockApi.getCourses();
      setCourses(coursesData.courses || []);

      // Fetch student preferences
      const preferencesData = await mockApi.getPreferences(user.email);
      setPreferences(preferencesData.preferences || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPreference = async () => {
    if (!selectedCourse || !timePreference || !dayPreference) {
      toast.error('Please select a course, day, and time preference');
      return;
    }

    // Check if preference already exists
    const existingPreference = preferences.find(p => p.courseId === selectedCourse);
    if (existingPreference) {
      toast.error('You have already submitted a preference for this course');
      return;
    }

    setSubmitting(true);
    try {
      await mockApi.submitPreference(
        user.email,
        selectedCourse,
        timePreference,
        dayPreference
      );

      toast.success('Course preference submitted successfully');
      setDialogOpen(false);
      setSelectedSemester('');
      setSelectedCourse('');
      setTimePreference('');
      setDayPreference('');
      fetchData();
    } catch (error) {
      console.error('Error submitting preference:', error);
      toast.error('Failed to submit preference');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter courses based on selected semester
  const getFilteredCourses = () => {
    if (!selectedSemester) return [];
    // Filter from AVAILABLE_COURSES (predefined CIHE courses) based on semester
    return AVAILABLE_COURSES.filter(course => {
      // For electives, they can be in multiple semesters (e.g., "4,5,6")
      if (course.semester.includes(',')) {
        return course.semester.split(',').includes(selectedSemester);
      }
      return course.semester === selectedSemester;
    });
  };

  // Handle semester change
  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester);
    setSelectedCourse(''); // Reset course selection when semester changes
  };

  const getCourseName = (courseId: string) => {
    // Try to find by ID first, then by unitCode
    let course = courses.find(c => c.id === courseId);
    if (!course) {
      course = courses.find(c => c.unitCode === courseId);
    }
    if (!course) {
      // Fallback to AVAILABLE_COURSES to get the name
      const availableCourse = AVAILABLE_COURSES.find(c => c.unitCode === courseId);
      return availableCourse ? availableCourse.name : courseId;
    }
    return course.name;
  };

  const getCourseUnitCode = (courseId: string) => {
    // Try to find by ID first, then by unitCode
    let course = courses.find(c => c.id === courseId);
    if (!course) {
      course = courses.find(c => c.unitCode === courseId);
    }
    // If still not found, check if courseId itself is already a unit code
    if (!course) {
      const availableCourse = AVAILABLE_COURSES.find(c => c.unitCode === courseId);
      return availableCourse ? availableCourse.unitCode : courseId;
    }
    return course.unitCode || courseId;
  };

  const handleDeletePreference = async (preferenceId: string) => {
    if (!confirm('Are you sure you want to remove this course preference?')) {
      return;
    }

    try {
      await mockApi.deletePreference(preferenceId);
      toast.success('Course preference removed successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove preference');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Dashboard Header */}
      <DashboardHeader user={user} onLogout={onLogout} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Total Preferences</CardTitle>
              <BookOpen className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-blue-900">{preferences.length}</div>
              <p className="text-gray-500 mt-1">Course recommendations submitted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Available Courses</CardTitle>
              <BookOpen className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-green-700">{courses.length}</div>
              <p className="text-gray-500 mt-1">Courses to choose from</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Course Preference */}
        <div className="mb-6">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Course Preference
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Course Preference</DialogTitle>
                <DialogDescription>
                  Choose a course and your preferred time slot
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* 1. Semester Selection - FIRST */}
                <div className="space-y-2">
                  <Label>Semester <span className="text-red-500">*</span></Label>
                  <Select value={selectedSemester} onValueChange={handleSemesterChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester first" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                      <SelectItem value="3">Semester 3</SelectItem>
                      <SelectItem value="4">Semester 4</SelectItem>
                      <SelectItem value="5">Semester 5</SelectItem>
                      <SelectItem value="6">Semester 6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Course Selection - SECOND (disabled until semester selected) */}
                <div className="space-y-2">
                  <Label>Course <span className="text-red-500">*</span></Label>
                  <Select 
                    value={selectedCourse} 
                    onValueChange={setSelectedCourse}
                    disabled={!selectedSemester}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedSemester ? "Select a course" : "Select semester first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredCourses().map((course, index) => (
                        <SelectItem key={`${course.unitCode}-${index}`} value={course.unitCode}>
                          <div className="flex items-center gap-2">
                            <span>{course.unitCode} - {course.name}</span>
                            {course.isElective && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">ELECTIVE</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedSemester && getFilteredCourses().length === 0 && (
                    <p className="text-xs text-amber-600">No courses available for this semester</p>
                  )}
                  {/* Show prerequisite note when course is selected */}
                  {selectedCourse && (() => {
                    const course = AVAILABLE_COURSES.find(c => c.unitCode === selectedCourse);
                    return course && course.prerequisite ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Pre-requisite:</span> {course.prerequisite}
                        </p>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* 3. Day Preference - THIRD */}
                <div className="space-y-2">
                  <Label>Day Preference <span className="text-red-500">*</span></Label>
                  <Select value={dayPreference} onValueChange={setDayPreference}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 4. Time Preference - FOURTH */}
                <div className="space-y-2">
                  <Label>Time Preference <span className="text-red-500">*</span></Label>
                  <Select value={timePreference} onValueChange={setTimePreference}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8:15-11:15">8:15 AM - 11:15 AM</SelectItem>
                      <SelectItem value="11:30-14:30">11:30 AM - 2:30 PM</SelectItem>
                      <SelectItem value="14:45-17:45">2:45 PM - 5:45 PM</SelectItem>
                      <SelectItem value="18:00-21:00">6:00 PM - 9:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleSubmitPreference}
                  disabled={submitting || !selectedCourse || !timePreference || !dayPreference}
                >
                  {submitting ? 'Submitting...' : 'Submit Preference'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* My Course Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>My Course Preferences</CardTitle>
            <CardDescription>
              View your submitted course recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading...</p>
            ) : preferences.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No course preferences submitted yet. Click "Add Course Preference" to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {preferences.map((preference) => (
                  <div
                    key={preference.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-sm">{getCourseUnitCode(preference.courseId)}</Badge>
                          <h3 className="text-gray-900 font-medium">
                            {getCourseName(preference.courseId)}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{preference.dayPreference || 'N/A'}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{preference.timePreference}</span>
                          </div>
                          <span>•</span>
                          <span>
                            Submitted: {new Date(preference.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePreference(preference.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}