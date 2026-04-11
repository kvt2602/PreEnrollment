import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search, Download, Users, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

interface StudentManagementProps {
  students: any[];
  enrollments: any[];
  units: any[];
}

type SortField = 'name' | 'enrolled';
type SortDir = 'asc' | 'desc';

export function StudentManagement({ students, enrollments, units }: StudentManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

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

  // Summary stats
  const totalStudents = students.length;

  // Sort toggle helper
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 text-slate-400" />;
    return sortDir === 'asc'
      ? <ArrowUp className="h-3 w-3 ml-1 text-blue-600" />
      : <ArrowDown className="h-3 w-3 ml-1 text-blue-600" />;
  };

  const filteredStudents = students
    .filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.ciheId?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === 'name') {
        return sortDir === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      // enrolled
      const aCount = getStudentEnrollments(a.email).length;
      const bCount = getStudentEnrollments(b.email).length;
      return sortDir === 'asc' ? aCount - bCount : bCount - aCount;
    });

  const getEnrollmentStatus = (count: number) => {
    if (count === 0) return { label: 'No Units', className: 'bg-red-100 text-red-700 border border-red-200' };
    if (count <= 2) return { label: `${count} Unit${count > 1 ? 's' : ''}`, className: 'bg-amber-100 text-amber-700 border border-amber-200' };
    return { label: `${count} Units`, className: 'bg-green-100 text-green-700 border border-green-200' };
  };

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
    <div className="space-y-6">
      {/* Main table card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>View and search all registered students</CardDescription>
            </div>
            <Button
              onClick={exportStudentList}
              className="border border-blue-800/45 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white hover:brightness-110"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export List
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search + result count */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500 shrink-0" />
                <Input
                  placeholder="Search by name, email, or CIHE ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <p className="text-sm text-slate-500 shrink-0">
                Showing <span className="font-semibold text-slate-700">{filteredStudents.length}</span> of <span className="font-semibold text-slate-700">{totalStudents}</span> students
              </p>
            </div>

            {/* Student Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                      >
                        Name <SortIcon field="name" />
                      </button>
                    </TableHead>
                    <TableHead>CIHE ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('enrolled')}
                        className="flex items-center font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                      >
                        Status <SortIcon field="enrolled" />
                      </button>
                    </TableHead>
                    <TableHead>Units</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const studentEnrollments = getStudentEnrollments(student.email);
                    const status = getEnrollmentStatus(studentEnrollments.length);
                    return (
                      <TableRow key={student.email} className="hover:bg-slate-50/70">
                        <TableCell className="font-medium text-slate-900">{student.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">{student.ciheId}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">{student.email}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {studentEnrollments.slice(0, 3).map((enr, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs font-mono">
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

            {/* Empty state */}
            {filteredStudents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 text-slate-400">
                <Users className="h-10 w-10 mb-3 opacity-40" />
                <p className="font-medium text-slate-500">No students found</p>
                {searchTerm && (
                  <p className="text-sm mt-1">Try adjusting your search term</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}