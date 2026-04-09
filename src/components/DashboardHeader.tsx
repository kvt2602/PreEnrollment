import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { GraduationCap, LogOut, User } from 'lucide-react';

interface DashboardHeaderProps {
  user: any;
  onLogout: () => void;
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  return (
    <header className="border-b border-[#d9e2ec] bg-white/95 backdrop-blur shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="bg-[#0f4c81] p-2 rounded-lg shadow-md shadow-[#0f4c81]/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-[#102a43]">CIHE Pre-Enrolment System</h1>
              <p className="text-sm text-[#486581]">Course Selection & Management</p>
            </div>
          </div>

          {/* Right: User Info and Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#486581]" />
              <div className="text-right">
                <p className="text-sm">{user.name}</p>
                <div className="flex items-center gap-2">
                  {user.ciheId && (
                    <span className="text-xs text-[#627d98]">{user.ciheId}</span>
                  )}
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? 'Administrator' : 'Student'}
                  </Badge>
                </div>
              </div>
            </div>
            <Button 
              onClick={onLogout}
              variant="outline"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
