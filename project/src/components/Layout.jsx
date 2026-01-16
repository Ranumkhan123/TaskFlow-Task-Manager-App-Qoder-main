import { useState } from 'react';
import { CheckSquare, LayoutDashboard, ListTodo, Plus, User, LogOut, Menu, X, Sun, Moon, ChevronDown, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Layout({ children, currentPage, onNavigate, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    if (onLogout) {
      onLogout();
    }
    setDropdownOpen(false); // Close dropdown after logout
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, testId: 'nav-dashboard' },
    { id: 'tasks', label: 'Task List', icon: ListTodo, testId: 'nav-task-list' },
    { id: 'new-task', label: 'New Task', icon: Plus, testId: 'nav-new-task' },
    { id: 'weekly-calendar', label: 'Weekly Calendar', icon: LayoutDashboard, testId: 'nav-weekly-calendar' }, // Add weekly calendar to menu
    { id: 'activity', label: 'Recent Activity', icon: Activity, testId: 'nav-activity' }, // Add activity to menu
    { id: 'profile', label: 'Profile', icon: User, testId: 'nav-profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              id="sidebar-toggle-button"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white" id="header-app-name">
                TaskFlow
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              id="theme-toggle-button"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            
            {/* User dropdown */}
            <div className="relative" id="user-info">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">
                  {user?.name}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    id="nav-logout"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {sidebarOpen && (
          <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 min-h-[calc(100vh-57px)]" id="sidebar">
            <nav className="p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    id={item.testId}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        )}

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-4">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm" id="footer-text">
            © 2024 TaskFlow. All rights reserved.
            <br />
            Built by Ranum Khan to help you focus, plan, and conquer your tasks!
          </p>
        </div>
      </footer>
    </div>
  );
}