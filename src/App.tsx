import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Toaster } from './components/ui/sonner';
import { mockApi } from './utils/mockApi';

export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Force initialization of demo data on app load
    mockApi.initializeDemoData();
    
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('cihe_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('cihe_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cihe_user');
  };

  return (
    <>
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : user.role === 'admin' ? (
        <AdminDashboard user={user} onLogout={handleLogout} />
      ) : (
        <StudentDashboard user={user} onLogout={handleLogout} />
      )}
      <Toaster />
    </>
  );
}