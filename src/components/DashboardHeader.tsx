import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { GraduationCap, LogOut, User } from 'lucide-react';

interface DashboardHeaderProps {
  user: any;
  onLogout: () => void;
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/75 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-3">
            <img
              src="/images/cihe-logo.png"
              alt="CIHE Logo"
              className="h-12 w-auto max-w-[80px] object-contain"
            />
            <div>
              <h1 className="text-white">CIHE Pre-Enrolment System</h1>
              <p className="text-sm text-slate-300">Course Selection & Management</p>
            </div>
          </div>

          {/* Right: User Info and Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-200" />
              <div className="text-right">
                <p className="text-sm text-white">{user.name}</p>
                <div className="flex items-center gap-2">
                  {user.ciheId && (
                    <span className="text-xs text-slate-300">{user.ciheId}</span>
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
              className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
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
