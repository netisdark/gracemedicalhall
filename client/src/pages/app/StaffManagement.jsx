import React, { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Users, UserPlus, Trash2, KeyRound, User, Eye, EyeOff, X, RefreshCw, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const inputCls = 'w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all';

const StaffManagement = () => {
  const { user: currentUser } = useAuth();

  // Users list
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Register staff modal
  const [registerOpen, setRegisterOpen] = useState(false);
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regShowPw, setRegShowPw] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  // Profile update modal
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileTarget, setProfileTarget] = useState(null); // user object
  const [profUsername, setProfUsername] = useState('');
  const [profCurrentPw, setProfCurrentPw] = useState('');
  const [profNewPw, setProfNewPw] = useState('');
  const [profShowNew, setProfShowNew] = useState(false);
  const [profLoading, setProfLoading] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/auth/users');
      if (res.data?.success) setUsers(res.data.data.users);
    } catch {
      toast.error('Failed to load user accounts.');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regPassword !== regConfirm) { toast.error('Passwords do not match.'); return; }
    setRegLoading(true);
    try {
      const res = await api.post('/auth/register-staff', { username: regUsername, password: regPassword, confirmPassword: regConfirm });
      if (res.data?.success) {
        toast.success(`Staff account "${regUsername}" created.`);
        setRegisterOpen(false);
        setRegUsername(''); setRegPassword(''); setRegConfirm('');
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Remove staff account "${username}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/auth/users/${userId}`);
      toast.success(`Account "${username}" removed.`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove account.');
    }
  };

  const openProfileEdit = (u) => {
    setProfileTarget(u);
    setProfUsername(u.username);
    setProfCurrentPw(''); setProfNewPw('');
    setProfileOpen(true);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfLoading(true);
    try {
      const payload = { targetUserId: profileTarget.id || profileTarget._id };
      if (profUsername && profUsername !== profileTarget.username) payload.username = profUsername;
      if (profNewPw) { payload.newPassword = profNewPw; payload.currentPassword = profCurrentPw; }
      const res = await api.put('/auth/profile', payload);
      if (res.data?.success) {
        toast.success('Profile updated successfully.');
        setProfileOpen(false);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Profile update failed.');
    } finally {
      setProfLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary dark:text-white tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Staff Management
          </h1>
          <p className="text-xs text-text-secondary dark:text-slate-400 mt-1">
            Register staff accounts, manage credentials, and assign access
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchUsers} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-secondary hover:text-text-primary transition-all active:scale-95">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setRegisterOpen(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all shadow-soft shadow-primary/20 active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            Register Staff
          </button>
        </div>
      </div>

      {/* My Profile card */}
      <div className="glass-card border border-slate-100 dark:border-slate-800 p-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary dark:text-sky-400" />
          </div>
          <div>
            <p className="font-bold text-text-primary dark:text-white capitalize">{currentUser?.username}</p>
            <p className="text-[10px] font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider">{currentUser?.role} · My Account</p>
          </div>
        </div>
        <button
          onClick={() => openProfileEdit({ _id: currentUser?.id, username: currentUser?.username, role: currentUser?.role })}
          className="flex items-center gap-2 px-3 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-text-secondary text-xs font-semibold transition-all"
        >
          <KeyRound className="h-3.5 w-3.5" />
          Edit My Profile
        </button>
      </div>

      {/* Users table */}
      <div className="w-full overflow-hidden glass-card border border-slate-100 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-text-secondary dark:text-slate-400 font-semibold text-xs tracking-wider uppercase">
                <th className="p-4">Username</th>
                <th className="p-4">Role</th>
                <th className="p-4">Registered</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loadingUsers ? (
                <tr><td colSpan={4} className="p-8 text-center text-xs text-text-secondary animate-pulse">Loading accounts...</td></tr>
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 font-bold text-text-primary dark:text-white capitalize flex items-center gap-2">
                      <User className="h-4 w-4 text-text-secondary" />
                      {u.username}
                      {u._id === currentUser?.id && <span className="text-[10px] bg-primary/10 text-primary dark:text-sky-400 px-1.5 py-0.5 rounded font-bold">You</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        u.role === 'admin' ? 'bg-primary/10 text-primary dark:text-sky-400' : 'bg-slate-100 dark:bg-slate-800 text-text-secondary dark:text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-text-secondary dark:text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openProfileEdit(u)}
                          className="p-1.5 rounded-lg text-text-secondary hover:bg-slate-100 hover:text-text-primary dark:hover:bg-slate-800 dark:hover:text-white transition-all"
                          title="Edit credentials"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        {u.role !== 'admin' && u._id !== currentUser?.id && (
                          <button
                            onClick={() => handleDelete(u._id, u.username)}
                            className="p-1.5 rounded-lg text-danger hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                            title="Remove account"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="p-12 text-center text-xs text-text-secondary dark:text-slate-400">No user accounts found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Staff Modal */}
      {registerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setRegisterOpen(false)} />
          <div className="w-full max-w-md glass-card border border-slate-100 dark:border-slate-800 shadow-premium p-6 relative z-10 animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-text-primary dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Register Staff Account
              </h3>
              <button onClick={() => setRegisterOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input type="text" value={regUsername} onChange={e => setRegUsername(e.target.value)} className={`${inputCls} pl-10`} placeholder="Staff username" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input type={regShowPw ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)} className={`${inputCls} pl-10 pr-10`} placeholder="Min. 6 characters" required />
                  <button type="button" onClick={() => setRegShowPw(!regShowPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
                    {regShowPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">Confirm Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input type="password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} className={`${inputCls} pl-10`} placeholder="Re-enter password" required />
                </div>
              </div>
              <button type="submit" disabled={regLoading} className="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all active:scale-98 disabled:opacity-50">
                {regLoading ? 'Creating...' : 'Create Staff Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {profileOpen && profileTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setProfileOpen(false)} />
          <div className="w-full max-w-md glass-card border border-slate-100 dark:border-slate-800 shadow-premium p-6 relative z-10 animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-text-primary dark:text-white flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                Update Profile — <span className="capitalize">{profileTarget.username}</span>
              </h3>
              <button onClick={() => setProfileOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">New Username (optional)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input type="text" value={profUsername} onChange={e => setProfUsername(e.target.value)} className={`${inputCls} pl-10`} />
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <p className="text-xs font-semibold text-text-secondary dark:text-slate-400 mb-3">Change Password (optional)</p>
                <div className="space-y-3">
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <input type="password" value={profCurrentPw} onChange={e => setProfCurrentPw(e.target.value)} placeholder="Current password" className={`${inputCls} pl-10`} />
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <input type={profShowNew ? 'text' : 'password'} value={profNewPw} onChange={e => setProfNewPw(e.target.value)} placeholder="New password" className={`${inputCls} pl-10 pr-10`} />
                    <button type="button" onClick={() => setProfShowNew(!profShowNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
                      {profShowNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={profLoading} className="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all active:scale-98 disabled:opacity-50">
                {profLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
