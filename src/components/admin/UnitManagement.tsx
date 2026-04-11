import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface UnitManagementProps {
  units: any[];
  enrollments: any[];
}

export function UnitManagement({ units, enrollments }: UnitManagementProps) {
  const getUnitEnrollmentCount = (unitId: string) => {
    return enrollments.filter(e => e.courseId === unitId).length;
  };
  
  const unitsWithStats = units.map(unit => ({
    ...unit,
    enrollmentCount: getUnitEnrollmentCount(unit.id),
  })).sort((a, b) => b.enrollmentCount - a.enrollmentCount);
  
  const avgEnrollment = unitsWithStats.reduce((sum, u) => sum + u.enrollmentCount, 0) / unitsWithStats.length;
  
  const exportUnitReport = () => {
    let csvContent = 'CIHE PRE-ENROLMENT SYSTEM - UNIT MANAGEMENT REPORT\\n';
    csvContent += `Generated: ${new Date().toLocaleString()}\\n\\n`;
    csvContent += 'Unit Name,Unit Code,Students Enrolled,Semester,Demand Level\\n';
    
    unitsWithStats.forEach(unit => {
      const demandLevel = unit.enrollmentCount > avgEnrollment ? 'High' : 
                         unit.enrollmentCount > 0 ? 'Medium' : 'Low';
      csvContent += `"${unit.name}",${unit.unitCode},${unit.enrollmentCount},${unit.semester || 'N/A'},${demandLevel}\\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unit-management-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Unit report exported successfully!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Units</CardTitle>
              <CardDescription>Complete list of units with enrollment statistics</CardDescription>
            </div>
            <Button onClick={exportUnitReport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit Code</TableHead>
                <TableHead>Unit Name</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Students Enrolled</TableHead>
                <TableHead>Demand Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unitsWithStats.map((unit) => {
                const demandLevel = unit.enrollmentCount > avgEnrollment ? 'high' : 
                                   unit.enrollmentCount > 0 ? 'medium' : 'low';
                const badgeColor = demandLevel === 'high' ? 'bg-green-600' :
                                  demandLevel === 'medium' ? 'bg-orange-600' : 'bg-red-600';
                
                return (
                  <TableRow key={unit.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">{unit.unitCode}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{unit.semester || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-600">{unit.enrollmentCount}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={badgeColor}>
                        {demandLevel.charAt(0).toUpperCase() + demandLevel.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}