import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Download, FileText, Users, Calendar, TrendingUp, Grid, BookOpen, ListChecks, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

interface ReportsModuleProps {
  students: any[];
  units: any[];
  enrollments: any[];
}

export function ReportsModule({ students, units, enrollments }: ReportsModuleProps) {
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
  
  const getUserDetails = (email: string) => {
    const user = students.find(s => s.email === email);
    return {
      name: user?.name || email,
      ciheId: user?.ciheId || 'N/A',
      email,
    };
  };

  // REPORT 1: Student Enrollment Report
  const exportStudentEnrollmentReport = () => {
    let csvContent = '====================================================================\n';
    csvContent += 'CIHE PRE-ENROLMENT SYSTEM\n';
    csvContent += 'STUDENT ENROLLMENT REPORT\n';
    csvContent += '====================================================================\n';
    csvContent += `Report Generated: ${new Date().toLocaleString()}\n`;
    csvContent += `Academic Year: 2025-2026\n`;
    csvContent += `Total Students: ${students.length}\n`;
    csvContent += `Total Enrollments: ${enrollments.length}\n`;
    csvContent += '====================================================================\n\n';
    
    csvContent += 'DETAILED STUDENT ENROLLMENT LIST\n\n';
    
    students.forEach((student, index) => {
      const studentEnrollments = getStudentEnrollments(student.email);
      
      csvContent += `${index + 1}. STUDENT PROFILE\n`;
      csvContent += `${'='.repeat(70)}\n`;
      csvContent += `Full Name: ${student.name}\n`;
      csvContent += `CIHE ID: ${student.ciheId}\n`;
      csvContent += `Email: ${student.email}\n`;
      csvContent += `Total Units Enrolled: ${studentEnrollments.length}\n`;
      csvContent += `\n`;
      
      if (studentEnrollments.length > 0) {
        csvContent += `ENROLLED UNITS:\n`;
        csvContent += `${'-'.repeat(70)}\n`;
        csvContent += `Unit Code | Unit Name                                    | Day       | Time\n`;
        csvContent += `${'-'.repeat(70)}\n`;
        
        studentEnrollments.forEach(e => {
          const unitCode = getUnitCode(e.courseId).padEnd(9);
          const unitName = getUnitName(e.courseId).substring(0, 44).padEnd(44);
          const day = e.dayPreference.padEnd(9);
          const time = e.timePreference;
          csvContent += `${unitCode} | ${unitName} | ${day} | ${time}\n`;
        });
      } else {
        csvContent += `NO UNITS ENROLLED\n`;
      }
      csvContent += `\n\n`;
    });
    
    csvContent += '====================================================================\n';
    csvContent += 'SUMMARY STATISTICS\n';
    csvContent += '====================================================================\n';
    const avgUnits = (enrollments.length / students.length).toFixed(2);
    const maxUnits = Math.max(...students.map(s => getStudentEnrollments(s.email).length));
    const studentsWithNoEnrollments = students.filter(s => getStudentEnrollments(s.email).length === 0).length;
    
    csvContent += `Average Units per Student: ${avgUnits}\n`;
    csvContent += `Maximum Units by One Student: ${maxUnits}\n`;
    csvContent += `Students with No Enrollments: ${studentsWithNoEnrollments}\n`;
    csvContent += `Students with Enrollments: ${students.length - studentsWithNoEnrollments}\n`;
    csvContent += '====================================================================\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CIHE-Student-Enrollment-Report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Student Enrollment Report exported successfully!');
  };


  // REPORT 4: Unit Enrollment List (per unit roster + totals)
  const exportUnitEnrollmentList = () => {
    let csvContent = 'CIHE PRE-ENROLMENT SYSTEM - UNIT ENROLLMENT LIST\n';
    csvContent += `Generated: ${new Date().toLocaleString()}\n`;
    csvContent += `Total Units: ${units.length}\n`;
    csvContent += `Total Enrollments: ${enrollments.length}\n\n`;

    // Flat CSV section (machine-readable)
    csvContent += 'Unit Code,Unit Name,Student #,Student Name,CIHE ID,Email,Day,Time\n';
    units.forEach(unit => {
      const rows = enrollments.filter(e => e.courseId === unit.id);
      if (rows.length === 0) {
        csvContent += `${unit.unitCode},"${unit.name}",,,,,,\n`;
        return;
      }
      rows.forEach((e, idx) => {
        const u = getUserDetails(e.studentEmail);
        csvContent += `${unit.unitCode},"${unit.name}",${idx + 1},"${u.name}",${u.ciheId},${u.email},${e.dayPreference || ''},${e.timePreference || ''}\n`;
      });
    });

    csvContent += '\n\nUNIT TOTALS\nUnit Code,Unit Name,Students Enrolled\n';
    units
      .map(u => ({ u, c: enrollments.filter(e => e.courseId === u.id).length }))
      .sort((a, b) => b.c - a.c)
      .forEach(({ u, c }) => {
        csvContent += `${u.unitCode},"${u.name}",${c}\n`;
      });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CIHE-Unit-Enrollment-List-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Unit Enrollment List exported successfully!');
  };

  // REPORT 5: Student Attendance Days (distinct day count per student)
  const exportAttendanceDaysReport = () => {
    const rows = students.map(student => {
      const enr = enrollments.filter(e => e.studentEmail === student.email);
      const days = new Set<string>();
      enr.forEach(e => { if (e.dayPreference) days.add(e.dayPreference); });
      const distinct = days.size;
      let status: string;
      if (distinct === 0) status = 'No Enrollments';
      else if (distinct <= 2) status = 'OK (Target)';
      else if (distinct === 3) status = 'Acceptable';
      else status = 'Not Allowed (4+)';
      return {
        name: student.name,
        ciheId: student.ciheId || 'N/A',
        email: student.email,
        unitCount: enr.length,
        units: enr.map(e => getUnitCode(e.courseId)).join('; '),
        days: Array.from(days).join('; '),
        distinct,
        status,
      };
    }).sort((a, b) => b.distinct - a.distinct);

    let csvContent = 'CIHE PRE-ENROLMENT SYSTEM - STUDENT ATTENDANCE DAYS REPORT\n';
    csvContent += `Generated: ${new Date().toLocaleString()}\n`;
    csvContent += 'Target: 2 days/week  |  Acceptable: 3  |  Not Allowed: 4+\n\n';

    const summary = { ok: 0, accept: 0, bad: 0, none: 0 };
    rows.forEach(r => {
      if (r.distinct === 0) summary.none++;
      else if (r.distinct <= 2) summary.ok++;
      else if (r.distinct === 3) summary.accept++;
      else summary.bad++;
    });
    csvContent += `SUMMARY\nOK (<=2 days),${summary.ok}\nAcceptable (3 days),${summary.accept}\nNot Allowed (4+ days),${summary.bad}\nNo Enrollments,${summary.none}\n\n`;

    csvContent += 'Student Name,CIHE ID,Email,Units Enrolled,Unit Codes,Distinct Days,Days,Status\n';
    rows.forEach(r => {
      csvContent += `"${r.name}",${r.ciheId},${r.email},${r.unitCount},"${r.units}",${r.distinct},"${r.days}",${r.status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CIHE-Student-Attendance-Days-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Student Attendance Days report exported successfully!');
  };

  // Summary data
  const studentsWithMultipleUnits = students.filter(s => getStudentEnrollments(s.email).length >= 2);
  const unitStats = units.map(u => ({
    ...u,
    count: enrollments.filter(e => e.courseId === u.id).length,
  })).sort((a, b) => b.count - a.count);

  // Summary stats for cards
  const totalStudents = students.length;
  const totalEnrollments = enrollments.length;
  const multiUnitCount = studentsWithMultipleUnits.length;
  const topUnit = unitStats[0]?.unitCode ?? 'N/A';

  return (
    <div className="space-y-6">
      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total Students</p>
                <p className="mt-0.5 text-2xl font-semibold text-slate-900">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-50 p-2.5">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total Enrollments</p>
                <p className="mt-0.5 text-2xl font-semibold text-slate-900">{totalEnrollments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-50 p-2.5">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Multi-Unit Students</p>
                <p className="mt-0.5 text-2xl font-semibold text-slate-900">{multiUnitCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-50 p-2.5">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Most Popular Unit</p>
                <p className="mt-0.5 text-2xl font-semibold text-slate-900">{topUnit}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports Module</CardTitle>
          <CardDescription>Generate and export comprehensive enrollment reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Report 1 */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base">Student Enrollment Report</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Complete list of all students with their enrolled units
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p>• Student details</p>
                    <p>• Units enrolled per student</p>
                    <p>• Total unit count</p>
                  </div>
                  <Button
                    onClick={exportStudentEnrollmentReport}
                    className="w-full border border-blue-800/45 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white hover:brightness-110"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Report 2: Unit Enrollment List */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <ListChecks className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-base">Unit Enrollment List</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Per-unit student rosters plus enrolment totals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p>• Students enrolled in each unit</p>
                    <p>• Day &amp; time preferences</p>
                    <p>• Totals per unit (ranked)</p>
                  </div>
                  <Button
                    onClick={exportUnitEnrollmentList}
                    className="w-full border border-blue-800/45 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white hover:brightness-110"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Report 5: Student Attendance Days */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-base">Student Attendance Days</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Distinct campus days per student (target 2, max 3)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p>• Distinct day count per student</p>
                    <p>• Status: OK / Acceptable / Not Allowed</p>
                    <p>• Summary totals</p>
                  </div>
                  <Button
                    onClick={exportAttendanceDaysReport}
                    className="w-full border border-blue-800/45 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white hover:brightness-110"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Preview */}
          <Card className="mt-6 border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-base">Quick Preview: Top Enrolled Units</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Unit Code</TableHead>
                    <TableHead>Unit Name</TableHead>
                    <TableHead>Students</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unitStats.slice(0, 5).map((unit, index) => (
                    <TableRow key={unit.id}>
                      <TableCell className="font-medium">#{index + 1}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{unit.unitCode}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{unit.name}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-600">{unit.count}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}