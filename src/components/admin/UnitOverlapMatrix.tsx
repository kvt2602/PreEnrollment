import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Download, AlertTriangle, Info, BookOpen, Users, TrendingUp, X } from 'lucide-react';
import { toast } from 'sonner';

interface UnitOverlapMatrixProps {
  units: any[];
  enrollments: any[];
  students: any[];
}

export function UnitOverlapMatrix({ units, enrollments, students }: UnitOverlapMatrixProps) {
  const [showTooltip, setShowTooltip] = useState<{ unitA: string; unitB: string; count: number } | null>(null);
  const [selectedPair, setSelectedPair] = useState<{
    unitACode: string; unitAName: string;
    unitBCode: string; unitBName: string;
    emails: string[];
  } | null>(null);

  const calculateOverlapMatrix = () => {
    const matrix: { [key: string]: { [key: string]: Set<string> } } = {};
    const studentEnrollments: { [email: string]: string[] } = {};
    enrollments.forEach(enr => {
      if (!studentEnrollments[enr.studentEmail]) studentEnrollments[enr.studentEmail] = [];
      studentEnrollments[enr.studentEmail].push(enr.courseId);
    });
    units.forEach(unitA => {
      matrix[unitA.id] = {};
      units.forEach(unitB => { matrix[unitA.id][unitB.id] = new Set(); });
    });
    Object.entries(studentEnrollments).forEach(([email, unitIds]) => {
      for (let i = 0; i < unitIds.length; i++) {
        for (let j = 0; j < unitIds.length; j++) {
          if (matrix[unitIds[i]] && matrix[unitIds[i]][unitIds[j]]) {
            matrix[unitIds[i]][unitIds[j]].add(email);
          }
        }
      }
    });
    return matrix;
  };

  const matrix = calculateOverlapMatrix();

  const getStudentDetails = useCallback((emails: string[]) => {
    return emails.map(email => {
      const student = students.find((s: any) => s.email === email);
      return { email, name: student?.name || email, ciheId: student?.ciheId || 'N/A' };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  const uniqueStudentCount = new Set(enrollments.map(e => e.studentEmail)).size;
  const unitIds = units.map(u => u.id);
  const pairCounts: number[] = [];
  for (let i = 0; i < unitIds.length; i++) {
    for (let j = i + 1; j < unitIds.length; j++) {
      const count = (matrix[unitIds[i]]?.[unitIds[j]] as Set<string> | undefined)?.size ?? 0;
      if (count > 0) pairCounts.push(count);
    }
  }
  const highOverlapPairs = pairCounts.filter(c => c >= 3).length;
  const anyOverlapPairs = pairCounts.length;

  const getOverlapColor = (count: number, unitA: string, unitB: string) => {
    if (unitA === unitB) return 'bg-gray-800 text-white';
    if (count === 0) return 'bg-gray-50 text-gray-400';
    if (count === 1) return 'bg-green-100 text-green-800';
    if (count === 2) return 'bg-yellow-100 text-yellow-800';
    if (count >= 3) return 'bg-red-100 text-red-800';
    return 'bg-orange-100 text-orange-800';
  };

  const getOverlapLevel = (count: number, unitA: string, unitB: string) => {
    if (unitA === unitB) return 'Self';
    if (count === 0) return 'No Overlap';
    if (count === 1) return 'Low';
    if (count === 2) return 'Medium';
    if (count >= 3) return 'High';
    return 'Medium';
  };

  const exportMatrix = () => {
    let csvContent = 'CIHE PRE-ENROLMENT SYSTEM - UNIT OVERLAP MATRIX\n';
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
    csvContent += 'This matrix shows the number of students enrolled in both units\n\n';
    csvContent += 'Unit Code / Unit Code,' + units.map(u => u.unitCode).join(',') + '\n';
    units.forEach(unitA => {
      const row = [unitA.unitCode];
      units.forEach(unitB => { row.push((matrix[unitA.id]?.[unitB.id]?.size || 0).toString()); });
      csvContent += row.join(',') + '\n';
    });
    csvContent += '\n\nHIGH OVERLAP PAIRS (3+ students)\nUnit A,Unit B,Common Students,Level\n';
    const highOverlaps: any[] = [];
    units.forEach(unitA => {
      units.forEach(unitB => {
        if (unitA.id < unitB.id) {
          const count = matrix[unitA.id]?.[unitB.id]?.size || 0;
          if (count >= 3) highOverlaps.push({ unitA: unitA.unitCode, unitB: unitB.unitCode, count });
        }
      });
    });
    highOverlaps.sort((a, b) => b.count - a.count);
    highOverlaps.forEach(o => { csvContent += `${o.unitA},${o.unitB},${o.count},High\n`; });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `unit-overlap-matrix-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Overlap matrix exported successfully!');
  };

  const exportPairTable = () => {
    let csvContent = 'CIHE PRE-ENROLMENT SYSTEM - UNIT PAIR OVERLAP TABLE\n';
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
    csvContent += 'Unit A Code,Unit A Name,Unit B Code,Unit B Name,Common Students,Overlap Level\n';
    const pairs: any[] = [];
    units.forEach(unitA => {
      units.forEach(unitB => {
        if (unitA.id < unitB.id) {
          const count = matrix[unitA.id]?.[unitB.id]?.size || 0;
          if (count > 0) pairs.push({ unitACode: unitA.unitCode, unitAName: unitA.name, unitBCode: unitB.unitCode, unitBName: unitB.name, count, level: getOverlapLevel(count, unitA.id, unitB.id) });
        }
      });
    });
    pairs.sort((a, b) => b.count - a.count);
    pairs.forEach(p => { csvContent += `${p.unitACode},"${p.unitAName}",${p.unitBCode},"${p.unitBName}",${p.count},${p.level}\n`; });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `unit-pair-overlap-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Unit pair overlap table exported successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5"><BookOpen className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total Units</p>
                <p className="mt-0.5 text-2xl font-semibold text-slate-900">{units.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-50 p-2.5"><Users className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Students Enrolled</p>
                <p className="mt-0.5 text-2xl font-semibold text-slate-900">{uniqueStudentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-50 p-2.5"><TrendingUp className="h-5 w-5 text-orange-600" /></div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Overlapping Pairs</p>
                <p className="mt-0.5 text-2xl font-semibold text-slate-900">{anyOverlapPairs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-50 p-2.5"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">High Overlap Pairs</p>
                <p className="mt-0.5 text-2xl font-semibold text-slate-900">{highOverlapPairs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Unit Overlap Matrix</CardTitle>
              <CardDescription>
                Visual matrix showing number of common students between unit pairs — click any cell to see who overlaps
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportMatrix} className="border border-blue-800/45 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white hover:brightness-110" size="sm">
                <Download className="h-4 w-4 mr-2" />Matrix CSV
              </Button>
              <Button onClick={exportPairTable} className="border border-blue-800/45 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white hover:brightness-110" size="sm">
                <Download className="h-4 w-4 mr-2" />Pair Table CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-2">How to Read This Matrix:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2"><div className="w-6 h-6 bg-gray-50 border border-gray-200 rounded"></div><span className="text-gray-700">No Overlap (0)</span></div>
                  <div className="flex items-center gap-2"><div className="w-6 h-6 bg-green-100 border border-green-200 rounded"></div><span className="text-gray-700">Low (1)</span></div>
                  <div className="flex items-center gap-2"><div className="w-6 h-6 bg-yellow-100 border border-yellow-200 rounded"></div><span className="text-gray-700">Medium (2)</span></div>
                  <div className="flex items-center gap-2"><div className="w-6 h-6 bg-red-100 border border-red-200 rounded"></div><span className="text-gray-700">High (3+)</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Matrix */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <table className="border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-white border border-gray-300 p-2 text-xs font-medium text-gray-700 min-w-[100px]">Unit Code</th>
                    {units.map(unit => (
                      <th key={unit.id} className="h-12 min-w-[76px] max-w-[76px] border border-gray-300 px-1 py-2 align-middle text-center text-[11px] font-semibold text-gray-700" title={unit.name}>
                        <div className="mx-auto w-full truncate leading-none">{unit.unitCode}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {units.map(unitA => (
                    <tr key={unitA.id}>
                      <td className="sticky left-0 z-10 bg-white border border-gray-300 p-2 text-xs font-medium text-gray-700">
                        <div className="flex items-center gap-1" title={unitA.name}>
                          <Badge variant="outline" className="text-[10px]">{unitA.unitCode}</Badge>
                        </div>
                      </td>
                      {units.map(unitB => {
                        const count = matrix[unitA.id]?.[unitB.id]?.size || 0;
                        const colorClass = getOverlapColor(count, unitA.id, unitB.id);
                        const isClickable = unitA.id !== unitB.id && count > 0;
                        return (
                          <td
                            key={unitB.id}
                            className={`border border-gray-300 p-2 text-center text-xs font-medium transition-opacity ${isClickable ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-inset hover:opacity-80' : ''} ${colorClass}`}
                            title={`${unitA.unitCode} ↔ ${unitB.unitCode}: ${count} student${count !== 1 ? 's' : ''}${isClickable ? ' — click to see names' : ''}`}
                            onMouseEnter={() => setShowTooltip({ unitA: unitA.unitCode, unitB: unitB.unitCode, count })}
                            onMouseLeave={() => setShowTooltip(null)}
                            onClick={() => {
                              if (!isClickable) return;
                              const emails = Array.from(matrix[unitA.id]?.[unitB.id] ?? new Set<string>()) as string[];
                              setSelectedPair({ unitACode: unitA.unitCode, unitAName: unitA.name, unitBCode: unitB.unitCode, unitBName: unitB.name, emails });
                            }}
                          >
                            {unitA.id === unitB.id ? '—' : count}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overlapping Student Detail Panel */}
          {selectedPair && (() => {
            const studentDetails = getStudentDetails(selectedPair.emails);
            return (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <Users className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900 mb-1">
                        Overlapping Students:&nbsp;
                        <Badge variant="outline" className="mr-1">{selectedPair.unitACode}</Badge>
                        <span className="text-blue-600">↔</span>
                        <Badge variant="outline" className="ml-1">{selectedPair.unitBCode}</Badge>
                        <span className="ml-2 text-blue-700">({studentDetails.length} student{studentDetails.length !== 1 ? 's' : ''})</span>
                      </p>
                      <p className="text-xs text-blue-700 mb-3">{selectedPair.unitAName} &amp; {selectedPair.unitBName}</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-blue-200">
                              <th className="text-left py-1.5 pr-4 text-xs font-semibold text-blue-800 uppercase tracking-wide">#</th>
                              <th className="text-left py-1.5 pr-4 text-xs font-semibold text-blue-800 uppercase tracking-wide">Student Name</th>
                              <th className="text-left py-1.5 pr-4 text-xs font-semibold text-blue-800 uppercase tracking-wide">CIHE ID</th>
                              <th className="text-left py-1.5 text-xs font-semibold text-blue-800 uppercase tracking-wide">Email</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentDetails.map((s, idx) => (
                              <tr key={s.email} className="border-b border-blue-100 last:border-0">
                                <td className="py-1.5 pr-4 text-blue-600 font-medium">{idx + 1}</td>
                                <td className="py-1.5 pr-4 font-medium text-slate-800">{s.name}</td>
                                <td className="py-1.5 pr-4"><Badge variant="outline" className="text-[10px] font-mono">{s.ciheId}</Badge></td>
                                <td className="py-1.5 text-slate-500 text-xs">{s.email}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedPair(null)} className="ml-2 p-1 rounded hover:bg-blue-100 text-blue-500 hover:text-blue-700 transition-colors shrink-0" title="Close">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* High Overlap Warning */}
          {(() => {
            const highOverlaps: any[] = [];
            units.forEach(unitA => {
              units.forEach(unitB => {
                if (unitA.id < unitB.id) {
                  const count = matrix[unitA.id]?.[unitB.id]?.size || 0;
                  if (count >= 3) highOverlaps.push({ unitA: unitA.unitCode, unitAName: unitA.name, unitB: unitB.unitCode, unitBName: unitB.name, count });
                }
              });
            });
            if (highOverlaps.length > 0) {
              return (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900 mb-2">High Overlap Units Detected ({highOverlaps.length} pairs)</p>
                      <div className="space-y-2">
                        {highOverlaps.slice(0, 5).map((overlap, idx) => (
                          <div key={idx} className="text-sm text-red-800">
                            <Badge variant="outline" className="mr-1">{overlap.unitA}</Badge>
                            <span className="text-red-600">↔</span>
                            <Badge variant="outline" className="ml-1 mr-2">{overlap.unitB}</Badge>
                            <span className="font-medium">{overlap.count} students</span>
                            <span className="text-red-600 ml-2">→ Avoid scheduling at same time</span>
                          </div>
                        ))}
                        {highOverlaps.length > 5 && (
                          <p className="text-sm text-red-700 italic">...and {highOverlaps.length - 5} more high overlap pairs</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
