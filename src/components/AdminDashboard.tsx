import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { DashboardHeader } from './DashboardHeader';
import { mockApi } from '../utils/mockApi';
import { StudentManagement } from './admin/StudentManagement';
import { UnitManagement } from './admin/UnitManagement';
import { ReportsModule } from './admin/ReportsModule';
import { UnitOverlapMatrix } from './admin/UnitOverlapMatrix';
import { RefreshCw, Users, BookOpen, ClipboardList, CalendarDays } from 'lucide-react';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('students');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      // Fetch all enrollments (previously called preferences)
      const preferencesData = await mockApi.getAllPreferences();
      setEnrollments(preferencesData.preferences || []);

      // Fetch students
      const usersData = await mockApi.getUsers('student');
      setStudents(usersData.users || []);

      // Fetch units (previously called courses)
      const coursesData = await mockApi.getCourses();
      setUnits(coursesData.courses || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const uniqueDays = new Set(enrollments.map((item) => item.dayPreference).filter(Boolean)).size;
  const lastSubmission = enrollments.length
    ? new Date(
        Math.max(...enrollments.map((item) => new Date(item.submittedAt || 0).getTime()))
      ).toLocaleDateString()
    : 'N/A';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.2),_transparent_28%),linear-gradient(135deg,#0f172a_0%,#163b72_45%,#10213e_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20" />
      <DashboardHeader user={user} onLogout={onLogout} />

      <div className="relative max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-white mb-2">Admin Portal</h1>
          <p className="text-slate-200">
            Manage students, units, and generate comprehensive enrollment reports
          </p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border border-white/40 bg-white/95 shadow-[0_16px_45px_rgba(15,23,42,0.16)]">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Students</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{students.length}</p>
              </div>
              <Users className="h-6 w-6 text-blue-700" />
            </CardContent>
          </Card>

          <Card className="border border-white/40 bg-white/95 shadow-[0_16px_45px_rgba(15,23,42,0.16)]">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Units</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{units.length}</p>
              </div>
              <BookOpen className="h-6 w-6 text-blue-700" />
            </CardContent>
          </Card>

          <Card className="border border-white/40 bg-white/95 shadow-[0_16px_45px_rgba(15,23,42,0.16)]">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Preferences</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{enrollments.length}</p>
              </div>
              <ClipboardList className="h-6 w-6 text-blue-700" />
            </CardContent>
          </Card>

          <Card className="border border-white/40 bg-white/95 shadow-[0_16px_45px_rgba(15,23,42,0.16)]">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Days Active</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{uniqueDays}</p>
              </div>
              <CalendarDays className="h-6 w-6 text-blue-700" />
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/30 bg-white/10 p-4 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-100">
            Last submission captured: <span className="font-semibold">{lastSubmission}</span>
          </p>
          <Button
            onClick={fetchData}
            className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
            variant="outline"
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 items-stretch gap-2 rounded-2xl border border-white/35 bg-white/15 p-2 backdrop-blur-sm lg:grid-cols-4">
            <TabsTrigger value="students" className="h-auto min-h-[2.5rem] rounded-xl px-3 py-2 text-center leading-tight text-slate-100 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Students</TabsTrigger>
            <TabsTrigger value="units" className="h-auto min-h-[2.5rem] rounded-xl px-3 py-2 text-center leading-tight text-slate-100 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Units</TabsTrigger>
            <TabsTrigger value="reports" className="h-auto min-h-[2.5rem] rounded-xl px-3 py-2 text-center leading-tight text-slate-100 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Reports</TabsTrigger>
            <TabsTrigger value="overlap" className="h-auto min-h-[2.5rem] rounded-xl px-3 py-2 text-center leading-tight text-slate-100 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Overlap Matrix</TabsTrigger>
          </TabsList>

          {/* Student Management Tab */}
          <TabsContent value="students">
            <StudentManagement
              students={students}
              enrollments={enrollments}
              units={units}
            />
          </TabsContent>

          {/* Unit Management Tab */}
          <TabsContent value="units">
            <UnitManagement
              units={units}
              enrollments={enrollments}
            />
          </TabsContent>

          {/* Reports Module Tab */}
          <TabsContent value="reports">
            <ReportsModule
              students={students}
              units={units}
              enrollments={enrollments}
            />
          </TabsContent>

          {/* Overlap Matrix Tab */}
          <TabsContent value="overlap">
            <UnitOverlapMatrix
              units={units}
              enrollments={enrollments}
              students={students}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
