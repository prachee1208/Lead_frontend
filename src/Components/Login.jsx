import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    // Login form fields
    usernameOrEmail: '',
    password: '',
    userType: 'employee', // Default to employee
    // Additional signup form fields
    name: '',
    email: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear any previous error when user makes changes
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login request
        const response = await authAPI.login({
          email: formData.usernameOrEmail,
          password: formData.password,
        });

        const { token, user } = response.data;

        // Store token and user data in localStorage
        console.log('Storing token in localStorage:', token);
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userId', user._id);

        // Verify the token was stored correctly
        const storedToken = localStorage.getItem('token');
        console.log('Token stored in localStorage:', storedToken);

        toast.success("Login successful", {
          position: "top-right",
          autoClose: 3000,
        });

        // Redirect based on user role
        switch (user.role) {
          case 'admin':
            navigate('/dashboard-panel');
            break;
          case 'manager':
            navigate('/manager-panel');
            break;
          case 'employee':
            navigate('/employee-panel');
            break;
          default:
            navigate('/');
        }
      } else {
        // Signup request
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const response = await authAPI.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.userType,
        });

        // Reset form and switch to login view
        setIsLogin(true);
        setFormData({
          usernameOrEmail: formData.email,
          password: '',
          userType: formData.userType,
          name: '',
          email: '',
          confirmPassword: '',
        });

        toast.success(`Account created successfully as ${formData.userType}! Please log in.`);
        setError(`Account created successfully as ${formData.userType}! Please log in with your credentials.`);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again later.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    // Reset form data when toggling between forms
    setFormData({
      usernameOrEmail: '',
      password: '',
      userType: 'employee',
      name: '',
      email: '',
      confirmPassword: '',
    });
    // Clear any error messages
    setError('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-t from-[#05657d] to-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md mt-14">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isLogin ? 'Please sign in to your account' : 'Fill in your details to get started'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Show name field only on signup form */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none "
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Show username/email field for login, email field for signup */}
            <div>
              <label htmlFor={isLogin ? "usernameOrEmail" : "email"} className="block text-sm font-medium text-gray-700">
                {isLogin ? 'Username or Email' : 'Email Address'}
              </label>
              <input
                id={isLogin ? "usernameOrEmail" : "email"}
                name={isLogin ? "usernameOrEmail" : "email"}
                type={isLogin ? "text" : "email"}
                required
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                placeholder={isLogin ? "Enter your username or email" : "Enter your email address"}
                value={isLogin ? formData.usernameOrEmail : formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* User Type Selection (only for signup) */}
            {!isLogin && (
              <div>
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                  Register As
                </label>
                <select
                  id="userType"
                  name="userType"
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#054757] focus:border-[#054757]"
                  value={formData.userType}
                  onChange={handleChange}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            {/* Show confirm password field only on signup form */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          {isLogin && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="remember-me" className="block ml-2 text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-[#054757]">
                  Forgot password?
                </a>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className={`text-sm text-center ${error.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-2 text-sm font-medium text-white bg-[#044d5f] border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#033a49]'}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Signing in...' : 'Signing up...'}
                </span>
              ) : (
                isLogin ? 'Sign in' : 'Sign up'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            {' '}
            <button
              type="button"
              onClick={toggleForm}
              className="font-medium text-[#04576c]"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// export default AuthPage;

export default Login