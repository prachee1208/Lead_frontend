import { enhancedAPI, getConnectionStatus } from './enhancedAPI';

// Cache configuration
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_SIZE_LIMIT = 100; // Maximum number of items in cache

// Cache storage
const cache = {
  data: new Map(),
  timestamps: new Map(),
  accessOrder: [],
};

// Pending requests tracking to prevent duplicate requests
const pendingRequests = new Map();

/**
 * Cache management functions
 */
const cacheManager = {
  // Get item from cache
  get: (key) => {
    const data = cache.data.get(key);
    const timestamp = cache.timestamps.get(key);

    // Check if data exists and is not expired
    if (data && timestamp && Date.now() - timestamp < CACHE_EXPIRY) {
      // Update access order for LRU eviction
      const index = cache.accessOrder.indexOf(key);
      if (index > -1) {
        cache.accessOrder.splice(index, 1);
      }
      cache.accessOrder.push(key);

      return data;
    }

    // Remove expired data
    if (data) {
      cacheManager.remove(key);
    }

    return null;
  },

  // Set item in cache
  set: (key, data) => {
    // Enforce cache size limit with LRU eviction
    if (cache.data.size >= CACHE_SIZE_LIMIT && !cache.data.has(key)) {
      const oldestKey = cache.accessOrder.shift();
      cacheManager.remove(oldestKey);
    }

    // Update access order
    const index = cache.accessOrder.indexOf(key);
    if (index > -1) {
      cache.accessOrder.splice(index, 1);
    }
    cache.accessOrder.push(key);

    // Store data and timestamp
    cache.data.set(key, data);
    cache.timestamps.set(key, Date.now());
  },

  // Remove item from cache
  remove: (key) => {
    cache.data.delete(key);
    cache.timestamps.delete(key);

    const index = cache.accessOrder.indexOf(key);
    if (index > -1) {
      cache.accessOrder.splice(index, 1);
    }
  },

  // Clear entire cache or by prefix
  clear: (prefix = null) => {
    if (prefix) {
      // Clear only items with matching prefix
      [...cache.data.keys()].forEach(key => {
        if (key.startsWith(prefix)) {
          cacheManager.remove(key);
        }
      });
    } else {
      // Clear entire cache
      cache.data.clear();
      cache.timestamps.clear();
      cache.accessOrder = [];
    }
  }
};

/**
 * Data fetcher with caching, deduplication, and offline support
 */
export const dataFetcher = {
  /**
   * Fetch data with caching and request deduplication
   * @param {string} key - Unique key for the request
   * @param {Function} fetchFn - Function that returns a promise with the data
   * @param {Object} options - Configuration options
   * @returns {Promise<any>} - The fetched data
   */
  fetch: async (key, fetchFn, options = {}) => {
    const {
      bypassCache = false,
      forceRefresh = false,
      offlineData = null,
      onSuccess = null,
      onError = null,
    } = options;

    // Check if we're offline and have offline data
    if (!getConnectionStatus() && offlineData) {
      console.log(`Using offline data for ${key}`);
      return offlineData;
    }

    // Check cache first if not bypassing
    if (!bypassCache && !forceRefresh) {
      const cachedData = cacheManager.get(key);
      if (cachedData) {
        console.log(`Cache hit for ${key}`);
        return cachedData;
      }
    }

    // Check for pending requests to avoid duplicates
    if (pendingRequests.has(key)) {
      console.log(`Joining pending request for ${key}`);
      return pendingRequests.get(key);
    }

    // Create the fetch promise
    const fetchPromise = (async () => {
      try {
        console.log(`Fetching data for ${key}`);
        const data = await fetchFn();

        // Cache the successful result
        if (!bypassCache) {
          cacheManager.set(key, data);
        }

        // Call success callback if provided
        if (onSuccess) {
          onSuccess(data);
        }

        return data;
      } catch (error) {
        console.error(`Error fetching data for ${key}:`, error);

        // Call error callback if provided
        if (onError) {
          onError(error);
        }

        // Use offline data if available
        if (offlineData) {
          console.log(`Falling back to offline data for ${key}`);
          return offlineData;
        }

        throw error;
      } finally {
        // Remove from pending requests
        pendingRequests.delete(key);
      }
    })();

    // Store the promise to deduplicate concurrent requests
    pendingRequests.set(key, fetchPromise);

    return fetchPromise;
  },

  /**
   * Invalidate cache entries
   * @param {string} prefix - Prefix to match for selective invalidation
   */
  invalidateCache: (prefix = null) => {
    cacheManager.clear(prefix);
  },

  /**
   * Fetch leads with caching and filtering
   * @param {Object} params - Query parameters
   * @param {Object} options - Fetch options
   * @returns {Promise<Array>} - Array of leads
   */
  fetchLeads: (params = {}, options = {}) => {
    // Ensure we have a high limit to get all leads
    const enhancedParams = {
      ...params,
      limit: params.limit || 100 // Default to 100 if not specified
    };
    const key = `leads:${JSON.stringify(enhancedParams)}`;
    return dataFetcher.fetch(key, () => enhancedAPI.leads.getAll(enhancedParams), options);
  },

  /**
   * Fetch leads assigned to an employee
   * @param {string} employeeId - Employee ID
   * @param {Object} params - Additional query parameters
   * @param {Object} options - Fetch options
   * @returns {Promise<Array>} - Array of leads assigned to the employee
   */
  fetchEmployeeLeads: (employeeId, params = {}, options = {}) => {
    console.log('dataFetcher.fetchEmployeeLeads called with employeeId:', employeeId);
    const key = `leads:employee:${employeeId}:${JSON.stringify(params)}`;
    return dataFetcher.fetch(key, async () => {
      console.log('Executing API call to get employee leads');
      try {
        const result = await enhancedAPI.leads.getByEmployee(employeeId, params);
        console.log('API call successful, result:', result);
        return result;
      } catch (error) {
        console.error('API call failed:', error);
        throw error;
      }
    }, options);
  },

  // Fetch leads assigned by a manager
  fetchAssignedLeads: (managerId, params = {}, options = {}) => {
    console.log('dataFetcher.fetchAssignedLeads called with managerId:', managerId);
    const key = `leads:assigned:${managerId}:${JSON.stringify(params)}`;
    return dataFetcher.fetch(key, async () => {
      console.log('Executing API call to get assigned leads');
      try {
        const result = await enhancedAPI.leads.getAssignedByManager(managerId, params);
        console.log('API call successful, result:', result);
        return result;
      } catch (error) {
        console.error('API call failed:', error);
        throw error;
      }
    }, options);
  },

  /**
   * Fetch users by role
   * @param {string} role - User role (employee, manager, admin)
   * @param {Object} options - Fetch options
   * @returns {Promise<Array>} - Array of users with the specified role
   */
  fetchUsersByRole: (role, options = {}) => {
    const key = `users:role:${role}`;
    return dataFetcher.fetch(key, () => enhancedAPI.users.getByRole(role), options);
  },

  /**
   * Fetch all employees
   * @param {Object} params - Additional query parameters
   * @param {Object} options - Fetch options
   * @returns {Promise<Array>} - Array of employees
   */
  fetchEmployees: (params = {}, options = {}) => {
    console.log('dataFetcher.fetchEmployees called');
    const key = `users:employees:${JSON.stringify(params)}`;
    return dataFetcher.fetch(key, async () => {
      console.log('Executing API call to get employees');
      try {
        const result = await enhancedAPI.users.getByRole('employee');
        console.log('API call successful, result:', result);
        return result;
      } catch (error) {
        console.error('API call failed:', error);
        throw error;
      }
    }, options);
  }
};

export default dataFetcher;
