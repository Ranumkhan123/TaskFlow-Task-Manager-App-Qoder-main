import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, ListChecks, ChevronDown, ChevronUp, Activity, Play, Pause, RotateCcw } from 'lucide-react';
import { usePomodoro } from '../context/PomodoroContext';
import { useAuth } from '../context/AuthContext';
import { getTaskStats, getTasks } from '../api/tasks';
import { getWeeklyTasks } from '../api/taskWeekly';

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState({
    total: false,    // Cards start collapsed by default
    completed: false,
    pending: false,
    inProgress: false
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState({ total: 0, completed: 0, pending: 0 });
  const { user, token } = useAuth(); // Get both user and token from auth context

  useEffect(() => {
    loadStats();
    loadRecentActivities();
    loadWeeklySummary();
  }, [token]); // Add token to dependency array to reload when token changes

  // Also add a useEffect to handle user changes if needed
  useEffect(() => {
    // When user changes (like after profile update), we might want to refresh data
    // This effect runs when user object changes
  }, [user]);

  // Get current week dates (Monday to Sunday)
  const getCurrentWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Calculate Monday (Sunday is 0, so we adjust accordingly)
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is Sunday
    const monday = new Date(today.setDate(diff));
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const loadWeeklySummary = async () => {
    try {
      const weekDates = getCurrentWeekDates();
      const startDate = weekDates[0].toISOString().split('T')[0];
      const endDate = weekDates[6].toISOString().split('T')[0];
      
      const weeklyData = await getWeeklyTasks(token, startDate, endDate);
      
      setWeeklySummary({
        total: weeklyData.total || 0,
        completed: weeklyData.completed || 0,
        pending: weeklyData.pending || 0
      });
    } catch (error) {
      console.error('Failed to load weekly summary:', error);
      // Set default values in case of error
      setWeeklySummary({ total: 0, completed: 0, pending: 0 });
    }
  };

  const loadStats = async () => {
    try {
      const data = await getTaskStats(token); // Use token from auth context
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivities = async () => {
    try {
      // Fetch tasks to get real activity from user's tasks
      const tasks = await getTasks(token);
      
      // Create activity entries based on real task data
      const activities = [];
      
      // Process each task to extract real activity
      tasks.forEach(task => {
        // Add creation activity
        if (task.createdAt) {
          activities.push({
            id: `${task.id}-create`,
            taskId: task.id,
            taskTitle: task.title,
            type: 'Created',
            timestamp: new Date(task.createdAt),
            description: `Created task: ${task.title}`
          });
        }
        
        // Add update activity if updatedAt exists and is different from createdAt
        if (task.updatedAt && task.updatedAt !== task.createdAt) {
          activities.push({
            id: `${task.id}-update`,
            taskId: task.id,
            taskTitle: task.title,
            type: 'Updated',
            timestamp: new Date(task.updatedAt),
            description: `Updated task: ${task.title}`
          });
        }
        
        // Add completion activity if status is Completed
        if (task.status === 'Completed' && task.updatedAt) {
          activities.push({
            id: `${task.id}-complete`,
            taskId: task.id,
            taskTitle: task.title,
            type: 'Completed',
            timestamp: new Date(task.updatedAt),
            description: `Completed task: ${task.title}`
          });
        }
      });
      
      // Sort activities by timestamp (newest first) and take top 5
      const sortedActivities = activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
      setRecentActivities(sortedActivities);
    } catch (error) {
      console.error('Failed to load recent activities:', error);
      // On error, set to empty array - no dummy data
      setRecentActivities([]);
    }
  };

  const toggleCard = (cardKey) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const timeDiff = now - date;
    const minutes = Math.floor(timeDiff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'Created':
        return 'text-green-600 dark:text-green-400';
      case 'Completed':
        return 'text-blue-600 dark:text-blue-400';
      case 'Updated':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const cards = [
    {
      key: 'total',
      title: 'Total Tasks',
      value: stats.total,
      icon: ListChecks,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
      testId: 'card-total-tasks',
      expandTestId: 'card-total-tasks-toggle',
      description: 'All tasks in your workspace'
    },
    {
      key: 'completed',
      title: 'Completed Tasks',
      value: stats.completed,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800',
      testId: 'card-completed-tasks',
      expandTestId: 'card-completed-tasks-toggle',
      description: 'Tasks that have been finished'
    },
    {
      key: 'pending',
      title: 'Pending Tasks',
      value: stats.pending,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      testId: 'card-pending-tasks',
      expandTestId: 'card-pending-tasks-toggle',
      description: 'Tasks waiting to be started'
    },
    {
      key: 'inProgress',
      title: 'In Progress Tasks',
      value: stats.inProgress,
      icon: AlertCircle,
      color: 'orange',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      borderColor: 'border-orange-200 dark:border-orange-800',
      testId: 'card-inprogress-tasks',
      expandTestId: 'card-inprogress-tasks-toggle',
      description: 'Tasks currently being worked on'
    }
  ];

  // Calculate percentages for the progress chart
  const calculatePercentages = () => {
    const total = stats.total || 1; // Avoid division by zero
    const completedPercent = Math.round((stats.completed / total) * 100);
    const pendingPercent = Math.round((stats.pending / total) * 100);
    const inProgressPercent = Math.round((stats.inProgress / total) * 100);
    
    return {
      completed: completedPercent,
      pending: pendingPercent,
      inProgress: inProgressPercent
    };
  };

  const percentages = calculatePercentages();



  // Use global Pomodoro context
  const { pomodoroState, startTimer, pauseTimer, resumeTimer, resetTimer, formatTime, calculateProgress } = usePomodoro();

  // Local state for notifications
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Handle notifications
  useEffect(() => {
    if (pomodoroState.remainingTime === 0 && pomodoroState.status === 'idle') {
      // Session completed
      const message = pomodoroState.mode === 'focus' 
        ? 'Focus session completed! Take a break.' 
        : 'Break completed! Back to focus.';
      setNotificationMessage(message);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  }, [pomodoroState.remainingTime, pomodoroState.status, pomodoroState.mode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600 dark:text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  // Extract user's first name to ensure re-rendering when user changes
  const userFirstName = user?.name?.split(' ')[0] || '';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Personalized greeting section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Hey {userFirstName}, Welcome to TaskFlow
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          This is an overview of your tasks and productivity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          const isExpanded = expandedCards[card.key];

          return (
            <div
              key={card.key}
              className={`${isExpanded ? `${card.bgColor} ${card.borderColor} border p-6` : 'border border-slate-200 dark:border-slate-700 p-4'} rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer`}
              id={card.testId}
            >
              <div className="flex items-center justify-between">
                <p className={`font-medium ${isExpanded ? 'text-slate-600 dark:text-slate-400 text-sm' : 'text-slate-900 dark:text-white'}`}>
                  {card.title}
                </p>
                <button
                  onClick={() => toggleCard(card.key)}
                  className={`p-1 rounded transition ${isExpanded ? `${card.iconColor} rotate-180` : 'text-slate-500 dark:text-slate-400'}`}
                  id={card.expandTestId}
                  aria-label={isExpanded ? `Collapse ${card.title}` : `Expand ${card.title}`}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-4 overflow-hidden transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 ${card.bgColor} rounded-lg`}>
                      <Icon className={`w-6 h-6 ${card.iconColor}`} />
                    </div>
                  </div>
                  <div>
                    <p className={`text-3xl font-bold ${card.iconColor} mt-2`}>
                      {card.value}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {card.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('new-task')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition text-sm hover:shadow-lg hover:scale-105"
            id="dashboard-create-task-button"
          >
            Create New Task
          </button>
          <button
            onClick={() => onNavigate('tasks')}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-lg transition text-sm hover:shadow-lg hover:scale-105"
            id="dashboard-view-tasks-button"
          >
            View All Tasks
          </button>
          <button
            onClick={() => onNavigate('weekly-calendar')}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-lg transition text-sm hover:shadow-lg hover:scale-105"
            id="quick-weekly-calendar"
          >
            Weekly Calendar
          </button>
          {/* Recent Activity Button - only showing button name without data preview */}
          <button
            onClick={() => onNavigate('activity')}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-lg transition text-sm flex items-center justify-center hover:shadow-lg hover:scale-105"
            id="dashboard-recent-activity-card"
          >
            <span>Recent Activity</span>
            <Activity className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mini Task Progress Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg hover:scale-102 transition-all duration-300">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Task Progress Overview
          </h3>
          <div className="flex items-center justify-center space-x-6">
            {/* Donut chart visualization */}
            <div className="relative w-32 h-32" id="task-progress-chart">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-200 dark:text-slate-700"
                />
                {/* Completed tasks arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#10B981"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${percentages.completed * 2.83} 283`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
                {/* In Progress tasks arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#F59E0B"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${percentages.inProgress * 2.83} 283`}
                  strokeDashoffset={-percentages.completed * 2.83}
                  strokeLinecap="round"
                />
                {/* Pending tasks arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#EF4444"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${percentages.pending * 2.83} 283`}
                  strokeDashoffset={-(percentages.completed + percentages.inProgress) * 2.83}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-slate-900 dark:text-white">{stats.total}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Total</span>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Completed: {stats.completed} ({percentages.completed}%)
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  In Progress: {stats.inProgress} ({percentages.inProgress}%)
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Pending: {stats.pending} ({percentages.pending}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pomodoro Timer - Placed next to Task Progress Overview */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg hover:scale-102 transition-all duration-300">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4" id="pomodoro-title">
            Pomodoro Timer
          </h3>
          <div className="flex flex-col items-center">
            {/* Circular Pomodoro Timer */}
            <div className="relative w-48 h-48 mb-6">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-200 dark:text-slate-700"
                />
                {/* Progress arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke={pomodoroState.mode === 'focus' ? '#3B82F6' : '#10B981'}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="283" // 2 * Math.PI * 45 ≈ 283
                  strokeDashoffset={283 - (calculateProgress() / 100) * 283}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900 dark:text-white" id="pomodoro-time">
                  {formatTime(pomodoroState.remainingTime)}
                </span>
                <span className={`text-lg font-medium mt-1 ${pomodoroState.mode === 'focus' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`} id="pomodoro-mode">
                  {pomodoroState.mode === 'focus' ? 'Focus' : 'Break'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex space-x-4">
              {pomodoroState.status !== 'running' ? (
                <button
                  onClick={pomodoroState.status === 'paused' ? resumeTimer : startTimer}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2 hover:shadow-lg hover:scale-105"
                  id="pomodoro-start-button"
                >
                  <Play className="w-4 h-4" />
                  {pomodoroState.status === 'paused' ? 'Resume' : 'Start'}
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition flex items-center gap-2 hover:shadow-lg hover:scale-105"
                  id="pomodoro-pause-button"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
              )}
              <button
                onClick={resetTimer}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition flex items-center gap-2 hover:shadow-lg hover:scale-105"
                id="pomodoro-reset-button"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300" id="pomodoro-notification">
          {notificationMessage}
        </div>
      )}
    </div>
  );
}