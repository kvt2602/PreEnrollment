import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { GraduationCap, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { mockApi } from '../utils/mockApi';
import { toast } from 'sonner@2.0.3';

interface LoginPageProps {
  onLogin: (user: any) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerRole, setRegisterRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetData = async () => {
    if (!confirm('This will reset backend data to demo defaults. Continue?')) {
      return;
    }

    try {
      await mockApi.resetDemoData();
      toast.success('Backend demo data reset successfully. Reloading page...');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset backend data');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', loginEmail);
      const data = await mockApi.login(loginEmail, loginPassword);
      console.log('Login successful:', data);
      onLogin(data.user);
    } catch (err: any) {
      console.error('Login error:', err);
      
      const errorMessage = err.message || 'An error occurred during login';
      setError(errorMessage);
      
      // If login fails, suggest resetting data
      if (errorMessage === 'Invalid email or password') {
        toast.error('Login failed. Please click "Reset Data to Demo Defaults" button below to fix any data issues.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await mockApi.register(registerEmail, registerPassword, registerName, registerRole);
      onLogin(data.user);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Info Banner */}
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-green-900 font-medium">System Running with Node.js + MySQL</p>
              <p className="text-green-700 text-sm mt-1">
                Data is persisted in MySQL through the Node.js API.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/images/cihe-logo.png"
              alt="CIHE Logo"
              className="h-24 w-auto max-w-[140px] object-contain"
            />
          </div>
          <h1 className="text-blue-900 mb-2">CIHE Pre-Enrolment System</h1>
          <p className="text-gray-600">Course Investment & Higher Education</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your.email@cihe.edu"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-blue-900 mb-2">Demo Accounts:</p>
                    <div className="space-y-1">
                      <p className="text-blue-800"><strong>Student:</strong> student@cihe.edu / student123</p>
                      <p className="text-blue-800"><strong>Other Students:</strong> sarah@cihe.edu, michael@cihe.edu, emma@cihe.edu (all use: student123)</p>
                      <p className="text-blue-800"><strong>Admin:</strong> admin@cihe.edu / admin123</p>
                    </div>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your.email@cihe.edu"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-role">Role</Label>
                    <select
                      id="register-role"
                      value={registerRole}
                      onChange={(e) => setRegisterRole(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="student">Student</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Button
            variant="outline"
            className="text-sm"
            onClick={handleResetData}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Data to Demo Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}