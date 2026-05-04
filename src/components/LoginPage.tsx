import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { User, Lock, UserPlus, LogIn, RefreshCw, AlertCircle, Mail } from 'lucide-react';
import { mockApi } from '../utils/mockApi';
import { toast } from 'sonner@2.0.3';

interface LoginPageProps {
  onLogin: (user: any) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [authMode, setAuthMode] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerRole, setRegisterRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await mockApi.login(loginEmail, loginPassword);
      onLogin(data.user);
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during login';
      setError(errorMessage);

      if (errorMessage === 'Invalid email or password') {
        toast.error('Login failed. Please check your credentials.');
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
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.2),_transparent_28%),linear-gradient(135deg,#0f172a_0%,#163b72_45%,#10213e_100%)] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-7">
          <div className="flex justify-center mb-3">
            <img
              src="/images/cihe-logo.png"
              alt="CIHE Logo"
              className="h-16 w-auto max-w-[120px] object-contain drop-shadow-[0_12px_30px_rgba(15,23,42,0.45)]"
            />
          </div>
          <h1 className="text-white mb-2 text-2xl font-semibold tracking-tight">
            CIHE Pre-Enrolment
          </h1>
          <p className="text-slate-300/90 text-sm">Crown Institute of Higher Education</p>
        </div>

        <Card className="rounded-[28px] border border-white/50 bg-white/96 shadow-[0_24px_70px_rgba(15,23,42,0.28)] backdrop-blur-sm">
          <CardHeader className="pb-5 pt-8 px-8">
            <CardTitle className="text-[2rem] text-center font-semibold tracking-tight text-slate-950">Welcome Back</CardTitle>
            <CardDescription className="text-center text-sm text-slate-500">
              Sign in to manage your pre-enrolment details
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-1 px-8 pb-8">
            <Tabs value={authMode} onValueChange={setAuthMode} className="w-full">
              <div className="mb-8 flex items-center justify-center gap-5 border-b border-slate-200 pb-3">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`inline-flex items-center gap-2 text-base font-medium transition-colors ${
                    authMode === 'login' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </button>
                <span className="text-slate-300">/</span>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`inline-flex items-center gap-2 text-base font-medium transition-colors ${
                    authMode === 'register' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  Register
                </button>
              </div>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-7">
                  <div className="space-y-3">
                    <Label htmlFor="login-email" className="sr-only">
                      Email Address
                    </Label>
                    <div className="relative border-b-2 border-slate-200 pb-3 transition-colors focus-within:border-blue-700">
                      <User className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 text-blue-700" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="h-12 border-0 bg-transparent pl-12 text-[22px] font-normal text-slate-700 shadow-none ring-0 placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="login-password" className="sr-only">
                      Password
                    </Label>
                    <div className="relative border-b-2 border-slate-200 pb-3 transition-colors focus-within:border-blue-700">
                      <Lock className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 text-blue-700" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="h-12 border-0 bg-transparent pl-12 text-[22px] font-normal text-slate-700 shadow-none ring-0 placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="h-14 w-full rounded-2xl border border-blue-800/45 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-base font-semibold text-white shadow-[0_14px_34px_rgba(15,23,42,0.28)] transition-all hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_18px_38px_rgba(15,23,42,0.34)] active:translate-y-0"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </div>
                    )}
                  </Button>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Demo Access</p>
                    <div className="space-y-1 text-sm leading-6">
                      <p className="text-slate-700">
                        <strong>Student:</strong> student@cihe.edu (pwd: student123)
                      </p>
                      <p className="text-slate-700">
                        <strong>Student:</strong> sarah@cihe.edu (pwd: student123)
                      </p>
                      <p className="text-slate-700">
                        <strong>Student:</strong> michael@cihe.edu (pwd: student123)
                      </p>
                      <p className="text-slate-700">
                        <strong>Student:</strong> emma@cihe.edu (pwd: student123)
                      </p>
                      <p className="text-slate-700">
                        <strong>Admin:</strong> admin@cihe.edu (pwd: admin123)
                      </p>
                    </div>
                  </div>

                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="register-name" className="sr-only">
                      Full Name
                    </Label>
                    <div className="relative border-b-2 border-slate-200 pb-3 transition-colors focus-within:border-blue-700">
                      <User className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 text-blue-700" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Full Name"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="h-12 border-0 bg-transparent pl-12 text-[22px] font-normal text-slate-700 shadow-none ring-0 placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="register-email" className="sr-only">
                      Email
                    </Label>
                    <div className="relative border-b-2 border-slate-200 pb-3 transition-colors focus-within:border-blue-700">
                      <Mail className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 text-blue-700" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="h-12 border-0 bg-transparent pl-12 text-[22px] font-normal text-slate-700 shadow-none ring-0 placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="register-password" className="sr-only">
                      Password
                    </Label>
                    <div className="relative border-b-2 border-slate-200 pb-3 transition-colors focus-within:border-blue-700">
                      <Lock className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 text-blue-700" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="h-12 border-0 bg-transparent pl-12 text-[22px] font-normal text-slate-700 shadow-none ring-0 placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="register-role" className="sr-only">
                      Role
                    </Label>
                    <div className="relative border-b-2 border-slate-200 pb-3 transition-colors focus-within:border-blue-700">
                      <UserPlus className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 text-blue-700" />
                      <select
                        id="register-role"
                        value={registerRole}
                        onChange={(e) => setRegisterRole(e.target.value)}
                        className="h-12 w-full appearance-none border-0 bg-transparent pl-12 text-[22px] font-normal text-slate-700 focus:outline-none"
                        required
                      >
                        <option value="student">Student</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="h-14 w-full rounded-2xl border border-blue-800/45 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-base font-semibold text-white shadow-[0_14px_34px_rgba(15,23,42,0.28)] transition-all hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_18px_38px_rgba(15,23,42,0.34)] active:translate-y-0"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creating account...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Account
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}