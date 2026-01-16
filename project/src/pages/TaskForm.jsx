import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTask, createTask, updateTask } from '../api/tasks';

export default function TaskForm({ onNavigate, editTaskId, onTaskSaved }) {
  const [task, setTask] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    dueDate: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (editTaskId) {
      loadTask();
    }
  }, [editTaskId]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const data = await getTask(token, editTaskId);
      setTask(data);
    } catch (error) {
      console.error('Failed to load task:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateTask = () => {
    const newErrors = {};

    if (!task.title.trim()) {
      newErrors.title = 'Title is required';
    }

    const hasAlphanumeric = /[a-zA-Z0-9]/.test(task.title);
    if (!hasAlphanumeric) {
      newErrors.title = 'Title must contain at least one alphanumeric character';
    }

    if (!task.status) {
      newErrors.status = 'Status is required';
    }

    if (!task.priority) {
      newErrors.priority = 'Priority is required';
    }

    if (!task.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (task.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateTask()) {
      return;
    }

    try {
      setLoading(true);
      
      if (editTaskId) {
        await updateTask(token, editTaskId, task);
      } else {
        await createTask(token, task);
      }
      
      onTaskSaved();
      onNavigate('tasks');
    } catch (error) {
      console.error('Failed to save task:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('An error occurred while saving the task.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask(prev => ({
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

  const handleCancel = () => {
    onNavigate('tasks');
  };

  // Calculate today's date in YYYY-MM-DD format for the min attribute
  const today = new Date().toISOString().split('T')[0];

  if (loading && editTaskId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600 dark:text-slate-400">Loading task...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg hover:scale-102 transition-all duration-300">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => onNavigate('tasks')}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition flex items-center gap-2 hover:shadow-lg hover:scale-105"
              id="back-button"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {editTaskId ? 'Edit Task' : 'Create New Task'}
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {editTaskId ? 'Update the task details below' : 'Fill in the details for your new task'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={task.title}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                errors.title ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'
              }`}
              id="task-title-input"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400" id="title-error">
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
              value={task.description}
              onChange={handleChange}
              disabled={loading}
              rows="4"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white resize-none ${
                errors.description ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'
              }`}
              id="task-description-textarea"
            ></textarea>
            <div className="flex items-center justify-between mt-1">
              {errors.description && (
                <p className="text-sm text-red-600 dark:text-red-400" id="description-error">
                  {errors.description}
                </p>
              )}
              <p className={`text-sm ml-auto ${500 - task.description.length < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {500 - task.description.length} characters remaining
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
                value={task.status}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                id="task-status-select"
              >
                <option value="">Select Status</option>
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
                value={task.priority}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                  errors.priority ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                id="task-priority-select"
              >
                <option value="">Select Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400" id="priority-error">
                  {errors.priority}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={task.dueDate}
                onChange={handleChange}
                disabled={loading}
                min={today} // This prevents selecting past dates
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                  errors.dueDate ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                id="task-due-date-input"
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400" id="due-date-error">
                  {errors.dueDate}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-lg transition hover:shadow-lg hover:scale-105"
              id="cancel-task-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition hover:shadow-lg hover:scale-105"
              id="save-task-button"
            >
              {loading ? 'Saving...' : editTaskId ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}