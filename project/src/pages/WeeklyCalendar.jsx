import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks } from '../api/tasks';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function WeeklyCalendar({ onNavigate }) {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [weeklyData, setWeeklyData] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayTasks, setSelectedDayTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get current week dates (Monday to Sunday)
  const getCurrentWeek = () => {
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

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const formatDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  };

  const formatDayDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    const loadWeeklyData = async () => {
      try {
        setLoading(true);
        const allTasks = await getTasks(token);
        
        // Group tasks by date
        const weeklyTasks = {};
        const weekDates = getCurrentWeek();
        
        // Initialize all days with empty arrays
        weekDates.forEach(date => {
          const dateStr = formatDate(date);
          weeklyTasks[dateStr] = [];
        });
        
        // Filter tasks that have due dates within the current week
        allTasks.forEach(task => {
          if (task.dueDate) {
            const taskDate = task.dueDate.split('T')[0]; // Get just the date part
            if (weeklyTasks[taskDate]) {
              weeklyTasks[taskDate].push(task);
            }
          }
        });
        
        // Calculate counts for each day
        const weeklyCounts = {};
        Object.keys(weeklyTasks).forEach(date => {
          const dayTasks = weeklyTasks[date];
          const completed = dayTasks.filter(task => task.status === 'Completed').length;
          const pending = dayTasks.filter(task => task.status !== 'Completed').length;
          
          weeklyCounts[date] = {
            tasks: dayTasks,
            total: dayTasks.length,
            completed,
            pending
          };
        });
        
        setWeeklyData(weeklyCounts);
        setTasks(allTasks);
      } catch (error) {
        console.error('Error loading weekly data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadWeeklyData();
    }
  }, [token]);

  const handleDayClick = async (dateStr) => {
    try {
      // Get tasks for the selected day
      const dayTasks = weeklyData[dateStr]?.tasks || [];
      setSelectedDay(dateStr);
      setSelectedDayTasks(dayTasks);
    } catch (error) {
      console.error('Error loading day tasks:', error);
    }
  };

  const closeDayModal = () => {
    setSelectedDay(null);
    setSelectedDayTasks([]);
  };

  const getDayColor = (dayData) => {
    if (!dayData) return 'bg-slate-50 dark:bg-slate-800';
    
    if (dayData.pending > 0 && dayData.completed === 0) {
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    } else if (dayData.pending === 0 && dayData.completed > 0) {
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    } else if (dayData.pending > 0 && dayData.completed > 0) {
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    }
    return 'bg-slate-50 dark:bg-slate-800';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-slate-600 dark:text-slate-400">Loading weekly calendar...</div>
        </div>
      </div>
    );
  }

  const weekDates = getCurrentWeek();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-lg transition text-sm flex items-center gap-2 hover:shadow-lg hover:scale-105"
            id="weekly-calendar-back"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Weekly Calendar
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              View and manage your tasks by day
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Calendar Strip */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          This Week
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, index) => {
            const dateStr = formatDate(date);
            const dayData = weeklyData[dateStr];
            const dayColor = getDayColor(dayData);
            
            return (
              <div
                key={dateStr}
                className={`${dayColor} border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 text-center`}
                onClick={() => handleDayClick(dateStr)}
                id={`weekly-day-${formatDayName(date).toLowerCase()}`}
              >
                <div className="font-medium text-slate-900 dark:text-white text-sm">
                  {formatDayName(date)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {formatDayDate(date)}
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-center items-center text-xs">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {dayData?.total || 0}
                    </span>
                  </div>
                  <div className="flex justify-center space-x-1 text-xs">
                    <span className="text-green-600 dark:text-green-400">
                      {dayData?.completed || 0}
                    </span>
                    <span className="text-red-600 dark:text-red-400">
                      {dayData?.pending || 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Tasks Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Tasks for {new Date(selectedDay).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <button
                  onClick={closeDayModal}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xl"
                >
                  ×
                </button>
              </div>
              
              {selectedDayTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                  No tasks scheduled for this day
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {task.title}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded text-xs ${
                            task.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            task.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-300'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onNavigate('edit-task', task.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                        >
                          Edit
                        </button>
                        {task.status !== 'Completed' && (
                          <button
                            onClick={() => {
                              // Mark as completed logic would go here
                              // For now, just close the modal
                              closeDayModal();
                            }}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}