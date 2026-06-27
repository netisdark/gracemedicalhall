import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { LayoutDashboard, Pill, ShoppingCart, ShieldAlert, LogOut, User } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'staff'] },
    { id: 'medicines', name: 'Inventory', icon: Pill, roles: ['admin', 'staff'] },
    { id: 'pos', name: 'POS Billing', icon: ShoppingCart, roles: ['admin', 'staff'] },
    { id: 'audit', name: 'Audit Logs', icon: ShieldAlert, roles: ['admin'] }
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 border-r border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900 transition-colors duration-200 z-40 hidden md:flex flex-col justify-between py-6 px-4">
      <div className="flex flex-col gap-6">
        
        {/* Logged in User Profile Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-brandBg dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-sky-400">
            <User className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-text-primary dark:text-white capitalize truncate">
              {user?.username}
            </h4>
            <p className="text-[10px] text-text-secondary dark:text-slate-400 font-bold tracking-wider uppercase">
              {user?.role} Portal
            </p>
          </div>
        </div>

        {/* Navigation Sidebar Options */}
        <nav className="flex flex-col gap-1">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  activeTab === item.id
                    ? 'bg-primary text-white shadow-soft shadow-primary/20'
                    : 'text-text-secondary hover:bg-slate-100 hover:text-text-primary dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout button at bottom */}
      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-danger hover:bg-red-50 dark:hover:bg-red-950/20 transition-all active:scale-95 duration-100"
      >
        <LogOut className="h-5 w-5 shrink-0" />
        <span>Log Out</span>
      </button>
    </aside>
  );
};

export default Sidebar;
