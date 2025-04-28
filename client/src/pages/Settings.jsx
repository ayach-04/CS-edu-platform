import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import SecurityQuestions from '../components/auth/SecurityQuestions';
import { getCurrentAcademicYear, getAcademicYearOptions } from '../utils/academicYear';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    level: '',
    academicYear: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [showSecurityQuestions, setShowSecurityQuestions] = useState(false);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [currentAcademicYear, setCurrentAcademicYear] = useState('');

  // Calculate current academic year and options
  useEffect(() => {
    const year = getCurrentAcademicYear();
    setCurrentAcademicYear(year);
    setAcademicYearOptions(getAcademicYearOptions(1, 2));
  }, []);

  // Set form data when user data is available
  useEffect(() => {
    if (user) {
      // Always use the current academic year for students
      const academicYear = user.role === 'student' ? currentAcademicYear : user.academicYear || '';

      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        level: user.level || '',
        academicYear: academicYear,
        username: user.username || ''
      }));
    }
  }, [user, currentAcademicYear]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // Create update data object
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName
      };

      // Add username if it has changed
      if (formData.username && formData.username !== user.username) {
        updateData.username = formData.username;
      }

      // Add student-specific fields if user is a student
      if (user?.role === 'student') {
        if (formData.level) {
          updateData.level = formData.level;
        }
        if (formData.academicYear) {
          updateData.academicYear = formData.academicYear;
        }
      }

      const response = await authAPI.updateProfile(updateData);

      // Update user in context with all updated fields
      const updatedUser = {
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName
      };

      // Add username if it has changed
      if (formData.username && formData.username !== user.username) {
        updatedUser.username = formData.username;
      }

      // Add student-specific fields if user is a student
      if (user?.role === 'student') {
        if (formData.level) {
          updatedUser.level = formData.level;
        }
        if (formData.academicYear) {
          updatedUser.academicYear = formData.academicYear;
        }
      }

      updateUser(updatedUser);

      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      setSuccessMessage('Password changed successfully');

      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error changing password:', err);

      // Handle specific password errors
      if (err.isPasswordError || err.response?.status === 401) {
        setError('Current password is incorrect. Please try again.');
      } else {
        setError(err.response?.data?.message || 'Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1>Account Settings</h1>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger p-4 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-success/10 text-success p-4 rounded-md">
          {successMessage}
        </div>
      )}

      <div className="card">
        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'profile'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'password'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('password')}
          >
            Password
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'security'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('security')}
          >
            Security Questions
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input"
                  required
                  pattern="[A-Za-z]+"
                  title="First name can only contain letters"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input"
                  required
                  pattern="[A-Za-z]+"
                  title="Last name can only contain letters"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                className="form-input bg-gray-100"
                disabled
              />
              <p className="text-sm text-gray-500 mt-1">
                Email cannot be changed. Contact an administrator if you need to update your email.
              </p>
            </div>

            <div>
              <label className="form-label">Role</label>
              <div className="form-input bg-gray-100 cursor-not-allowed">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Your role cannot be changed.
              </p>
            </div>

            {user?.role === 'student' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="level" className="form-label">Level</label>
                    <select
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="form-input"
                      required
                    >
                      <option value="">Select Level</option>
                      <option value="lmd1">LMD 1</option>
                      <option value="ing1">ING 1</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="academicYear" className="form-label">Academic Year</label>
                    <div className="form-input bg-gray-100 cursor-not-allowed">
                      {currentAcademicYear}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Academic year is automatically set to the current year ({currentAcademicYear}).
                      It updates each September.
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username || ''}
                    onChange={handleChange}
                    className="form-input"
                    required
                    pattern="[A-Za-z0-9]+"
                    title="Username can only contain letters and numbers"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This is your username for the platform.
                  </p>
                </div>
              </>
            )}

            {user?.role === 'teacher' && (
              <div>
                <label className="form-label">Academic Rank</label>
                <div className="form-input bg-gray-100 cursor-not-allowed">
                  {user?.academicRank || 'Not specified'}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            {/* Hidden username/email field to help password managers */}
            <input
              type="hidden"
              id="username"
              name="username"
              value={user?.email || user?.username || ''}
              autoComplete="username"
            />

            <div>
              <label htmlFor="currentPassword" className="form-label">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="form-input"
                required
                autoComplete="current-password"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="form-label">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="form-input"
                required
                minLength={6}
                autoComplete="new-password"
              />
              <p className="text-sm text-gray-500 mt-1">
                Password must be at least 6 characters long.
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                required
                autoComplete="new-password"
              />
            </div>

            <div className="flex justify-between items-center">
              <Link
                to={`/forgot-password/${encodeURIComponent(user.email || user.username)}`}
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </Link>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}

        {/* Security Questions Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <SecurityQuestions
              onComplete={() => {
                setSuccessMessage('Security questions set successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
