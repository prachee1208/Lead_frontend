import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Interceptor - Token:', token);
    console.log('API Interceptor - Request URL:', config.url);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Interceptor - Headers after adding token:', config.headers);
    } else {
      console.log('API Interceptor - No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('API Interceptor - Request error:', error);
    return Promise.reject(error);
  }
);

// Lead API endpoints
export const leadsAPI = {
  // Get all leads with optional filters
  getAll: async (params = {}) => {
    try {
      // Ensure we're passing the params to the API
      const response = await api.get('/leads', { params });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get a single lead by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/leads/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new lead
  create: async (leadData) => {
    try {
      const response = await api.post('/leads', leadData);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update a lead
  update: async (id, leadData) => {
    try {
      const response = await api.put(`/leads/${id}`, leadData);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a lead
  delete: async (id) => {
    try {
      const response = await api.delete(`/leads/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Assign a lead to an employee
  assign: async (leadId, managerId, employeeId) => {
    try {
      console.log(`Assigning lead ${leadId} to employee ${employeeId} by manager ${managerId}`);

      // Make sure we have valid IDs
      if (!leadId || !employeeId) {
        throw new Error('Lead ID and Employee ID are required');
      }

      // Convert string IDs to ObjectId format if needed
      // MongoDB IDs should be 24 characters long
      if (typeof leadId === 'string' && leadId.length !== 24) {
        console.warn('Lead ID may not be in the correct format:', leadId);
      }

      if (typeof employeeId === 'string' && employeeId.length !== 24) {
        console.warn('Employee ID may not be in the correct format:', employeeId);
      }

      if (typeof managerId === 'string' && managerId.length !== 24) {
        console.warn('Manager ID may not be in the correct format:', managerId);
      }

      // Use the correct endpoint based on the backend implementation
      // Include both leadId and employeeId in the request body
      const requestData = {
        leadId,
        employeeId,
        managerId  // Include managerId in case the backend needs it
      };

      console.log('Request data:', requestData);

      // Try the PUT endpoint first (more RESTful)
      try {
        const putResponse = await api.put(`/leads/${leadId}`, {
          assignedManager: managerId,
          assignedEmployee: employeeId
        });
        console.log('Assignment response from PUT:', putResponse);
        return putResponse;
      } catch (putError) {
        console.log('PUT endpoint failed, trying POST endpoint');
        // If PUT fails, try the POST endpoint
        const response = await api.post('/leads/assign/employee', requestData);
        console.log('Assignment response from POST:', response);
        return response;
      }
    } catch (error) {
      console.error('Error in leadsAPI.assign:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  // Assign a lead to a manager (admin only)
  assignToManager: async (leadId, managerId) => {
    try {
      const response = await api.post('/leads/assign/manager', {
        leadId,
        managerId
      });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get leads assigned to a specific employee
  getByEmployee: async (employeeId, params = {}) => {
    try {
      console.log(`Fetching leads for employee ${employeeId}`);

      // Try the specific endpoint first
      try {
        const response = await api.get(`/leads/employee/${employeeId}`, { params });
        console.log('Employee leads response:', response);
        return response;
      } catch (specificError) {
        console.log('Specific endpoint failed, trying with filter');
        // If specific endpoint fails, try using the filter parameter
        const filterResponse = await api.get('/leads', {
          params: {
            ...params,
            assignedEmployee: employeeId
          }
        });
        console.log('Filter response:', filterResponse);
        return filterResponse;
      }
    } catch (error) {
      console.error('Error in leadsAPI.getByEmployee:', error);
      throw error.response?.data || error.message;
    }
  }
};

// User API endpoints
export const usersAPI = {
  // Get all users
  getAll: async () => {
    try {
      const response = await api.get('/users');
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all users with roles
  getAllWithRoles: async () => {
    try {
      const response = await api.get('/users/all');
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get users by role (manager/employee)
  getByRole: async (role) => {
    try {
      const response = await api.get(`/users/role/${role}`);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get a single user by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new user
  create: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update a user
  update: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update a user's role
  updateRole: async (id, role) => {
    try {
      const response = await api.patch(`/users/${id}/role`, { role });
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a user
  delete: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Reminder API endpoints
export const remindersAPI = {
  // Get all reminders
  getAll: async () => {
    try {
      const response = await api.get('/reminders');
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get a single reminder by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/reminders/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new reminder
  create: async (reminderData) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Creating reminder with token:', token);

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.post('/reminders', reminderData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      console.error('Error in remindersAPI.create:', error);
      throw error.response?.data || error.message;
    }
  },

  // Update a reminder
  update: async (id, reminderData) => {
    try {
      const response = await api.put(`/reminders/${id}`, reminderData);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Toggle reminder completion status
  toggleComplete: async (id) => {
    try {
      const response = await api.patch(`/reminders/${id}/toggle`);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a reminder
  delete: async (id) => {
    try {
      const response = await api.delete(`/reminders/${id}`);
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Auth API
export const authAPI = {
  register: (userData) => api.post('/users/signup', userData),
  login: (credentials) => api.post('/users/login', credentials),
  getProfile: () => api.get('/users/me'),
};

export default api;
