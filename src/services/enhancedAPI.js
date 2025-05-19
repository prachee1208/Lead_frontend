import axios from 'axios';
import { toast } from 'react-toastify';

// Configuration
const API_URL = 'https://lead-backend-jcyc.onrender.com/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms
const REQUEST_TIMEOUT = 15000; // ms

// Connection status tracking
let isConnected = true;
let connectionListeners = [];

// Create axios instance with enhanced config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: REQUEST_TIMEOUT,
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for tracking
    config._requestTimestamp = Date.now();

    return config;
  },
  (error) => {
    console.error('API Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling and retry logic
api.interceptors.response.use(
  (response) => {
    // Calculate request duration for performance monitoring
    const duration = Date.now() - response.config._requestTimestamp;
    console.log(`Request to ${response.config.url} completed in ${duration}ms`);

    // Update connection status if it was previously down
    if (!isConnected) {
      isConnected = true;
      notifyConnectionChange(true);
      toast.success('Connection to server restored');
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if we've already retried the maximum number of times
    if (originalRequest._retryCount >= MAX_RETRIES) {
      // Update connection status
      if (isConnected) {
        isConnected = false;
        notifyConnectionChange(false);
        toast.error('Connection to server lost. Please check your network.');
      }

      return Promise.reject(error);
    }

    // Initialize retry count if not set
    if (originalRequest._retryCount === undefined) {
      originalRequest._retryCount = 0;
    }

    // Determine if we should retry based on error type
    const shouldRetry = error.code === 'ECONNABORTED' ||
                        (error.response && (error.response.status >= 500 ||
                                           error.response.status === 429));

    if (shouldRetry) {
      originalRequest._retryCount++;

      // Exponential backoff delay
      const delay = RETRY_DELAY * Math.pow(2, originalRequest._retryCount - 1);
      console.log(`Retrying request to ${originalRequest.url} (attempt ${originalRequest._retryCount} of ${MAX_RETRIES}) after ${delay}ms`);

      // Wait for the delay
      await new Promise(resolve => setTimeout(resolve, delay));

      // Retry the request
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

// Connection status management
function notifyConnectionChange(status) {
  connectionListeners.forEach(listener => listener(status));
}

// Subscribe to connection status changes
export function onConnectionChange(callback) {
  connectionListeners.push(callback);
  return () => {
    connectionListeners = connectionListeners.filter(listener => listener !== callback);
  };
}

// Get current connection status
export function getConnectionStatus() {
  return isConnected;
}

// Enhanced API request wrapper with better error handling
const makeRequest = async (method, url, data = null, options = {}) => {
  try {
    console.log(`Making API request: ${method.toUpperCase()} ${url}`, { data, options });

    const config = {
      method,
      url,
      ...options,
    };

    if (data) {
      config.data = data;
    }

    // Add a timestamp to avoid caching issues
    if (method.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    const response = await api(config);
    console.log(`API response from ${method.toUpperCase()} ${url}:`, response.data);
    return response.data;
  } catch (error) {
    // Format error message for consistent handling
    const errorMessage = error.response?.data?.message ||
                         error.message ||
                         'An unknown error occurred';

    // Log detailed error information
    console.error(`API Error (${method} ${url}):`, {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error
    });

    // For performance endpoints, provide more detailed debugging
    if (url.includes('/performance/')) {
      console.error('Performance API error details:', {
        url: `${API_URL}${url}`,
        method,
        requestData: data,
        requestOptions: options,
        errorResponse: error.response?.data,
        errorStatus: error.response?.status
      });
    }

    // Throw a standardized error object
    throw {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error,
      endpoint: url
    };
  }
};

// Enhanced API service
export const enhancedAPI = {
  // Lead endpoints
  leads: {
    getAll: (params = {}) => {
      // Ensure we have a high limit to get all leads
      const enhancedParams = {
        ...params,
        limit: params.limit || 100 // Default to 100 if not specified
      };
      return makeRequest('get', '/leads', null, { params: enhancedParams });
    },
    getById: (id) => makeRequest('get', `/leads/${id}`),
    create: (data) => makeRequest('post', '/leads', data),
    update: (id, data) => makeRequest('put', `/leads/${id}`, data),
    delete: (id) => makeRequest('delete', `/leads/${id}`),
    assign: (leadId, managerId, employeeId) => makeRequest('post', '/leads/assign/employee', {
      leadId,
      managerId,
      employeeId
    }),
    assignToEmployee: (leadId, employeeId, managerId) => {
      console.log(`Assigning lead ${leadId} to employee ${employeeId} by manager ${managerId}`);
      return makeRequest('post', '/leads/assign/employee', {
        leadId,
        employeeId,
        managerId
      });
    },
    getByEmployee: async (employeeId, params = {}) => {
      try {
        console.log('Fetching leads for employee:', employeeId);
        // Try the dedicated endpoint first
        const response = await makeRequest('get', `/leads/employee/${employeeId}`, null, { params });
        console.log('Response from employee leads endpoint:', response);
        return response;
      } catch (error) {
        console.log('Error using dedicated employee endpoint, falling back to filter:', error);
        // Fall back to the filter method if the dedicated endpoint fails
        try {
          console.log('Trying fallback method with filter');
          const fallbackResponse = await makeRequest('get', '/leads', null, {
            params: { ...params, assignedEmployee: employeeId }
          });
          console.log('Response from fallback method:', fallbackResponse);
          return fallbackResponse;
        } catch (fallbackError) {
          console.error('Fallback method also failed:', fallbackError);
          throw fallbackError;
        }
      }
    },

    // Get leads assigned by a specific manager
    getAssignedByManager: async (managerId, params = {}) => {
      try {
        console.log('Fetching leads assigned by manager:', managerId);
        const response = await makeRequest('get', `/leads/assigned/${managerId}`, null, { params });
        console.log('Response from assigned leads endpoint:', response);
        return response;
      } catch (error) {
        console.log('Error using manager assigned endpoint, falling back to filter:', error);
        // Fall back to the filter method if the dedicated endpoint fails
        try {
          console.log('Trying fallback method with filter');
          const fallbackResponse = await makeRequest('get', '/leads', null, {
            params: { ...params, assignedManager: managerId, hasAssignedEmployee: true }
          });
          console.log('Response from fallback method:', fallbackResponse);
          return fallbackResponse;
        } catch (fallbackError) {
          console.error('Fallback method also failed:', fallbackError);
          throw fallbackError;
        }
      }
    },
    getByManager: (managerId, params = {}) => makeRequest('get', `/leads`, null, {
      params: { ...params, assignedManager: managerId }
    }),
  },

  // User endpoints
  users: {
    getAll: () => makeRequest('get', '/users/all'),
    getById: (id) => makeRequest('get', `/users/${id}`),
    getByRole: (role) => makeRequest('get', `/users/role/${role}`),
    create: (data) => makeRequest('post', '/users', data),
    update: (id, data) => makeRequest('put', `/users/${id}`, data),
    delete: (id) => makeRequest('delete', `/users/${id}`),
    updateRole: (id, role) => makeRequest('patch', `/users/${id}/role`, { role }),
  },

  // Auth endpoints
  auth: {
    register: (userData) => makeRequest('post', '/users/signup', userData),
    login: (credentials) => makeRequest('post', '/users/login', credentials),
    getProfile: () => makeRequest('get', '/users/me'),
  },

  // Performance endpoints
  performance: {
    getEmployeePerformance: (dateRange = 'last-30-days') =>
      makeRequest('get', '/performance/employee-performance', null, { params: { dateRange } }),
    getLeadStatusDistribution: (dateRange = 'last-30-days') =>
      makeRequest('get', '/performance/lead-status', null, { params: { dateRange } }),
    getConversionTrend: (days = 7) =>
      makeRequest('get', '/performance/conversion-trend', null, { params: { days } }),
    updateEmployeePerformance: (employeeId, performanceData) =>
      makeRequest('put', `/users/${employeeId}`, { performance: performanceData }),
    syncPerformanceData: async () => {
      try {
        // Get all employees
        const employeesResponse = await makeRequest('get', '/users/role/employee');

        // Get all leads
        const leadsResponse = await makeRequest('get', '/leads');

        if (employeesResponse?.data && leadsResponse?.data) {
          const employees = employeesResponse.data;
          const leads = leadsResponse.data;

          // Process and return the data
          return {
            success: true,
            employees,
            leads,
            message: 'Performance data synced successfully'
          };
        }

        return {
          success: false,
          message: 'Failed to sync performance data'
        };
      } catch (error) {
        console.error('Error syncing performance data:', error);
        return {
          success: false,
          message: 'Error syncing performance data',
          error: error.message || 'Unknown error'
        };
      }
    }
  },

  // Reminder endpoints
  reminders: {
    getAll: () => makeRequest('get', '/reminders'),
    getById: (id) => makeRequest('get', `/reminders/${id}`),
    create: (data) => makeRequest('post', '/reminders', data),
    update: (id, data) => makeRequest('put', `/reminders/${id}`, data),
    delete: (id) => makeRequest('delete', `/reminders/${id}`),
    toggleComplete: (id) => makeRequest('patch', `/reminders/${id}/toggle`),
  },

  // Follow-up endpoints
  followUps: {
    getAll: (params = {}) => makeRequest('get', '/follow-ups', null, { params }),
    getById: (id) => makeRequest('get', `/follow-ups/${id}`),
    getByLead: (leadId) => makeRequest('get', `/follow-ups/lead/${leadId}`),
    getByEmployee: (employeeId, params = {}) => makeRequest('get', `/follow-ups/employee/${employeeId}`, null, { params }),
    create: (data) => makeRequest('post', '/follow-ups', data),
    update: (id, data) => makeRequest('put', `/follow-ups/${id}`, data),
    delete: (id) => makeRequest('delete', `/follow-ups/${id}`),
    markComplete: (id) => makeRequest('patch', `/follow-ups/${id}/complete`),

    // Fallback method to update lead with follow-up data if dedicated endpoint fails
    addToLead: async (leadId, followUpData) => {
      try {
        // Try to use the dedicated follow-up endpoint first
        const response = await makeRequest('post', '/follow-ups', {
          ...followUpData,
          leadId
        });
        return response;
      } catch (error) {
        console.log('Error using dedicated follow-up endpoint, falling back to lead update:', error);

        // Fall back to updating the lead with the follow-up data
        try {
          // Get the current lead data
          const leadResponse = await makeRequest('get', `/leads/${leadId}`);
          const lead = leadResponse.data;

          // Add the follow-up to the lead's followUps array
          const followUps = lead.followUps || [];
          const newFollowUp = {
            id: Date.now().toString(), // Generate a unique ID
            ...followUpData,
            createdAt: new Date().toISOString()
          };

          // Update the lead with the new follow-up
          const updateResponse = await makeRequest('put', `/leads/${leadId}`, {
            ...lead,
            followUps: [...followUps, newFollowUp]
          });

          return {
            success: true,
            data: newFollowUp,
            message: 'Follow-up added to lead successfully (fallback method)'
          };
        } catch (fallbackError) {
          console.error('Fallback method also failed:', fallbackError);
          throw fallbackError;
        }
      }
    }
  }
};

export default enhancedAPI;
