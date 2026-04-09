import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DashboardHeader } from './DashboardHeader';
import { mockApi } from '../utils/mockApi';
import { DashboardOverview } from './admin/DashboardOverview';
import { StudentManagement } from './admin/StudentManagement';
import { UnitManagement } from './admin/UnitManagement';
import { ReportsModule } from './admin/ReportsModule';
import { UnitOverlapMatrix } from './admin/UnitOverlapMatrix';
import { OverlapInsights } from './admin/OverlapInsights';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-600">
            Manage students, units, and generate comprehensive enrollment reports
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="units">Units</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="overlap">Overlap Matrix</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <DashboardOverview 
              students={students}
              units={units}
              enrollments={enrollments}
            />
          </TabsContent>

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

          {/* Overlap Insights Tab */}
          <TabsContent value="insights">
            <OverlapInsights
              units={units}
              enrollments={enrollments}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
