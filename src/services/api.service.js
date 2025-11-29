import API_CONFIG from '../config/api';
import Logger from '../utils/logger';
import { removeSensitiveData } from '../utils/securityUtils';

const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  getFullUrl(endpoint) {
    return `${this.baseURL}${endpoint}`;
  }

  /**
   * Retry logic for failed requests
   */
  async retryRequest(fn, retries = MAX_RETRIES) {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error)) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.retryRequest(fn, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Determine if request should be retried
   */
  shouldRetry(error) {
    // Retry on network errors or 5xx server errors
    if (!error.response) return true;
    const status = error.response?.status;
    return status >= 500 || status === 408 || status === 429;
  }

  /**
   * Create AbortController with timeout
   */
  createTimeoutController(timeout = REQUEST_TIMEOUT) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller;
  }

  async request(endpoint, options = {}) {
    const url = this.getFullUrl(endpoint);
    const token = localStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    // If body is FormData, let the browser set Content-Type
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    // Create timeout controller if not provided
    const controller = options.signal ? null : this.createTimeoutController();

    const config = {
      ...options,
      headers,
      signal: options.signal || controller?.signal,
    };

    try {
      const response = await this.retryRequest(async () => {
        const res = await fetch(url, config);

        // Log API calls in development only
        if (process.env.NODE_ENV === 'development') {
          // Skip logging in production for security
        }

        return res;
      });

      // Handle non-OK responses
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.response = response;
        error.status = response.status;

        // Try to get error details from response
        try {
          const errorData = await response.json();
          error.data = errorData;
          error.message = errorData.message || error.message;
        } catch {
          // Response might not be JSON
        }

        Logger.apiError(url, error);
        throw error;
      }

      return response;
    } catch (error) {
      // Handle timeout
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timeout');
        timeoutError.isTimeout = true;
        Logger.error('Request timeout:', timeoutError);
        throw timeoutError;
      }

      // Network error or other fetch errors
      Logger.error('API request failed:', removeSensitiveData(error));
      throw error;
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Helper method to parse JSON response with error handling
   */
  async parseResponse(response) {
    try {
      return await response.json();
    } catch (error) {
      Logger.error('Failed to parse response:', error);
      throw new Error('Invalid response format');
    }
  }
}

export default new ApiService();