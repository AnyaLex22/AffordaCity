import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://affordacity.onrender.com/api',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// GET user calculations
export const getUserCalculations = () => {
  return apiClient.get('/user-calculations');
};

// PUT to update
export const updateCalculation = (timestamp, salary) => {
  return apiClient.put('/update-calculation', { timestamp, salary });
};

// DELETE
export const deleteCalculation = (timestamp) => {
  return apiClient.delete('/delete-calculation', {
    data: { timestamp }
  });
};

apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('✅ Token attached:', token);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in localStorage when sending request to:', config.url);
    }

    const needsPrefix =
      config.url &&
      !config.url.startsWith('/api') &&  // Add this
      !config.url.startsWith('/auth') &&
      !config.url.includes('http');
    if (needsPrefix) {
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
