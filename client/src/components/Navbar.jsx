import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Sun, Moon, LogIn, LayoutDashboard, Globe } from 'lucide-react';

const Navbar = ({ activeSection, setActiveSection, viewMode, setViewMode }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo and Nepal Location Tagline */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => { setViewMode('website'); setActiveSection('home'); }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white text-xl font-bold shadow-soft">
              💊
            </span>
            <div>
              <span className="text-lg font-extrabold text-text-primary tracking-tight bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent dark:from-sky-400 dark:to-sky-200">
                Grace Medical Hall
              </span>
              <p className="text-[10px] text-text-secondary leading-none dark:text-slate-400 font-medium">Panchkhal-12, Kavre, Nepal</p>
            </div>
          </div>

          {/* Navigation Links for Public Landing Pages */}
          {viewMode === 'website' && (
            <div className="hidden md:flex space-x-8">
              {['home', 'about', 'contact'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`text-sm font-semibold capitalize transition-all duration-200 border-b-2 px-1 py-4 ${
                    activeSection === section
                      ? 'border-primary text-primary dark:text-sky-400'
                      : 'border-transparent text-text-secondary hover:text-primary dark:text-slate-300 dark:hover:text-sky-300'
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          )}

          {/* Action buttons (Theme and Portal Access) */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-text-secondary hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <button
                onClick={() => setViewMode(viewMode === 'app' ? 'website' : 'app')}
                className="flex items-center gap-2 px-4 h-10 rounded-xl bg-primary text-white hover:bg-primary-dark font-semibold text-sm transition-all shadow-soft active:scale-95"
              >
                {viewMode === 'app' ? (
                  <>
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">Public Website</span>
                  </>
                ) : (
                  <>
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Enter Portal</span>
                    <span className="sm:hidden">Portal</span>
                  </>
                )}
              </button>
            ) : (
              viewMode === 'website' && (
                <button
                  onClick={() => setViewMode('app')}
                  className="flex items-center gap-2 px-4 h-10 rounded-xl bg-primary text-white hover:bg-primary-dark font-semibold text-sm transition-all shadow-soft active:scale-95"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Portal Login</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
