import React, { useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Layout from './components/Layout.jsx';
import { Toaster } from 'react-hot-toast';

// Public website components
import Home from './pages/website/Home.jsx';
import About from './pages/website/About.jsx';
import Contact from './pages/website/Contact.jsx';

// Portal components
import Login from './pages/app/Login.jsx';
import Dashboard from './pages/app/Dashboard.jsx';
import Medicines from './pages/app/Medicines.jsx';
import POS from './pages/app/POS.jsx';
import AuditLogs from './pages/app/AuditLogs.jsx';

function App() {
  const { user, loading } = useAuth();
  const [viewMode, setViewMode] = useState('website'); // 'website' or 'app'
  const [activeSection, setActiveSection] = useState('home'); // 'home', 'about', 'contact'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'medicines', 'pos', 'audit'

  if (loading) {
    return (
      <div className="min-h-screen bg-brandBg dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="text-xs font-bold text-text-secondary dark:text-slate-400">Loading Grace Medical Hall...</span>
        </div>
      </div>
    );
  }

  // 1. Public Front-end Website
  if (viewMode === 'website') {
    return (
      <div className="min-h-screen bg-brandBg dark:bg-slate-950 transition-colors duration-200">
        <Navbar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          viewMode={viewMode} 
          setViewMode={setViewMode} 
        />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {activeSection === 'home' && <Home setActiveSection={setActiveSection} />}
          {activeSection === 'about' && <About />}
          {activeSection === 'contact' && <Contact />}
        </main>
        <Toaster position="bottom-right" />
      </div>
    );
  }

  // 2. Portal Access (Forces Authentication check)
  if (!user) {
    return (
      <div className="min-h-screen bg-brandBg dark:bg-slate-950 transition-colors duration-200">
        <Navbar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          viewMode={viewMode} 
          setViewMode={setViewMode} 
        />
        <Login setViewMode={setViewMode} />
        <Toaster position="bottom-right" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brandBg dark:bg-slate-950 transition-colors duration-200">
      <Navbar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
      />
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'medicines' && <Medicines />}
        {activeTab === 'pos' && <POS />}
        {activeTab === 'audit' && <AuditLogs />}
      </Layout>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
