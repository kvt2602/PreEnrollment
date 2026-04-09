import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Users, BookOpen, Calendar, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';

interface DashboardOverviewProps {
  students: any[];
  units: any[];
  enrollments: any[];
}

export function DashboardOverview({ students, units, enrollments }: DashboardOverviewProps) {
  // Calculate metrics
  const totalStudents = students.length;
  const totalUnits = units.length;
  const totalEnrollments = enrollments.length;
  
  // Students with 1 unit
  const enrollmentsByStudent = enrollments.reduce((acc: any, enr) => {
    acc[enr.studentEmail] = (acc[enr.studentEmail] || 0) + 1;
    return acc;
  }, {});
  
  const studentsWith1Unit = Object.values(enrollmentsByStudent).filter((count: any) => count === 1).length;
  const studentsWith2PlusUnits = Object.values(enrollmentsByStudent).filter((count: any) => count >= 2).length;
  
  // High overlap detection - find unit pairs with most common students
  const getHighOverlapPairs = () => {
    const pairs: { [key: string]: Set<string> } = {};
    
    Object.entries(enrollmentsByStudent).forEach(([email, count]) => {
      if (count < 2) return;
      
      const studentEnrollments = enrollments.filter(e => e.studentEmail === email);
      for (let i = 0; i < studentEnrollments.length; i++) {
        for (let j = i + 1; j < studentEnrollments.length; j++) {
          const unit1 = studentEnrollments[i].courseId;
          const unit2 = studentEnrollments[j].courseId;
          const pairKey = [unit1, unit2].sort().join('::');
          
          if (!pairs[pairKey]) {
            pairs[pairKey] = new Set();
          }
          pairs[pairKey].add(email);
        }
      }
    });
    
    return Object.entries(pairs)
      .map(([key, students]) => ({
        units: key.split('::'),
        studentCount: students.size,
      }))
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, 3);
  };
  
  const highOverlapPairs = getHighOverlapPairs();
  
  // Possible clashes - enrollments on same day/time
  const getClashes = () => {
    const clashes: { [key: string]: any[] } = {};
    
    enrollments.forEach(enr => {
      const key = `${enr.dayPreference}-${enr.timePreference}`;
      if (!clashes[key]) {
        clashes[key] = [];
      }
      clashes[key].push(enr);
    });
    
    return Object.values(clashes)
      .filter(group => {
        const uniqueUnits = new Set(group.map(e => e.courseId));
        return uniqueUnits.size > 1;
      }).length;
  };
  
  const totalClashes = getClashes();
  
  const getUnitName = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    return unit?.name || unitId;
  };
  
  const getUnitCode = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    return unit?.unitCode || unitId;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Registered in the system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits}</div>
            <p className="text-xs text-muted-foreground">
              Available courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              Student-unit combinations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Possible Clashes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClashes}</div>
            <p className="text-xs text-muted-foreground">
              Time slot conflicts detected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Student Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Student Unit Distribution</CardTitle>
            <CardDescription>Students grouped by number of units enrolled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Students with 1 Unit</p>
                    <p className="text-sm text-gray-600">Taking single course</p>
                  </div>
                </div>
                <Badge className="bg-blue-600 text-xl px-4 py-2">{studentsWith1Unit}</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 p-2 rounded">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Students with 2+ Units</p>
                    <p className="text-sm text-gray-600">Multiple course enrollments</p>
                  </div>
                </div>
                <Badge className="bg-green-600 text-xl px-4 py-2">{studentsWith2PlusUnits}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Insights</CardTitle>
            <CardDescription>High overlap units and scheduling recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highOverlapPairs.length > 0 ? (
                <>
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-2">Top Overlapping Unit Pairs:</p>
                      {highOverlapPairs.map((pair, idx) => (
                        <div key={idx} className="mb-2 last:mb-0">
                          <p className="text-sm text-gray-700">
                            <Badge variant="outline" className="mr-1">{getUnitCode(pair.units[0])}</Badge>
                            <span className="text-gray-500">+</span>
                            <Badge variant="outline" className="ml-1 mr-2">{getUnitCode(pair.units[1])}</Badge>
                            <span className="text-gray-600">→ {pair.studentCount} students</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {totalClashes > 0 && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-900">Scheduling Alert</p>
                        <p className="text-sm text-red-700 mt-1">
                          {totalClashes} time slot{totalClashes !== 1 ? 's have' : ' has'} conflicting unit preferences
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-green-800">No major scheduling conflicts detected</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
