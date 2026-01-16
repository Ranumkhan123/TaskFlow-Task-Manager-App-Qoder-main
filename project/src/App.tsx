import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PomodoroProvider } from './context/PomodoroContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import TaskForm from './pages/TaskForm';
import Profile from './pages/Profile';
import Activity from './pages/Activity'; // Import the new Activity page
import WeeklyCalendar from './pages/WeeklyCalendar'; // Import the new Weekly Calendar page
import Layout from './components/Layout';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Set the document title to 'TaskFlow'
  useEffect(() => {
    document.title = 'TaskFlow';
  }, []);

  // Handle navigation based on authentication state
  useEffect(() => {
    if (user) {
      // When user logs in, navigate to dashboard
      setCurrentPage('dashboard');
    } else if (!user && !loading) {
      // When user logs out (no user and not loading), ensure we reset the page state
      // This will cause the login page to be shown
    }
  }, [user, loading]);

  const handleNavigate = (page: string, taskId?: string) => {
    setCurrentPage(page);
    if (taskId) {
      setEditTaskId(taskId);
    } else {
      setEditTaskId(null);
    }
  };

  const handleEditTask = (taskId: string | null) => {
    setEditTaskId(taskId);
    setCurrentPage('edit-task');
  };

  const handleLogout = () => {
    // When logout is initiated, we don't need to do anything here
    // The AuthContext will handle clearing the user and token
    // The useEffect will handle the navigation when user becomes null
  };

  const handleTaskSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Function to trigger a refresh when user profile is updated
  const handleProfileUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout}>
      {currentPage === 'dashboard' && (
        <Dashboard key={refreshTrigger} onNavigate={handleNavigate} />
      )}
      {currentPage === 'tasks' && (
        <TaskList key={refreshTrigger} onNavigate={handleNavigate} onEditTask={handleEditTask} />
      )}
      {(currentPage === 'new-task' || currentPage === 'edit-task') && (
        <TaskForm
          onNavigate={handleNavigate}
          editTaskId={editTaskId}
          onTaskSaved={handleTaskSaved}
        />
      )}
      {currentPage === 'profile' && <Profile onNavigate={handleNavigate} onProfileUpdated={handleProfileUpdated} />}
      {currentPage === 'activity' && <Activity onNavigate={handleNavigate} />} {/* Pass onNavigate to Activity page */}
    {currentPage === 'weekly-calendar' && <WeeklyCalendar onNavigate={handleNavigate} />}
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PomodoroProvider>
          <AppContent />
        </PomodoroProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;