import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { KeyRound, User, Eye, EyeOff, ShieldAlert, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = ({ setViewMode }) => {
  const { login } = useAuth();

  const [siUsername, setSiUsername] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [siShowPassword, setSiShowPassword] = useState(false);
  const [siLoading, setSiLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!siUsername || !siPassword) {
      toast.error('Please enter both username and password.');
      return;
    }
    if (attempts >= 5) {
      toast.error('Authentication locked. Please wait 15 minutes or contact support.');
      return;
    }
    setSiLoading(true);
    try {
      const res = await login(siUsername, siPassword);
      if (res.success) {
        toast.success(`Access granted. Welcome, ${res.data.user.username}!`);
        setViewMode('app');
      } else {
        setAttempts(prev => prev + 1);
        toast.error(res.message || 'Invalid credentials');
      }
    } catch (error) {
      setAttempts(prev => prev + 1);
      const msg = error.response?.data?.message || 'Authentication failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setSiLoading(false);
    }
  };

  const inputClass =
    'w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';

  return (
    <div className="min-h-[80vh] flex items-center justify-center font-sans animate-fade-in p-4">
      <div className="w-full max-w-md glass-card p-8 border border-slate-100 dark:border-slate-800 shadow-premium relative">

        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:text-sky-400">
            <KeyRound className="h-7 w-7" />
          </span>
          <h2 className="text-2xl font-extrabold text-text-primary dark:text-white tracking-tight">
            Portal Access
          </h2>
          <p className="text-xs text-text-secondary dark:text-slate-400">
            Sign in with your credentials to continue
          </p>
        </div>

        {attempts >= 3 && attempts < 5 && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 text-amber-600 dark:text-amber-400 flex gap-2 items-center text-xs font-semibold">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>Warning: {5 - attempts} login attempt{5 - attempts !== 1 ? 's' : ''} remaining before lockout.</span>
          </div>
        )}
        {attempts >= 5 && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 text-red-500 flex gap-2 items-center text-xs font-semibold">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>Lockout active. Too many failed attempts.</span>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1.5">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-secondary dark:text-slate-500">
                <User className="h-4 w-4" />
              </span>
              <input
                id="signin-username"
                type="text"
                value={siUsername}
                onChange={(e) => setSiUsername(e.target.value)}
                placeholder="Enter your username"
                className={inputClass}
                disabled={attempts >= 5}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-secondary dark:text-slate-500">
                <KeyRound className="h-4 w-4" />
              </span>
              <input
                id="signin-password"
                type={siShowPassword ? 'text' : 'password'}
                value={siPassword}
                onChange={(e) => setSiPassword(e.target.value)}
                placeholder="••••••••"
                className={`${inputClass} pr-10`}
                disabled={attempts >= 5}
                required
              />
              <button
                type="button"
                onClick={() => setSiShowPassword(!siShowPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-secondary hover:text-text-primary dark:text-slate-500 dark:hover:text-white transition-colors"
                disabled={attempts >= 5}
              >
                {siShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            id="signin-submit"
            type="submit"
            disabled={siLoading || attempts >= 5}
            className="w-full h-11 mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all shadow-soft shadow-primary/15 active:scale-[.98] disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            {siLoading ? 'Verifying...' : 'Sign In to Portal'}
          </button>
        </form>

        <p className="text-center text-xs text-text-secondary dark:text-slate-500 mt-6">
          Don't have an account? Contact your administrator.
        </p>
      </div>
    </div>
  );
};

export default Login;
