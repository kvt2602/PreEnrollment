import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Download, FileText, Users, Calendar, TrendingUp, Grid, BookOpen } from 'lucide-react';
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

  // REPORT 2: Students with Multiple Units
  const exportMultipleUnitsReport = () => {
    const studentsWithMultipleUnits = students
      .map(student => ({
        ...student,
        enrollments: getStudentEnrollments(student.email),
      }))
      .filter(s => s.enrollments.length >= 2)
      .sort((a, b) => b.enrollments.length - a.enrollments.length);
    
    let csvContent = '====================================================================\n';
    csvContent += 'CIHE PRE-ENROLMENT SYSTEM\n';
    csvContent += 'STUDENTS WITH MULTIPLE UNIT ENROLLMENTS\n';
    csvContent += '====================================================================\n';
    csvContent += `Report Generated: ${new Date().toLocaleString()}\n`;
    csvContent += `Total Students with Multiple Units: ${studentsWithMultipleUnits.length}\n`;
    csvContent += '====================================================================\n\n';
    
    if (studentsWithMultipleUnits.length === 0) {
      csvContent += 'NO STUDENTS WITH MULTIPLE UNIT ENROLLMENTS FOUND\n';
    } else {
      csvContent += 'STUDENT LIST (Sorted by Number of Units - Highest First)\n\n';
      
      studentsWithMultipleUnits.forEach((student, index) => {
        csvContent += `${index + 1}. ${student.name}\n`;
        csvContent += `${'='.repeat(70)}\n`;
        csvContent += `CIHE ID: ${student.ciheId}\n`;
        csvContent += `Email: ${student.email}\n`;
        csvContent += `Total Units: ${student.enrollments.length}\n`;
        csvContent += `\n`;
        csvContent += `ENROLLED UNITS WITH SCHEDULE:\n`;
        csvContent += `${'-'.repeat(70)}\n`;
        
        student.enrollments.forEach((e, idx) => {
          csvContent += `  ${idx + 1}. [${getUnitCode(e.courseId)}] ${getUnitName(e.courseId)}\n`;
          csvContent += `     Schedule: ${e.dayPreference} at ${e.timePreference}\n`;
        });
        
        csvContent += `\n\n`;
      });
      
      csvContent += '====================================================================\n';
      csvContent += 'DISTRIBUTION ANALYSIS\n';
      csvContent += '====================================================================\n';
      const distribution = {};
      studentsWithMultipleUnits.forEach(s => {
        const count = s.enrollments.length;
        distribution[count] = (distribution[count] || 0) + 1;
      });
      
      Object.keys(distribution).sort((a, b) => b - a).forEach(count => {
        csvContent += `${count} units: ${distribution[count]} students\n`;
      });
    }
    
    csvContent += '====================================================================\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CIHE-Multiple-Units-Report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Multiple Units Report exported successfully!');
  };

  // REPORT 3: Unit Popularity Report
  const exportUnitPopularityReport = () => {
    const unitStats = units.map(unit => {
      const unitEnrollments = enrollments.filter(e => e.courseId === unit.id);
      const enrollmentCount = unitEnrollments.length;
      
      // Time slot analysis
      const timeSlotBreakdown = {
        '8:15-11:15': 0,
        '11:30-14:30': 0,
        '14:45-17:45': 0,
        '18:00-21:00': 0
      };
      
      // Day analysis
      const dayBreakdown = {
        'Monday': 0,
        'Tuesday': 0,
        'Wednesday': 0,
        'Thursday': 0,
        'Friday': 0
      };
      
      unitEnrollments.forEach(e => {
        if (timeSlotBreakdown[e.timePreference] !== undefined) {
          timeSlotBreakdown[e.timePreference]++;
        }
        if (dayBreakdown[e.dayPreference] !== undefined) {
          dayBreakdown[e.dayPreference]++;
        }
      });
      
      return {
        ...unit,
        enrollmentCount,
        timeSlotBreakdown,
        dayBreakdown,
        students: unitEnrollments.map(e => getUserDetails(e.studentEmail))
      };
    }).sort((a, b) => b.enrollmentCount - a.enrollmentCount);
    
    let csvContent = '====================================================================\n';
    csvContent += 'CIHE PRE-ENROLMENT SYSTEM\n';
    csvContent += 'UNIT POPULARITY & DEMAND ANALYSIS REPORT\n';
    csvContent += '====================================================================\n';
    csvContent += `Report Generated: ${new Date().toLocaleString()}\n`;
    csvContent += `Academic Year: 2025-2026\n`;
    csvContent += `Total Units Available: ${units.length}\n`;
    csvContent += `Total Student Enrollments: ${enrollments.length}\n`;
    csvContent += '====================================================================\n\n';
    
    const avgEnrollment = unitStats.reduce((sum, u) => sum + u.enrollmentCount, 0) / unitStats.length;
    
    csvContent += 'OVERALL STATISTICS\n';
    csvContent += `${'-'.repeat(70)}\n`;
    csvContent += `Average Enrollment per Unit: ${avgEnrollment.toFixed(2)} students\n`;
    csvContent += `Most Popular Unit: ${unitStats[0]?.unitCode} (${unitStats[0]?.enrollmentCount} students)\n`;
    csvContent += `Least Popular Unit: ${unitStats[unitStats.length - 1]?.unitCode} (${unitStats[unitStats.length - 1]?.enrollmentCount} students)\n`;
    csvContent += `\n\n`;
    
    csvContent += 'DETAILED UNIT ANALYSIS\n';
    csvContent += '====================================================================\n\n';
    
    unitStats.forEach((unit, index) => {
      const popularityLevel = unit.enrollmentCount > avgEnrollment ? '★★★ HIGH DEMAND' :
                             unit.enrollmentCount > 0 ? '★★ MEDIUM DEMAND' : '★ LOW DEMAND';
      
      csvContent += `${index + 1}. ${unit.unitCode} - ${unit.name}\n`;
      csvContent += `${'='.repeat(70)}\n`;
      csvContent += `Semester: ${unit.semester || 'N/A'}\n`;
      csvContent += `Total Students Enrolled: ${unit.enrollmentCount}\n`;
      csvContent += `Popularity Level: ${popularityLevel}\n`;
      csvContent += `Demand vs Average: ${unit.enrollmentCount > avgEnrollment ? '+' : ''}${(unit.enrollmentCount - avgEnrollment).toFixed(1)} students\n`;
      csvContent += `\n`;
      
      // Time Slot Preferences
      csvContent += `PREFERRED TIME SLOTS:\n`;
      csvContent += `${'-'.repeat(70)}\n`;
      Object.entries(unit.timeSlotBreakdown).forEach(([time, count]) => {
        const percentage = unit.enrollmentCount > 0 ? ((count / unit.enrollmentCount) * 100).toFixed(1) : '0.0';
        const bar = '█'.repeat(Math.round(count / 2)) || '-';
        csvContent += `  ${time.padEnd(15)} | ${String(count).padStart(3)} students (${percentage.padStart(5)}%) ${bar}\n`;
      });
      csvContent += `\n`;
      
      // Day Preferences
      csvContent += `PREFERRED DAYS:\n`;
      csvContent += `${'-'.repeat(70)}\n`;
      Object.entries(unit.dayBreakdown).forEach(([day, count]) => {
        const percentage = unit.enrollmentCount > 0 ? ((count / unit.enrollmentCount) * 100).toFixed(1) : '0.0';
        const bar = '█'.repeat(Math.round(count / 2)) || '-';
        csvContent += `  ${day.padEnd(12)} | ${String(count).padStart(3)} students (${percentage.padStart(5)}%) ${bar}\n`;
      });
      csvContent += `\n`;
      
      // List of Students
      if (unit.students.length > 0) {
        csvContent += `ENROLLED STUDENTS:\n`;
        csvContent += `${'-'.repeat(70)}\n`;
        unit.students.forEach((student, idx) => {
          csvContent += `  ${idx + 1}. ${student.name} (${student.ciheId}) - ${student.email}\n`;
        });
      } else {
        csvContent += `NO STUDENTS ENROLLED\n`;
      }
      
      csvContent += `\n\n`;
    });
    
    csvContent += '====================================================================\n';
    csvContent += 'RECOMMENDATIONS\n';
    csvContent += '====================================================================\n';
    const highDemandUnits = unitStats.filter(u => u.enrollmentCount > avgEnrollment * 1.5);
    const lowDemandUnits = unitStats.filter(u => u.enrollmentCount === 0);
    
    if (highDemandUnits.length > 0) {
      csvContent += `\nHIGH DEMAND UNITS (Consider Additional Sections):\n`;
      highDemandUnits.forEach(u => {
        csvContent += `  - ${u.unitCode}: ${u.name} (${u.enrollmentCount} students)\n`;
      });
    }
    
    if (lowDemandUnits.length > 0) {
      csvContent += `\nZERO ENROLLMENT UNITS (Review Offering):\n`;
      lowDemandUnits.forEach(u => {
        csvContent += `  - ${u.unitCode}: ${u.name}\n`;
      });
    }
    
    csvContent += '====================================================================\n';
    csvContent += 'END OF REPORT\n';
    csvContent += '====================================================================\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CIHE-Unit-Popularity-Report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Unit Popularity Report exported successfully!');
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

            {/* Report 2 */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-base">Students with Multiple Units</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Students enrolled in 2 or more units
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Students:</span>
                    <Badge className="bg-green-600">{studentsWithMultipleUnits.length}</Badge>
                  </div>
                  <Button
                    onClick={exportMultipleUnitsReport}
                    className="w-full border border-blue-800/45 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white hover:brightness-110"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Report 3 */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-base">Unit Popularity Report</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Units ranked by student enrollment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Top 3 Units:</p>
                    {unitStats.slice(0, 3).map((unit, idx) => (
                      <p key={idx}>
                        {idx + 1}. {unit.unitCode} ({unit.count} students)
                      </p>
                    ))}
                  </div>
                  <Button
                    onClick={exportUnitPopularityReport}
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