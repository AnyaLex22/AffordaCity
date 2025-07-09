import axios from 'axios';

const client = axios.create({
  baseURL: 'https://affordacity.onrender.com', // your backend base URL
});

// Attach JWT token to every request if available
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token attached:", token);
    } else {
      console.warn("⚠️ No token found in localStorage when sending request to:", config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default client;
