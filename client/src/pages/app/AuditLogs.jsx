import React, { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { SkeletonTable } from '../../components/Skeleton.jsx';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard');
      if (res.data && res.data.success) {
        setLogs(res.data.data.recentActivity || []);
      }
    } catch (error) {
      toast.error('Failed to retrieve system audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-primary" />
            <span>Security Audit Logs</span>
          </h1>
          <p className="text-xs text-text-secondary dark:text-slate-400">Track data modifications, user sessions, and POS billing</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-secondary hover:text-text-primary dark:hover:text-white transition-all active:scale-95"
          title="Refresh Log list"
        >
          <RefreshCw className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <SkeletonTable rows={10} cols={6} />
      ) : (
        <div className="w-full overflow-hidden glass-card border border-slate-100 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-text-secondary dark:text-slate-400 font-semibold text-xs tracking-wider uppercase">
                  <th className="p-4">User Account</th>
                  <th className="p-4">System Role</th>
                  <th className="p-4">Event</th>
                  <th className="p-4">Table / Model</th>
                  <th className="p-4">Action Summary</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 text-text-primary dark:text-white capitalize font-bold">
                        {log.user?.username || 'System'}
                      </td>
                      <td className="p-4 text-xs">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                          log.user?.role === 'admin' 
                            ? 'bg-primary/10 text-primary dark:text-sky-400' 
                            : 'bg-slate-100 dark:bg-slate-800 text-text-secondary dark:text-slate-400'
                        }`}>
                          {log.user?.role || 'Guest'}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-semibold capitalize text-text-primary dark:text-white">
                        {log.action}
                      </td>
                      <td className="p-4 text-xs font-mono text-text-secondary dark:text-slate-400">
                        {log.collectionName}
                      </td>
                      <td className="p-4 text-xs text-text-secondary dark:text-slate-300">
                        {log.details}
                      </td>
                      <td className="p-4 text-xs text-text-secondary dark:text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-xs text-text-secondary dark:text-slate-400">
                      No security audit logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AuditLogs;
