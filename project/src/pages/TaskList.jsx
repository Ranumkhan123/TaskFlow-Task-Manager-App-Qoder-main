import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks, updateTask, deleteTask } from '../api/tasks';
import { Plus, Search, Filter, Calendar, CheckSquare, Trash2 } from 'lucide-react';

export default function TaskList({ onNavigate, onEditTask }) {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All'); // New date filter state
  const [dateRange, setDateRange] = useState({ start: '', end: '' }); // For date range selection
  const [selectedTaskIds, setSelectedTaskIds] = useState([]); // Track selected task IDs
  const { token } = useAuth();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks(token);
      setTasks(data);
      setFilteredTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [tasks, searchTerm, priorityFilter, statusFilter, dateFilter, dateRange]);

  // Effect to update filtered tasks when selection changes
  useEffect(() => {
    // Clean up any selected task IDs that are no longer in the filtered list
    const filteredIds = filteredTasks.map(task => task.id);
    setSelectedTaskIds(prev => prev.filter(id => filteredIds.includes(id)));
  }, [filteredTasks]);

  const applyFilters = () => {
    let result = [...tasks];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply priority filter
    if (priorityFilter !== 'All') {
      result = result.filter(task => task.priority === priorityFilter);
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter(task => task.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== 'All') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (dateFilter) {
        case 'Today':
          result = result.filter(task => {
            const taskDate = new Date(task.createdAt);
            return taskDate >= today;
          });
          break;
        case 'This Week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          result = result.filter(task => {
            const taskDate = new Date(task.createdAt);
            return taskDate >= weekAgo;
          });
          break;
        case 'This Month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          result = result.filter(task => {
            const taskDate = new Date(task.createdAt);
            return taskDate >= monthAgo;
          });
          break;
        case 'Custom Range':
          if (dateRange.start && dateRange.end) {
            const startDate = new Date(dateRange.start);
            const endDate = new Date(dateRange.end);
            result = result.filter(task => {
              const taskDate = new Date(task.createdAt);
              return taskDate >= startDate && taskDate <= endDate;
            });
          }
          break;
        default:
          break;
      }
    }

    setFilteredTasks(result);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePriorityChange = (e) => {
    setPriorityFilter(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };

  const handleDateRangeChange = (e, type) => {
    const { value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'Medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'Low':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20';
    }
  };

  // Handle individual task selection
  const handleTaskSelect = (taskId, isSelected) => {
    if (isSelected) {
      setSelectedTaskIds(prev => [...prev, taskId]);
    } else {
      setSelectedTaskIds(prev => prev.filter(id => id !== taskId));
    }
  };

  // Handle bulk complete action
  const handleBulkComplete = async () => {
    try {
      // Update all selected tasks to 'Completed' status
      const promises = selectedTaskIds.map(taskId => {
        const task = tasks.find(t => t.id === taskId);
        return updateTask(token, taskId, {
          title: task.title,
          description: task.description,
          status: 'Completed',
          priority: task.priority,
          dueDate: task.dueDate
        });
      });
      
      await Promise.all(promises);
      
      // Reload tasks
      await loadTasks();
      
      // Clear selection
      setSelectedTaskIds([]);
      
      // Optionally show a success message
      alert(`${selectedTaskIds.length} task(s) marked as completed successfully!`);
    } catch (error) {
      console.error('Failed to update tasks:', error);
      alert('Failed to update tasks. Please try again.');
    }
  };

  // Handle bulk delete action
  const handleBulkDelete = async () => {
    // Confirm before deleting
    if (!window.confirm(`Are you sure you want to delete ${selectedTaskIds.length} task(s)?`)) {
      return;
    }
    
    try {
      // Delete all selected tasks
      const promises = selectedTaskIds.map(taskId => deleteTask(token, taskId));
      
      await Promise.all(promises);
      
      // Reload tasks
      await loadTasks();
      
      // Clear selection
      setSelectedTaskIds([]);
      
      // Optionally show a success message
      alert(`${selectedTaskIds.length} task(s) deleted successfully!`);
    } catch (error) {
      console.error('Failed to delete tasks:', error);
      alert('Failed to delete tasks. Please try again.');
    }
  };

  // Effect to clear selection when tasks change
  useEffect(() => {
    // If the tasks list changes (e.g. after an update/delete), clear the selection
    // But only clear if all selected tasks are no longer in the tasks list
    const stillSelected = selectedTaskIds.filter(id => tasks.some(t => t.id === id));
    if (stillSelected.length !== selectedTaskIds.length) {
      setSelectedTaskIds(stillSelected);
    }
  }, [tasks]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'In Progress':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'Pending':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20';
    }
  };

  const clearSelection = () => {
    setSelectedTaskIds([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600 dark:text-slate-400">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition flex items-center gap-2 hover:shadow-lg hover:scale-105"
            id="back-button"
          >
            ← Back
          </button>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Task List
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
            </p>
          </div>
          <button
            onClick={() => onNavigate('new-task')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105"
            id="create-task-button"
          >
            <Plus className="w-5 h-5" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              <Search className="w-4 h-4 inline mr-1" />
              Search Task
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by title or description..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              id="search-task-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              <Filter className="w-4 h-4 inline mr-1" />
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={handlePriorityChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              id="priority-filter-select"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              <Filter className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              id="status-filter-select"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date
            </label>
            <select
              value={dateFilter}
              onChange={handleDateFilterChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              id="date-filter-select"
            >
              <option value="All">All Dates</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="Custom Range">Custom Range</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Inputs - shown only when Custom Range is selected */}
        {dateFilter === 'Custom Range' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => handleDateRangeChange(e, 'start')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                id="date-range-start-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => handleDateRangeChange(e, 'end')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                id="date-range-end-input"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Bulk Actions - shown only when tasks are selected */}
      {selectedTaskIds.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-800 dark:text-blue-300 font-medium">
              {selectedTaskIds.length} {selectedTaskIds.length === 1 ? 'task' : 'tasks'} selected
            </span>
          </div>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => handleBulkComplete()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex items-center gap-2 hover:shadow-lg hover:scale-105"
              id="bulk-complete-button"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Mark as Completed</span>
            </button>
            <button
              onClick={() => handleBulkDelete()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition flex items-center gap-2 hover:shadow-lg hover:scale-105"
              id="bulk-delete-button"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              No tasks found matching your filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer hover:shadow-lg hover:scale-102"
                onClick={() => onEditTask(task.id)}
                id={`task-item-${task.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex items-center pt-1">
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.includes(task.id)}
                        onChange={(e) => handleTaskSelect(task.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        onClick={(e) => e.stopPropagation()} // Prevent triggering edit on checkbox click
                        id={`task-checkbox-${task.id}`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority} Priority
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                        {task.dueDate && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 text-right text-sm text-slate-500 dark:text-slate-400">
                    <div>Created: {new Date(task.createdAt).toLocaleDateString()}</div>
                    {task.updatedAt && task.updatedAt !== task.createdAt && (
                      <div>Updated: {new Date(task.updatedAt).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}