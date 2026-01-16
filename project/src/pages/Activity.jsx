import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks, getTask, updateTask } from '../api/tasks';
import { Clock, CheckCircle, Edit3, Plus, Filter, Search, Calendar, X } from 'lucide-react';

export default function Activity({ onNavigate }) {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [taskDetails, setTaskDetails] = useState({
    title: '',
    description: '',
    status: 'Pending',
    priority: 'Medium',
    dueDate: ''
  });
  const [errors, setErrors] = useState({});
  const [filters, setFilters] = useState({
    type: 'All', // 'All', 'Created', 'Completed', 'Updated'
    search: '',
    dateRange: 'All Time' // 'Today', 'This Week', 'This Month', 'All Time'
  });
  const { token } = useAuth();

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      // Fetch real tasks from the user's account
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
            description: `Created task: ${task.title}`,
            status: task.status
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
            description: `Updated task: ${task.title}`,
            status: task.status
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
            description: `Completed task: ${task.title}`,
            status: task.status
          });
        }
      });
      
      // Sort activities by timestamp (newest first) and take top 5
      const sortedActivities = activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
      setActivities(sortedActivities);
      setFilteredActivities(sortedActivities);
    } catch (error) {
      console.error('Failed to load activities:', error);
      // Set to empty array if there's an error - no dummy data
      setActivities([]);
      setFilteredActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [activities, filters]);

  const applyFilters = () => {
    let result = [...activities];

    // Apply type filter
    if (filters.type !== 'All') {
      result = result.filter(activity => activity.type === filters.type);
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(activity => 
        activity.taskTitle.toLowerCase().includes(searchLower) || 
        activity.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply date range filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);

    switch (filters.dateRange) {
      case 'Today':
        result = result.filter(activity => {
          const activityDate = new Date(activity.timestamp);
          return activityDate >= today;
        });
        break;
      case 'This Week':
        result = result.filter(activity => {
          const activityDate = new Date(activity.timestamp);
          return activityDate >= weekAgo;
        });
        break;
      case 'This Month':
        result = result.filter(activity => {
          const activityDate = new Date(activity.timestamp);
          return activityDate >= monthAgo;
        });
        break;
      case 'All Time':
        // No filter needed
        break;
      default:
        break;
    }

    setFilteredActivities(result);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleTaskClick = async (activity) => {
    try {
      // Load the full task details
      const task = await getTask(token, activity.taskId);
      setSelectedTask(task);
      setTaskDetails({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate
      });
      setEditMode(false); // Start in view mode
      setShowModal(true);
    } catch (error) {
      console.error('Failed to load task details:', error);
    }
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelClick = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedTask(null);
    setTaskDetails({
      title: '',
      description: '',
      status: 'Pending',
      priority: 'Medium',
      dueDate: ''
    });
    setErrors({});
    // If onNavigate is provided, navigate back to the activity page
    if (onNavigate) {
      // We stay on the same page but just close the modal
      // The navigation is handled by the parent component
    }
  };

  const handleSaveClick = async () => {
    if (!validateTask()) {
      return;
    }

    try {
      await updateTask(token, selectedTask.id, taskDetails);
      // Close the modal and refresh activities
      setShowModal(false);
      setEditMode(false);
      setSelectedTask(null);
      setTaskDetails({
        title: '',
        description: '',
        status: 'Pending',
        priority: 'Medium',
        dueDate: ''
      });
      setErrors({});
      // Reload activities to reflect the changes
      loadActivities();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const validateTask = () => {
    const newErrors = {};

    if (!taskDetails.title.trim()) {
      newErrors.title = 'Title is required';
    }

    const hasAlphanumeric = /[a-zA-Z0-9]/.test(taskDetails.title);
    if (!hasAlphanumeric) {
      newErrors.title = 'Title must contain at least one alphanumeric character';
    }

    if (!taskDetails.priority) {
      newErrors.priority = 'Priority is required';
    }

    if (!taskDetails.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (taskDetails.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskDetails(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'Created':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'Updated':
        return <Edit3 className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600 dark:text-slate-400">Loading activities...</div>
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
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Activity History
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Track all your task activities and changes
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6 hover:shadow-lg hover:scale-102 transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              <Filter className="w-4 h-4 inline mr-1" />
              Activity Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              id="activity-type-filter"
            >
              <option value="All">All Activities</option>
              <option value="Created">Created</option>
              <option value="Completed">Completed</option>
              <option value="Updated">Updated</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              id="date-range-filter"
            >
              <option value="All Time">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              <Search className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search tasks or activities..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              id="activity-search-input"
            />
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Recent Activities
          </h3>
          
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">
                No activities found matching your filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer hover:shadow-lg hover:scale-102"
                  onClick={() => handleTaskClick(activity)}
                >
                  <div className="mr-4 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-900 dark:text-white hover:underline">
                        {activity.taskTitle}
                      </h4>
                      <span className={`text-sm px-2 py-1 rounded-full ${getActivityColor(activity.type)} bg-opacity-10`}>
                        {activity.type}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                      {activity.description}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">
                      {activity.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editMode ? 'Edit Task' : 'Task Details'}
                </h3>
                <button 
                  onClick={handleCancelClick}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  id="modal-close-button"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={taskDetails.title}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                        errors.title ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={taskDetails.description}
                      onChange={handleInputChange}
                      rows="4"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white resize-none ${
                        errors.description ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    />
                    <div className="flex items-center justify-between mt-1">
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.description}
                        </p>
                      )}
                      <p className={`text-sm ml-auto ${500 - taskDetails.description.length < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {500 - taskDetails.description.length} characters remaining
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={taskDetails.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Priority <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={taskDetails.priority}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                          errors.priority ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        <option value="">Select Priority</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                      {errors.priority && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.priority}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Due Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="dueDate"
                        name="dueDate"
                        type="date"
                        value={taskDetails.dueDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                          errors.dueDate ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'
                        }`}
                      />
                      {errors.dueDate && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.dueDate}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Title</h4>
                    <p className="text-slate-900 dark:text-white">{selectedTask?.title}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Description</h4>
                    <p className="text-slate-900 dark:text-white">{selectedTask?.description || 'No description'}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</h4>
                      <p className="text-slate-900 dark:text-white">{selectedTask?.status}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Priority</h4>
                      <p className="text-slate-900 dark:text-white">{selectedTask?.priority}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Due Date</h4>
                    <p className="text-slate-900 dark:text-white">{selectedTask?.dueDate}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Created</h4>
                    <p className="text-slate-900 dark:text-white">{selectedTask?.createdAt ? new Date(selectedTask.createdAt).toLocaleString() : 'N/A'}</p>
                  </div>
                  
                  {selectedTask?.updatedAt && selectedTask.updatedAt !== selectedTask.createdAt && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Last Updated</h4>
                      <p className="text-slate-900 dark:text-white">{new Date(selectedTask.updatedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleCancelClick}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-lg transition hover:shadow-lg hover:scale-105"
                  id="cancel-task-button"
                >
                  Cancel
                </button>
                
                {editMode ? (
                  <button
                    onClick={handleSaveClick}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition hover:shadow-lg hover:scale-105"
                    id="save-task-button"
                  >
                    Save Changes
                  </button>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition hover:shadow-lg hover:scale-105"
                    id="edit-task-button"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}