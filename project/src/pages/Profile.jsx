import { useState } from 'react';
import { User, Mail, Lock, Save, X, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile({ onNavigate, onProfileUpdated }) {
  const { user, token, updateUser, changePassword } = useAuth(); // Using the updateUser and changePassword functions from AuthContext
  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    password: false
  });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '', // Need current password for security
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const startEditing = (field) => {
    setIsEditing(prev => ({ ...prev, [field]: true }));
    setFormData(prev => ({
      ...prev,
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
    setErrors({});
  };

  const cancelEditing = (field) => {
    setIsEditing(prev => ({ ...prev, [field]: false }));
    setFormData(prev => ({
      ...prev,
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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

  const validateForm = (field) => {
    const newErrors = {};

    if (field === 'name' || field === 'general') {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
    }

    if (field === 'email' || field === 'general') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
    }

    if (field === 'password') {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      
      if (formData.newPassword && formData.newPassword.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveChanges = async (field) => {
    if (!validateForm(field)) {
      return;
    }

    setLoading(true);
    try {
      if (field === 'password') {
        // For password changes, use the changePassword function
        await changePassword(formData.currentPassword, formData.newPassword);
        
        // Reset form data
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        let updateData = {};
        
        if (field === 'name') {
          updateData = { name: formData.name };
        } else if (field === 'email') {
          updateData = { email: formData.email };
        }

        const updatedUser = await updateUser(updateData);
        
        // Reset form data to the updated values
        setFormData(prev => ({
          ...prev,
          name: updatedUser.name || prev.name,
          email: updatedUser.email || prev.email
        }));
      }
      
      // Stop editing
      setIsEditing(prev => ({ ...prev, [field]: false }));
      
      // Call the callback to notify parent that profile was updated
      if (onProfileUpdated) {
        onProfileUpdated();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.message || 'An error occurred while updating the profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg hover:scale-102 transition-all duration-300">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition flex items-center gap-2 hover:shadow-lg hover:scale-105"
            id="back-button"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">User Profile</h2>
        </div>
        
        <div className="space-y-6">
          {/* Name Field */}
          <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Name
                </label>
                {isEditing.name ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                      errors.name ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'
                    }`}
                    id="name-input"
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white">{user?.name}</p>
                )}
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400" id="name-error">
                    {errors.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              {isEditing.name ? (
                <>
                  <button
                    onClick={() => saveChanges('name')}
                    disabled={loading}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition hover:shadow-lg hover:scale-105"
                    id="save-name-button"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => cancelEditing('name')}
                    disabled={loading}
                    className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition hover:shadow-lg hover:scale-105"
                    id="cancel-name-button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => startEditing('name')}
                  className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition hover:shadow-lg hover:scale-105"
                  id="edit-name-button"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                {isEditing.email ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                      errors.email ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'
                    }`}
                    id="email-input"
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white">{user?.email}</p>
                )}
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400" id="email-error">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              {isEditing.email ? (
                <>
                  <button
                    onClick={() => saveChanges('email')}
                    disabled={loading}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition hover:shadow-lg hover:scale-105"
                    id="save-email-button"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => cancelEditing('email')}
                    disabled={loading}
                    className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition hover:shadow-lg hover:scale-105"
                    id="cancel-email-button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => startEditing('email')}
                  className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition hover:shadow-lg hover:scale-105"
                  id="edit-email-button"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                {isEditing.password ? (
                  <div className="space-y-3">
                    <div>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        placeholder="Current password"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                          errors.currentPassword ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'
                        }`}
                        id="current-password-input"
                      />
                      {errors.currentPassword && (
                        <p className="text-sm text-red-600 dark:text-red-400" id="current-password-error">
                          {errors.currentPassword}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="New password"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                          errors.password ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'
                        }`}
                        id="new-password-input"
                      />
                      {errors.password && (
                        <p className="text-sm text-red-600 dark:text-red-400" id="password-error">
                          {errors.password}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm password"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                          errors.confirmPassword ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'
                        }`}
                        id="confirm-password-input"
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-600 dark:text-red-400" id="confirm-password-error">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-900 dark:text-white">••••••••</p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              {isEditing.password ? (
                <>
                  <button
                    onClick={() => saveChanges('password')}
                    disabled={loading}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition hover:shadow-lg hover:scale-105"
                    id="save-password-button"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => cancelEditing('password')}
                    disabled={loading}
                    className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition hover:shadow-lg hover:scale-105"
                    id="cancel-password-button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => startEditing('password')}
                  className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition hover:shadow-lg hover:scale-105"
                  id="edit-password-button"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Non-editable fields (Role, Member Since) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Role
              </label>
              <p className="text-slate-900 dark:text-white">{user?.role || 'User'}</p>
            </div>
            
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Member Since
              </label>
              <p className="text-slate-900 dark:text-white">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}