import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Download, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface UnitOverlapMatrixProps {
  units: any[];
  enrollments: any[];
  students: any[];
}

export function UnitOverlapMatrix({ units, enrollments, students }: UnitOverlapMatrixProps) {
  const [showTooltip, setShowTooltip] = useState<{ unitA: string; unitB: string; count: number } | null>(null);
  
  // Calculate overlap matrix
  const calculateOverlapMatrix = () => {
    const matrix: { [key: string]: { [key: string]: Set<string> } } = {};
    
    // Group enrollments by student
    const studentEnrollments: { [email: string]: string[] } = {};
    enrollments.forEach(enr => {
      if (!studentEnrollments[enr.studentEmail]) {
        studentEnrollments[enr.studentEmail] = [];
      }
      studentEnrollments[enr.studentEmail].push(enr.courseId);
    });
    
    // Build matrix
    units.forEach(unitA => {
      matrix[unitA.id] = {};
      units.forEach(unitB => {
        matrix[unitA.id][unitB.id] = new Set();
      });
    });
    
    // Count common students
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
  
  // Get color based on overlap count
  const getOverlapColor = (count: number, unitA: string, unitB: string) => {
    if (unitA === unitB) return 'bg-gray-800 text-white'; // Diagonal
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
  
  // Export matrix as CSV
  const exportMatrix = () => {
    let csvContent = 'CIHE PRE-ENROLMENT SYSTEM - UNIT OVERLAP MATRIX\\n';
    csvContent += `Generated: ${new Date().toLocaleString()}\\n\\n`;
    csvContent += 'This matrix shows the number of students enrolled in both units\\n\\n';
    
    // Header row
    csvContent += 'Unit Code / Unit Code,' + units.map(u => u.unitCode).join(',') + '\\n';
    
    // Data rows
    units.forEach(unitA => {
      const row = [unitA.unitCode];
      units.forEach(unitB => {
        const count = matrix[unitA.id]?.[unitB.id]?.size || 0;
        row.push(count.toString());
      });
      csvContent += row.join(',') + '\\n';
    });
    
    // Summary section
    csvContent += '\\n\\nHIGH OVERLAP PAIRS (3+ students)\\n';
    csvContent += 'Unit A,Unit B,Common Students,Level\\n';
    
    const highOverlaps: any[] = [];
    units.forEach(unitA => {
      units.forEach(unitB => {
        if (unitA.id < unitB.id) { // Avoid duplicates
          const count = matrix[unitA.id]?.[unitB.id]?.size || 0;
          if (count >= 3) {
            highOverlaps.push({
              unitA: unitA.unitCode,
              unitB: unitB.unitCode,
              count,
            });
          }
        }
      });
    });
    
    highOverlaps.sort((a, b) => b.count - a.count);
    highOverlaps.forEach(overlap => {
      csvContent += `${overlap.unitA},${overlap.unitB},${overlap.count},High\\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unit-overlap-matrix-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Overlap matrix exported successfully!');
  };
  
  // Export detailed pair table
  const exportPairTable = () => {
    let csvContent = 'CIHE PRE-ENROLMENT SYSTEM - UNIT PAIR OVERLAP TABLE\\n';
    csvContent += `Generated: ${new Date().toLocaleString()}\\n\\n`;
    csvContent += 'Unit A Code,Unit A Name,Unit B Code,Unit B Name,Common Students,Overlap Level\\n';
    
    const pairs: any[] = [];
    units.forEach(unitA => {
      units.forEach(unitB => {
        if (unitA.id < unitB.id) { // Avoid duplicates
          const count = matrix[unitA.id]?.[unitB.id]?.size || 0;
          if (count > 0) {
            pairs.push({
              unitACode: unitA.unitCode,
              unitAName: unitA.name,
              unitBCode: unitB.unitCode,
              unitBName: unitB.name,
              count,
              level: getOverlapLevel(count, unitA.id, unitB.id),
            });
          }
        }
      });
    });
    
    pairs.sort((a, b) => b.count - a.count);
    pairs.forEach(pair => {
      csvContent += `${pair.unitACode},"${pair.unitAName}",${pair.unitBCode},"${pair.unitBName}",${pair.count},${pair.level}\\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unit-pair-overlap-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Unit pair overlap table exported successfully!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Unit Overlap Matrix</CardTitle>
              <CardDescription>
                Visual matrix showing number of common students between unit pairs
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportMatrix} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Matrix CSV
              </Button>
              <Button onClick={exportPairTable} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Pair Table CSV
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
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-50 border border-gray-200 rounded"></div>
                    <span className="text-gray-700">No Overlap (0)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 border border-green-200 rounded"></div>
                    <span className="text-gray-700">Low (1)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-100 border border-yellow-200 rounded"></div>
                    <span className="text-gray-700">Medium (2)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-100 border border-red-200 rounded"></div>
                    <span className="text-gray-700">High (3+)</span>
                  </div>
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
                    <th className="sticky left-0 z-10 bg-white border border-gray-300 p-2 text-xs font-medium text-gray-700 min-w-[100px]">
                      Unit Code
                    </th>
                    {units.map(unit => (
                      <th
                        key={unit.id}
                        className="border border-gray-300 p-2 text-xs font-medium text-gray-700 min-w-[60px] max-w-[60px]"
                        title={unit.name}
                      >
                        <div className="transform -rotate-45 origin-left whitespace-nowrap">
                          {unit.unitCode}
                        </div>
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
                        
                        return (
                          <td
                            key={unitB.id}
                            className={`border border-gray-300 p-2 text-center text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${colorClass}`}
                            title={`${unitA.unitCode} ↔ ${unitB.unitCode}: ${count} student${count !== 1 ? 's' : ''}`}
                            onMouseEnter={() => setShowTooltip({ unitA: unitA.unitCode, unitB: unitB.unitCode, count })}
                            onMouseLeave={() => setShowTooltip(null)}
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

          {/* High Overlap Warning */}
          {(() => {
            const highOverlaps: any[] = [];
            units.forEach(unitA => {
              units.forEach(unitB => {
                if (unitA.id < unitB.id) {
                  const count = matrix[unitA.id]?.[unitB.id]?.size || 0;
                  if (count >= 3) {
                    highOverlaps.push({
                      unitA: unitA.unitCode,
                      unitAName: unitA.name,
                      unitB: unitB.unitCode,
                      unitBName: unitB.name,
                      count,
                    });
                  }
                }
              });
            });
            
            if (highOverlaps.length > 0) {
              return (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900 mb-2">
                        High Overlap Units Detected ({highOverlaps.length} pairs)
                      </p>
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
                          <p className="text-sm text-red-700 italic">
                            ...and {highOverlaps.length - 5} more high overlap pairs
                          </p>
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