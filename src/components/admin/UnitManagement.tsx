import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Download, Search, BookOpen, Users, TrendingUp, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

interface UnitManagementProps {
  units: any[];
  enrollments: any[];
}

type SortField = 'code' | 'name' | 'enrolled' | 'demand';
type SortDir = 'asc' | 'desc';

export function UnitManagement({ units, enrollments }: UnitManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('enrolled');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const getUnitEnrollmentCount = (unitId: string) =>
    enrollments.filter(e => e.courseId === unitId).length;

  const unitsWithStats = units.map(unit => ({
    ...unit,
    enrollmentCount: getUnitEnrollmentCount(unit.id),
  }));

  const avgEnrollment = unitsWithStats.length > 0
    ? unitsWithStats.reduce((sum, u) => sum + u.enrollmentCount, 0) / unitsWithStats.length
    : 0;

  // Summary stats
  const totalUnits = units.length;
  const totalEnrollments = enrollments.length;
  const highDemandUnits = unitsWithStats.filter(u => u.enrollmentCount > avgEnrollment).length;
  const avgPerUnit = totalUnits > 0 ? (totalEnrollments / totalUnits).toFixed(1) : '0';

  const getDemandLevel = (count: number) =>
    count > avgEnrollment ? 'high' : count > 0 ? 'medium' : 'low';

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'enrolled' ? 'desc' : 'asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 text-slate-400" />;
    return sortDir === 'asc'
      ? <ArrowUp className="h-3 w-3 ml-1 text-blue-600" />
      : <ArrowDown className="h-3 w-3 ml-1 text-blue-600" />;
  };

  const demandOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };

  const filteredUnits = unitsWithStats
    .filter(unit =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.unitCode.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'code') return dir * a.unitCode.localeCompare(b.unitCode);
      if (sortField === 'name') return dir * a.name.localeCompare(b.name);
      if (sortField === 'enrolled') return dir * (a.enrollmentCount - b.enrollmentCount);
      return dir * (demandOrder[getDemandLevel(a.enrollmentCount)] - demandOrder[getDemandLevel(b.enrollmentCount)]);
    });

  const exportUnitReport = () => {
    let csvContent = 'CIHE PRE-ENROLMENT SYSTEM - UNIT MANAGEMENT REPORT\\n';
    csvContent += `Generated: ${new Date().toLocaleString()}\\n\\n`;
    csvContent += 'Unit Name,Unit Code,Students Enrolled,Semester,Demand Level\\n';
    [...unitsWithStats].sort((a, b) => b.enrollmentCount - a.enrollmentCount).forEach(unit => {
      const d = getDemandLevel(unit.enrollmentCount);
      csvContent += `"${unit.name}",${unit.unitCode},${unit.enrollmentCount},${unit.semester || 'N/A'},${d.charAt(0).toUpperCase() + d.slice(1)}\\n`;
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
      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total Units</p>
                <p className="mt-0.5 text-2xl font-semibold text-slate-900">{totalUnits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-50 p-2.5">
                <Users className="h-5 w-5 text-green-600" />
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
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">High Demand</p>
                <p className="mt-0.5 text-2xl font-semibold text-slate-900">{highDemandUnits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-50 p-2.5">
                <ArrowUpDown className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Avg per Unit</p>
                <p className="mt-0.5 text-2xl font-semibold text-slate-900">{avgPerUnit}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main table card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Units</CardTitle>
              <CardDescription>Complete list of units with enrollment statistics</CardDescription>
            </div>
            <Button
              onClick={exportUnitReport}
              className="border border-blue-800/45 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white hover:brightness-110"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Report
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
                  placeholder="Search by unit name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <p className="text-sm text-slate-500 shrink-0">
                Showing <span className="font-semibold text-slate-700">{filteredUnits.length}</span> of <span className="font-semibold text-slate-700">{totalUnits}</span> units
              </p>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>
                      <button onClick={() => handleSort('code')} className="flex items-center font-semibold text-slate-700 hover:text-blue-600 transition-colors">
                        Unit Code <SortIcon field="code" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => handleSort('name')} className="flex items-center font-semibold text-slate-700 hover:text-blue-600 transition-colors">
                        Unit Name <SortIcon field="name" />
                      </button>
                    </TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>
                      <button onClick={() => handleSort('enrolled')} className="flex items-center font-semibold text-slate-700 hover:text-blue-600 transition-colors">
                        Students Enrolled <SortIcon field="enrolled" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button onClick={() => handleSort('demand')} className="flex items-center font-semibold text-slate-700 hover:text-blue-600 transition-colors">
                        Demand Level <SortIcon field="demand" />
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnits.map((unit) => {
                    const demandLevel = getDemandLevel(unit.enrollmentCount);
                    const badgeColor = demandLevel === 'high' ? 'bg-green-600' :
                                      demandLevel === 'medium' ? 'bg-orange-600' : 'bg-red-600';
                    return (
                      <TableRow key={unit.id} className="hover:bg-slate-50/70">
                        <TableCell>
                          <Badge variant="outline" className="font-mono">{unit.unitCode}</Badge>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">{unit.name}</TableCell>
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
            </div>

            {/* Empty state */}
            {filteredUnits.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 text-slate-400">
                <BookOpen className="h-10 w-10 mb-3 opacity-40" />
                <p className="font-medium text-slate-500">No units found</p>
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