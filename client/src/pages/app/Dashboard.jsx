import React, { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { 
  SkeletonCard, 
  SkeletonChart, 
  SkeletonTable 
} from '../../components/Skeleton.jsx';
import { 
  TrendingUp, 
  AlertTriangle, 
  History, 
  Database, 
  FileSpreadsheet, 
  ArrowUpRight,
  TrendingDown,
  DollarSign,
  Package,
  CalendarCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/dashboard');
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to retrieve dashboard analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const downloadJSONBackup = async () => {
    try {
      const medRes = await api.get('/medicines?limit=1000');
      const salesRes = await api.get('/sales?limit=1000');
      
      const backup = {
        exportedAt: new Date().toISOString(),
        medicines: medRes.data.data.medicines,
        sales: salesRes.data.data.sales
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `grace_medical_hall_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('System JSON backup generated and downloaded!');
    } catch (error) {
      toast.error('Failed to compile database backup.');
    }
  };

  const downloadSalesCSV = async () => {
    try {
      const res = await api.get('/sales?limit=1000');
      const sales = res.data.data.sales;

      let csv = "Sale ID,Date,Sold By,Payment,Total Price (NPR),Items Quantity\n";
      sales.forEach(sale => {
        const qty = sale.items.reduce((sum, i) => sum + i.quantity, 0);
        csv += `${sale._id},${new Date(sale.createdAt).toLocaleString()},${sale.soldBy?.username || 'Staff'},${sale.paymentMethod},${sale.totalPrice},${qty}\n`;
      });

      const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `grace_medical_hall_sales_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Sales CSV report generated and downloaded!');
    } catch (error) {
      toast.error('Failed to compile CSV report.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonChart />
          </div>
          <div>
            <SkeletonCard />
          </div>
        </div>
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  const { stats, lowStockList, expiringSoonList, recentActivity, chartData, topSelling } = data;

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Page Title & Backups Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary dark:text-white tracking-tight">System Dashboard</h1>
          <p className="text-xs text-text-secondary dark:text-slate-400">Real-time sales, inventory logs, and system operations</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={downloadJSONBackup}
            className="flex items-center gap-2 px-3.5 h-10 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-primary dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all"
          >
            <Database className="h-4 w-4 text-primary" />
            <span>DB Backup</span>
          </button>
          <button 
            onClick={downloadSalesCSV}
            className="flex items-center gap-2 px-3.5 h-10 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-primary dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 1. Summary Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Sales Today */}
        <div className="glass-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-text-secondary dark:text-slate-400 font-semibold uppercase tracking-wider">Sales Today</p>
            <h3 className="text-2xl font-black text-text-primary dark:text-white">Rs. {stats.salesToday.toFixed(2)}</h3>
            <p className="text-[10px] text-text-secondary dark:text-slate-400">{stats.transactionsToday} bills generated</p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-primary">
            <TrendingUp className="h-6 w-6" />
          </span>
        </div>

        {/* Monthly Revenue */}
        <div className="glass-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-text-secondary dark:text-slate-400 font-semibold uppercase tracking-wider">This Month</p>
            <h3 className="text-2xl font-black text-text-primary dark:text-white">Rs. {stats.monthlyRevenue.toFixed(2)}</h3>
            <p className="text-[10px] text-green-500 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" />
              <span>Target Achieved</span>
            </p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <DollarSign className="h-6 w-6" />
          </span>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-text-secondary dark:text-slate-400 font-semibold uppercase tracking-wider">Low Stock</p>
            <h3 className="text-2xl font-black text-text-primary dark:text-white">{stats.lowStockCount} Items</h3>
            <p className="text-[10px] text-text-secondary dark:text-slate-400">Needs replenishment</p>
          </div>
          <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stats.lowStockCount > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-100 text-slate-400'}`}>
            <Package className="h-6 w-6" />
          </span>
        </div>

        {/* Expiring Medicines */}
        <div className="glass-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-text-secondary dark:text-slate-400 font-semibold uppercase tracking-wider">Expiring / Expired</p>
            <h3 className="text-2xl font-black text-text-primary dark:text-white">{stats.expiringSoonCount} / {stats.expiredCount}</h3>
            <p className="text-[10px] text-danger font-semibold">Blocked from billing</p>
          </div>
          <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stats.expiredCount > 0 ? 'bg-red-500/10 text-red-500' : 'bg-slate-100 text-slate-400'}`}>
            <AlertTriangle className="h-6 w-6" />
          </span>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Sales Last 7 Days Area Chart */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-text-primary dark:text-white">Revenue Analysis</h3>
            <p className="text-xs text-text-secondary dark:text-slate-400">Sales volume (NPR) recorded in the last 7 days</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="formattedDate" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue (Rs)" stroke="#0EA5E9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Medicines */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-text-primary dark:text-white mb-1">Top Selling Items</h3>
            <p className="text-xs text-text-secondary dark:text-slate-400 mb-4">Highest volume dispensed medicines</p>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {topSelling.length > 0 ? (
                topSelling.map((med, index) => (
                  <div key={med._id} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <h4 className="font-bold text-text-primary dark:text-white capitalize">{med.name}</h4>
                      <p className="text-[10px] text-text-secondary dark:text-slate-400">{med.company} | Batch: {med.batchNo}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:text-sky-400 text-xs font-bold">
                        {med.quantitySold} units
                      </span>
                      <p className="text-[10px] text-text-secondary dark:text-slate-400 mt-1">Rs. {med.revenue.toFixed(1)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-text-secondary dark:text-slate-400">
                  No sales recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Alerts and Activity Logs */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Critical Alerts Panel */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Critical Alerts</span>
          </h3>

          <div className="space-y-3">
            {/* Low stock indicators */}
            {lowStockList.map(med => (
              <div key={med._id} className="p-3 rounded-xl border border-amber-100 dark:border-amber-950 bg-amber-500/5 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-text-primary dark:text-white capitalize">{med.name}</span>
                  <span className="text-[10px] text-text-secondary dark:text-slate-400 block">Batch: {med.batchNo}</span>
                </div>
                <span className="text-amber-600 dark:text-amber-400 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded-md">
                  Low Stock ({med.stock})
                </span>
              </div>
            ))}

            {/* Expiring indicators */}
            {expiringSoonList.map(med => (
              <div key={med._id} className="p-3 rounded-xl border border-red-100 dark:border-red-950 bg-red-500/5 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-text-primary dark:text-white capitalize">{med.name}</span>
                  <span className="text-[10px] text-text-secondary dark:text-slate-400 block">Exp Date: {new Date(med.expiryDate).toLocaleDateString()}</span>
                </div>
                <span className="text-danger font-extrabold bg-red-500/10 px-2 py-0.5 rounded-md">
                  Expires Soon
                </span>
              </div>
            ))}

            {lowStockList.length === 0 && expiringSoonList.length === 0 && (
              <div className="text-center py-10 text-xs text-text-secondary dark:text-slate-400">
                All inventory parameters healthy! No critical alerts active.
              </div>
            )}
          </div>
        </div>

        {/* Audit / Recent Activity Log */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2 mb-4">
              <History className="h-5 w-5 text-primary" />
              <span>Activity Log</span>
            </h3>

            <div className="space-y-3">
              {recentActivity.slice(0, 5).map(log => (
                <div key={log._id} className="flex gap-3 text-xs leading-tight">
                  <div className="relative flex h-2 w-2 shrink-0 items-center justify-center rounded-full bg-primary mt-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-30"></span>
                  </div>
                  <div>
                    <p className="text-text-primary dark:text-white">
                      <span className="font-bold capitalize">{log.user?.username}</span>: {log.details}
                    </p>
                    <span className="text-[10px] text-text-secondary dark:text-slate-400 block mt-0.5">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}

              {recentActivity.length === 0 && (
                <div className="text-center py-10 text-xs text-text-secondary dark:text-slate-400">
                  No system logs recorded.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
