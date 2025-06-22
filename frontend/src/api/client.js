import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// request interceptor for error handling
apiClient.interceptors.request.use(
  config => {
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// response interceptor
apiClient.interceptors.response.use(
  response => {
    return response.data; // Automatically unwrap the data
  },
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;