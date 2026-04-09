import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AlertTriangle, CheckCircle, Lightbulb, TrendingUp, Download } from 'lucide-react';
import { toast } from 'sonner';

interface OverlapInsightsProps {
  units: any[];
  enrollments: any[];
}

export function OverlapInsights({ units, enrollments }: OverlapInsightsProps) {
  // Calculate overlap matrix
  const calculateOverlaps = () => {
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
        for (let j = i + 1; j < unitIds.length; j++) {
          if (matrix[unitIds[i]] && matrix[unitIds[i]][unitIds[j]]) {
            matrix[unitIds[i]][unitIds[j]].add(email);
            matrix[unitIds[j]][unitIds[i]].add(email);
          }
        }
      }
    });
    
    return { matrix, studentEnrollments };
  };
  
  const { matrix, studentEnrollments } = calculateOverlaps();
  
  const getUnitDetails = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    return {
      name: unit?.name || unitId,
      code: unit?.unitCode || unitId,
      semester: unit?.semester,
    };
  };
  
  // Get top overlapping pairs
  const getTopOverlaps = () => {
    const overlaps: any[] = [];
    
    units.forEach(unitA => {
      units.forEach(unitB => {
        if (unitA.id < unitB.id) {
          const count = matrix[unitA.id]?.[unitB.id]?.size || 0;
          if (count > 0) {
            overlaps.push({
              unitA: getUnitDetails(unitA.id),
              unitB: getUnitDetails(unitB.id),
              count,
              level: count >= 3 ? 'high' : count === 2 ? 'medium' : 'low',
            });
          }
        }
      });
    });
    
    return overlaps.sort((a, b) => b.count - a.count);
  };
  
  const topOverlaps = getTopOverlaps();
  const highOverlaps = topOverlaps.filter(o => o.level === 'high');
  const mediumOverlaps = topOverlaps.filter(o => o.level === 'medium');
  
  // Generate scheduling suggestions
  const generateSuggestions = () => {
    const suggestions = [];
    
    // Suggestion 1: Units to avoid scheduling together
    if (highOverlaps.length > 0) {
      suggestions.push({
        type: 'avoid',
        title: 'Avoid Scheduling Together',
        description: 'These unit pairs have high student overlap (3+ students). Schedule them at different times to avoid conflicts.',
        pairs: highOverlaps.slice(0, 5),
      });
    }
    
    // Suggestion 2: Units that can be scheduled on same day (low overlap)
    const lowOverlapPairs = topOverlaps.filter(o => o.level === 'low' && o.count === 1);
    if (lowOverlapPairs.length > 0) {
      suggestions.push({
        type: 'safe',
        title: 'Safe to Schedule Together',
        description: 'These unit pairs have minimal overlap (1 student). Can be scheduled on the same day at different times.',
        pairs: lowOverlapPairs.slice(0, 5),
      });
    }
    
    // Suggestion 3: Back-to-back opportunities
    if (mediumOverlaps.length > 0) {
      suggestions.push({
        type: 'backtoback',
        title: 'Back-to-Back Opportunities',
        description: 'These units have moderate overlap (2 students). Consider scheduling them back-to-back on the same day to reduce campus days.',
        pairs: mediumOverlaps.slice(0, 5),
      });
    }
    
    return suggestions;
  };
  
  const suggestions = generateSuggestions();
  
  // Export insights report
  const exportInsightsReport = () => {
    let csvContent = 'CIHE PRE-ENROLMENT SYSTEM - OVERLAP INSIGHTS & RECOMMENDATIONS\\n';
    csvContent += `Generated: ${new Date().toLocaleString()}\\n\\n`;
    csvContent += '================================================================================\\n';
    csvContent += 'SCHEDULING RECOMMENDATIONS\\n';
    csvContent += '================================================================================\\n\\n';
    
    suggestions.forEach((suggestion, idx) => {
      csvContent += `${idx + 1}. ${suggestion.title}\\n`;
      csvContent += `   ${suggestion.description}\\n\\n`;
      csvContent += '   Unit A Code,Unit A Name,Unit B Code,Unit B Name,Common Students,Recommendation\\n';
      
      suggestion.pairs.forEach((pair: any) => {
        const recommendation = suggestion.type === 'avoid' ? 'Schedule at different times' :
                              suggestion.type === 'safe' ? 'Can schedule same day' :
                              'Consider back-to-back slots';
        csvContent += `   ${pair.unitA.code},"${pair.unitA.name}",${pair.unitB.code},"${pair.unitB.name}",${pair.count},${recommendation}\\n`;
      });
      csvContent += '\\n';
    });
    
    // Top overlaps summary
    csvContent += '\\n================================================================================\\n';
    csvContent += 'TOP OVERLAPPING UNIT PAIRS (All Levels)\\n';
    csvContent += '================================================================================\\n';
    csvContent += 'Rank,Unit A,Unit B,Common Students,Overlap Level\\n';
    
    topOverlaps.forEach((overlap, idx) => {
      csvContent += `${idx + 1},${overlap.unitA.code},${overlap.unitB.code},${overlap.count},${overlap.level}\\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overlap-insights-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Overlap Insights Report exported!');
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              High Overlap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{highOverlaps.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Unit pairs with 3+ shared students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              Medium Overlap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{mediumOverlaps.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Unit pairs with 2 shared students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Total Pairs Analyzed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{topOverlaps.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All unit pair combinations</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Overlapping Pairs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Overlapping Unit Pairs</CardTitle>
              <CardDescription>Units with the most common students</CardDescription>
            </div>
            <Button onClick={exportInsightsReport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Insights
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {topOverlaps.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No overlapping enrollments found</p>
          ) : (
            <div className="space-y-3">
              {topOverlaps.slice(0, 10).map((overlap, idx) => {
                const bgColor = overlap.level === 'high' ? 'bg-red-50 border-red-200' :
                               overlap.level === 'medium' ? 'bg-orange-50 border-orange-200' :
                               'bg-green-50 border-green-200';
                const badgeColor = overlap.level === 'high' ? 'bg-red-600' :
                                  overlap.level === 'medium' ? 'bg-orange-600' : 'bg-green-600';
                
                return (
                  <div key={idx} className={`flex items-center justify-between p-4 border rounded-lg ${bgColor}`}>
                    <div className="flex items-center gap-3">
                      <div className="text-gray-500 font-medium">#{idx + 1}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{overlap.unitA.code}</Badge>
                          <span className="text-gray-400">↔</span>
                          <Badge variant="outline">{overlap.unitB.code}</Badge>
                        </div>
                        <p className="text-xs text-gray-600">
                          {overlap.unitA.name} + {overlap.unitB.name}
                        </p>
                      </div>
                    </div>
                    <Badge className={badgeColor}>
                      {overlap.count} student{overlap.count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Smart Suggestions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <CardTitle>Smart Scheduling Suggestions</CardTitle>
          </div>
          <CardDescription>AI-powered recommendations for optimal timetable planning</CardDescription>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No suggestions available yet</p>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion, idx) => {
                const icon = suggestion.type === 'avoid' ? <AlertTriangle className="h-5 w-5 text-red-600" /> :
                            suggestion.type === 'safe' ? <CheckCircle className="h-5 w-5 text-green-600" /> :
                            <TrendingUp className="h-5 w-5 text-orange-600" />;
                const bgColor = suggestion.type === 'avoid' ? 'bg-red-50 border-red-200' :
                               suggestion.type === 'safe' ? 'bg-green-50 border-green-200' :
                               'bg-orange-50 border-orange-200';
                
                return (
                  <div key={idx} className={`p-4 border rounded-lg ${bgColor}`}>
                    <div className="flex items-start gap-3 mb-3">
                      {icon}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{suggestion.title}</h4>
                        <p className="text-sm text-gray-700">{suggestion.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2 ml-8">
                      {suggestion.pairs.map((pair: any, pairIdx: number) => (
                        <div key={pairIdx} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-xs">{pair.unitA.code}</Badge>
                          <span className="text-gray-400">+</span>
                          <Badge variant="outline" className="text-xs">{pair.unitB.code}</Badge>
                          <span className="text-gray-500 mx-2">→</span>
                          <span className="text-gray-700">{pair.count} shared student{pair.count !== 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}