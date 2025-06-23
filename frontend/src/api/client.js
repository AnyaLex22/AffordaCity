import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor
apiClient.interceptors.request.use(
  config => {
    // Add /api prefix if needed
    if (!config.url.startsWith('/api') && !config.url.startsWith('/auth')) {
      config.url = `/api${config.url}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor
apiClient.interceptors.response.use(
  response => {
    if (response.data && response.data.error) {
      return Promise.reject({
        message: response.data.message || 'API Error',
        data: response.data,
        status: response.status
      });
    }
    return response.data;
  },
  error => {
    const errorMessage = error.response?.data?.message ||
                         error.message ||
                         'Network Error';
    const errorDetails = {
      message: errorMessage,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    };

    console.error('API Error Details:', errorDetails);
    return Promise.reject(errorDetails);
  }
);

export default apiClient;
