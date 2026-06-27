import React from 'react';
import Sidebar from './Sidebar.jsx';

const Layout = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-brandBg dark:bg-slate-950 transition-colors duration-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main offset grid */}
      <div className="md:pl-64">
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
