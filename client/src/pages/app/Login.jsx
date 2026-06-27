import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { KeyRound, User, Eye, EyeOff, ShieldAlert, UserPlus, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = ({ setViewMode }) => {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState('signin'); // 'signin' | 'signup'

  // Sign In state
  const [siUsername, setSiUsername] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [siShowPassword, setSiShowPassword] = useState(false);
  const [siLoading, setSiLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Sign Up state
  const [suUsername, setSuUsername] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [suShowPassword, setSuShowPassword] = useState(false);
  const [suShowConfirm, setSuShowConfirm] = useState(false);
  const [suLoading, setSuLoading] = useState(false);
  const [suErrors, setSuErrors] = useState({});

  /* ---- Sign In ---- */
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

  /* ---- Sign Up ---- */
  const validateSignup = () => {
    const errors = {};
    if (!suUsername || suUsername.length < 3) errors.username = 'Username must be at least 3 characters.';
    if (!/^[a-zA-Z0-9_]+$/.test(suUsername)) errors.username = 'Only letters, numbers, and underscores allowed.';
    if (!suPassword || suPassword.length < 6) errors.password = 'Password must be at least 6 characters.';
    if (suPassword !== suConfirm) errors.confirm = 'Passwords do not match.';
    return errors;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const errors = validateSignup();
    if (Object.keys(errors).length > 0) {
      setSuErrors(errors);
      return;
    }
    setSuErrors({});
    setSuLoading(true);
    try {
      const res = await signup(suUsername, suPassword);
      if (res.success) {
        toast.success(`Welcome, ${res.data.user.username}! Your account has been created.`);
        setViewMode('app');
      } else {
        toast.error(res.message || 'Registration failed.');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setSuLoading(false);
    }
  };

  const inputClass =
    'w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';
  const inputErrorClass =
    'w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-red-400 dark:border-red-500 bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-red-300/30 focus:border-red-400 transition-all';

  return (
    <div className="min-h-[80vh] flex items-center justify-center font-sans animate-fade-in p-4">
      <div className="w-full max-w-md glass-card p-8 border border-slate-100 dark:border-slate-800 shadow-premium relative">

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:text-sky-400">
            <KeyRound className="h-6 w-6" />
          </span>
          <h2 className="text-2xl font-extrabold text-text-primary dark:text-white tracking-tight">
            Portal Access
          </h2>
          <p className="text-xs text-text-secondary dark:text-slate-400">
            Sign in or create a staff account to continue
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/60 p-1 mb-6 gap-1">
          <button
            type="button"
            onClick={() => setTab('signin')}
            className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-semibold transition-all ${
              tab === 'signin'
                ? 'bg-white dark:bg-slate-700 text-primary dark:text-sky-400 shadow-sm'
                : 'text-text-secondary dark:text-slate-400 hover:text-text-primary dark:hover:text-white'
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-semibold transition-all ${
              tab === 'signup'
                ? 'bg-white dark:bg-slate-700 text-primary dark:text-sky-400 shadow-sm'
                : 'text-text-secondary dark:text-slate-400 hover:text-text-primary dark:hover:text-white'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Sign Up
          </button>
        </div>

        {/* ===== SIGN IN ===== */}
        {tab === 'signin' && (
          <>
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
                    placeholder="e.g. admin"
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
          </>
        )}

        {/* ===== SIGN UP ===== */}
        {tab === 'signup' && (
          <>
            <div className="mb-4 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900 text-sky-600 dark:text-sky-400 text-xs font-medium leading-relaxed">
              New accounts are created with <span className="font-bold">Staff</span> role. Admins are promoted manually by the administrator.
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1.5">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-secondary dark:text-slate-500">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    id="signup-username"
                    type="text"
                    value={suUsername}
                    onChange={(e) => { setSuUsername(e.target.value); setSuErrors(p => ({ ...p, username: undefined })); }}
                    placeholder="Choose a username"
                    className={suErrors.username ? inputErrorClass : inputClass}
                    required
                  />
                </div>
                {suErrors.username && <p className="mt-1 text-xs text-red-500">{suErrors.username}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-secondary dark:text-slate-500">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <input
                    id="signup-password"
                    type={suShowPassword ? 'text' : 'password'}
                    value={suPassword}
                    onChange={(e) => { setSuPassword(e.target.value); setSuErrors(p => ({ ...p, password: undefined })); }}
                    placeholder="At least 6 characters"
                    className={`${suErrors.password ? inputErrorClass : inputClass} pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setSuShowPassword(!suShowPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-secondary hover:text-text-primary dark:text-slate-500 dark:hover:text-white transition-colors"
                  >
                    {suShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {suErrors.password && <p className="mt-1 text-xs text-red-500">{suErrors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-secondary dark:text-slate-500">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <input
                    id="signup-confirm"
                    type={suShowConfirm ? 'text' : 'password'}
                    value={suConfirm}
                    onChange={(e) => { setSuConfirm(e.target.value); setSuErrors(p => ({ ...p, confirm: undefined })); }}
                    placeholder="Re-enter your password"
                    className={`${suErrors.confirm ? inputErrorClass : inputClass} pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setSuShowConfirm(!suShowConfirm)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-secondary hover:text-text-primary dark:text-slate-500 dark:hover:text-white transition-colors"
                  >
                    {suShowConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {suErrors.confirm && <p className="mt-1 text-xs text-red-500">{suErrors.confirm}</p>}
              </div>

              <button
                id="signup-submit"
                type="submit"
                disabled={suLoading}
                className="w-full h-11 mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all shadow-soft shadow-primary/15 active:scale-[.98] disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4" />
                {suLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
