import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LogOut, User } from 'lucide-react';

interface DashboardHeaderProps {
  user: any;
  onLogout: () => void;
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Title */}
          <div className="min-w-0 flex items-center gap-3">
            <img
              src="/images/cihe-logo.png"
              alt="CIHE Logo"
              className="h-10 w-auto max-w-[72px] object-contain"
            />
            <div className="min-w-0">
              <h1 className="truncate text-[1.9rem] font-semibold tracking-tight text-white">CIHE Pre-Enrolment System</h1>
              <p className="hidden text-sm text-slate-300 sm:block">Course Selection & Management</p>
            </div>
          </div>

          {/* Right: User Info and Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 md:flex">
              <User className="h-4 w-4 text-slate-200" />
              <div className="text-right leading-tight">
                <div className="flex items-center justify-end gap-2">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <Badge className="h-6 rounded-full border border-white/20 bg-white/10 px-2 text-[11px] text-white hover:bg-white/10" variant="outline">
                    {user.role === 'admin' ? 'Administrator' : 'Student'}
                  </Badge>
                </div>
                {user.ciheId && <p className="text-xs text-slate-300">{user.ciheId}</p>}
              </div>
            </div>
            <Button 
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="h-10 rounded-xl border-white/20 bg-white/5 px-4 text-white hover:bg-white/10 hover:text-white"
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
