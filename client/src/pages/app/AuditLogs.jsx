import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/client.js';
import { SkeletonTable } from '../../components/Skeleton.jsx';
import { ShieldAlert, RefreshCw, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';

const EVENT_TYPES = ['login', 'create', 'update', 'delete', 'signup'];
const COLLECTIONS = ['User', 'Medicine', 'Sale'];

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [action, setAction] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit', {
        params: { action: action || undefined, collectionName: collectionName || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }
      });
      if (res.data?.success) {
        setLogs(res.data.data.logs || []);
        setTotal(res.data.data.total || 0);
      }
    } catch {
      toast.error('Failed to retrieve audit logs.');
    } finally {
      setLoading(false);
    }
  }, [action, collectionName, dateFrom, dateTo]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const clearFilters = () => {
    setAction(''); setCollectionName(''); setDateFrom(''); setDateTo('');
  };

  const hasFilters = action || collectionName || dateFrom || dateTo;

  const selectCls = 'h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all';

  return (
    <div className="space-y-6 font-sans">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-primary" />
            Security Audit Logs
          </h1>
          <p className="text-xs text-text-secondary dark:text-slate-400 mt-1">
            {total} event{total !== 1 ? 's' : ''} found · Track data modifications, user sessions, and POS billing
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-secondary hover:text-text-primary dark:hover:text-white transition-all active:scale-95"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Filters Panel */}
      <div className="glass-card border border-slate-100 dark:border-slate-800 p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex items-center gap-2 text-xs font-bold text-text-secondary dark:text-slate-400 shrink-0">
            <Filter className="h-4 w-4" />
            Filters:
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-text-secondary dark:text-slate-500 uppercase tracking-wider">Event Type</label>
            <select value={action} onChange={(e) => setAction(e.target.value)} className={selectCls}>
              <option value="">All Events</option>
              {EVENT_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-text-secondary dark:text-slate-500 uppercase tracking-wider">Collection</label>
            <select value={collectionName} onChange={(e) => setCollectionName(e.target.value)} className={selectCls}>
              <option value="">All Collections</option>
              {COLLECTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-text-secondary dark:text-slate-500 uppercase tracking-wider">Date From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={selectCls} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-text-secondary dark:text-slate-500 uppercase tracking-wider">Date To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={selectCls} />
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="h-9 flex items-center gap-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-text-secondary dark:text-slate-400 hover:text-danger dark:hover:text-red-400 text-xs font-semibold transition-all">
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
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
                  <th className="p-4">Collection</th>
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
                      <td className="p-4 text-xs">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                          log.action === 'delete' ? 'bg-red-500/10 text-red-500'
                          : log.action === 'create' ? 'bg-emerald-500/10 text-emerald-500'
                          : log.action === 'update' ? 'bg-amber-500/10 text-amber-500'
                          : log.action === 'login' ? 'bg-primary/10 text-primary dark:text-sky-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-text-secondary'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-mono text-text-secondary dark:text-slate-400">{log.collectionName}</td>
                      <td className="p-4 text-xs text-text-secondary dark:text-slate-300">{log.details}</td>
                      <td className="p-4 text-xs text-text-secondary dark:text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-xs text-text-secondary dark:text-slate-400">
                      No audit logs match the current filters.
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
