import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Edit, Trash2, Calendar, Clock, BookOpen } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { mockApi } from '../utils/mockApi';

interface CourseManagementProps {
  courses: any[];
  onRefresh: () => void;
}

const TIME_SLOTS = [
  { value: '8:15-11:15', label: '8:15 AM - 11:15 AM' },
  { value: '11:30-14:30', label: '11:30 AM - 2:30 PM' },
  { value: '14:45-17:45', label: '2:45 PM - 5:45 PM' },
  { value: '18:00-21:00', label: '6:00 PM - 9:00 PM' },
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Predefined courses with their unit codes and semester
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

export function CourseManagement({ courses, onRefresh }: CourseManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<any>(null);
  
  const [courseName, setCourseName] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [semester, setSemester] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setCourseName('');
    setUnitCode('');
    setSemester('');
    setDayOfWeek('');
    setTimeSlot('');
    setEditMode(false);
    setCurrentCourse(null);
  };

  // Handle semester change and reset course selection
  const handleSemesterChange = (newSemester: string) => {
    setSemester(newSemester);
    // Reset course selection when semester changes
    setCourseName('');
    setUnitCode('');
  };

  // Handle course selection and auto-assign unit code
  const handleCourseSelection = (selectedCourseName: string) => {
    setCourseName(selectedCourseName);
    const course = AVAILABLE_COURSES.find(c => c.name === selectedCourseName);
    if (course) {
      setUnitCode(course.unitCode);
    }
  };

  // Filter courses based on selected semester
  const getAvailableCourses = () => {
    if (!semester) return [];
    return AVAILABLE_COURSES.filter(course => {
      const semesters = course.semester.split(',');
      return semesters.includes(semester);
    });
  };

  const handleOpenDialog = (course?: any) => {
    if (course) {
      setEditMode(true);
      setCurrentCourse(course);
      setCourseName(course.name);
      setUnitCode(course.unitCode);
      setSemester(course.semester);
      setDayOfWeek(course.dayOfWeek);
      setTimeSlot(course.timeSlot);
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!courseName || !unitCode || !semester || !dayOfWeek || !timeSlot) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      if (editMode && currentCourse) {
        await mockApi.updateCourse(
          currentCourse.id,
          courseName,
          unitCode,
          semester,
          dayOfWeek,
          timeSlot
        );
        toast.success('Course updated successfully');
      } else {
        await mockApi.addCourse(
          courseName,
          unitCode,
          semester,
          dayOfWeek,
          timeSlot
        );
        toast.success('Course added successfully');
      }
      setDialogOpen(false);
      resetForm();
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await mockApi.deleteCourse(courseId);
      toast.success('Course deleted successfully');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete course');
    }
  };

  const getTimeSlotLabel = (value: string) => {
    const slot = TIME_SLOTS.find(s => s.value === value);
    return slot ? slot.label : value;
  };

  // Compact time slot display (shorter format)
  const getCompactTimeSlot = (value: string) => {
    const timeMap: { [key: string]: string } = {
      '8:15-11:15': '8:15-11:15',
      '11:30-14:30': '11:30-14:30',
      '14:45-17:45': '14:45-17:45',
      '18:00-21:00': '18:00-21:00',
    };
    return timeMap[value] || value;
  };

  // Compact day display
  const getCompactDay = (day: string) => {
    const dayMap: { [key: string]: string } = {
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
    };
    return dayMap[day] || day;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Course Management</CardTitle>
            <CardDescription>
              Add, edit, and manage course schedules
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editMode ? 'Edit Course' : 'Add New Course'}</DialogTitle>
                <DialogDescription>
                  {editMode ? 'Update course details and schedule' : 'Select semester first, then choose course, day and time'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* 1. Semester Selection - FIRST */}
                <div className="space-y-2">
                  <Label>Semester <span className="text-red-500">*</span></Label>
                  <Select value={semester} onValueChange={handleSemesterChange}>
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
                  <Label>Course Name <span className="text-red-500">*</span></Label>
                  <Select 
                    value={courseName} 
                    onValueChange={handleCourseSelection}
                    disabled={!semester}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={semester ? "Select course" : "Select semester first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableCourses().map((course) => (
                        <SelectItem key={course.unitCode} value={course.name}>
                          <div className="flex items-center gap-2">
                            <span>{course.name}</span>
                            {course.isElective && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">ELECTIVE</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {semester && getAvailableCourses().length === 0 && (
                    <p className="text-xs text-amber-600">No courses available for this semester</p>
                  )}
                  {/* Show prerequisite note when course is selected */}
                  {courseName && (() => {
                    const course = AVAILABLE_COURSES.find(c => c.name === courseName);
                    return course && course.prerequisite ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Pre-requisite:</span> {course.prerequisite}
                        </p>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Unit Code - Auto-assigned */}
                <div className="space-y-2">
                  <Label>Unit Code</Label>
                  <Input
                    placeholder="Automatically assigned"
                    value={unitCode}
                    readOnly
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    Automatically assigned based on course selection
                  </p>
                </div>

                {/* 3. Day Preference - THIRD */}
                <div className="space-y-2">
                  <Label>Day of Week <span className="text-red-500">*</span></Label>
                  <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 4. Time Preference - FOURTH */}
                <div className="space-y-2">
                  <Label>Time Slot <span className="text-red-500">*</span></Label>
                  <Select value={timeSlot} onValueChange={setTimeSlot}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={submitting || !courseName || !unitCode || !semester || !dayOfWeek || !timeSlot}
                >
                  {submitting ? (editMode ? 'Updating...' : 'Adding...') : (editMode ? 'Update Course' : 'Add Course')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-900 mb-1">No Courses Added</p>
            <p className="text-gray-500">Click "Add Course" to create your first course</p>
          </div>
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] text-xs">Unit Code</TableHead>
                  <TableHead className="min-w-[200px] text-xs">Course Name</TableHead>
                  <TableHead className="w-[90px] text-xs">Semester</TableHead>
                  <TableHead className="w-[90px] text-xs">Day</TableHead>
                  <TableHead className="w-[130px] text-xs">Time Slot</TableHead>
                  <TableHead className="w-[80px] text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="py-2.5">
                      <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0.5">{course.unitCode}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-xs py-2.5 leading-tight">{course.name}</TableCell>
                    <TableCell className="py-2.5">
                      <Badge className="text-[10px] px-1.5 py-0.5">Sem {course.semester}</Badge>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-[11px] whitespace-nowrap">{getCompactDay(course.dayOfWeek)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-[10px] whitespace-nowrap font-mono leading-tight">{getCompactTimeSlot(course.timeSlot)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex gap-0.5 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(course)}
                          className="h-6 w-6 p-0"
                          title="Edit course"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                          onClick={() => handleDelete(course.id)}
                          title="Delete course"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}