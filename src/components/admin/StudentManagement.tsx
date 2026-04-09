import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search, Download } from 'lucide-react';
import { toast } from 'sonner';

interface StudentManagementProps {
  students: any[];
  enrollments: any[];
  units: any[];
}

export function StudentManagement({ students, enrollments, units }: StudentManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const getUnitName = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    return unit?.name || unitId;
  };
  
  const getUnitCode = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    return unit?.unitCode || unitId;
  };
  
  const getStudentEnrollments = (email: string) => {
    return enrollments.filter(e => e.studentEmail === email);
  };
  
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.ciheId?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const exportStudentList = () => {
    let csvContent = 'CIHE PRE-ENROLMENT SYSTEM - STUDENT LIST\\n';
    csvContent += `Generated: ${new Date().toLocaleString()}\\n\\n`;
    csvContent += 'Student Name,CIHE ID,Email,Role,Units Enrolled,Unit Details\\n';
    
    students.forEach(student => {
      const studentEnrollments = getStudentEnrollments(student.email);
      const unitDetails = studentEnrollments
        .map(e => `${getUnitCode(e.courseId)}: ${getUnitName(e.courseId)}`)
        .join(' | ');
      
      csvContent += `"${student.name}",${student.ciheId},${student.email},${student.role},${studentEnrollments.length},"${unitDetails}"\\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-list-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Student list exported successfully!');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Student Management</CardTitle>
            <CardDescription>View and search all registered students</CardDescription>
          </div>
          <Button onClick={exportStudentList} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export List
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name, email, or CIHE ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          
          {/* Student Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>CIHE ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Units Enrolled</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const studentEnrollments = getStudentEnrollments(student.email);
                  return (
                    <TableRow key={student.email}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.ciheId}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{student.email}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-600">{studentEnrollments.length}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {studentEnrollments.slice(0, 3).map((enr, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {getUnitCode(enr.courseId)}
                            </Badge>
                          ))}
                          {studentEnrollments.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{studentEnrollments.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {filteredStudents.length === 0 && (
            <p className="text-center text-gray-500 py-8">No students found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}