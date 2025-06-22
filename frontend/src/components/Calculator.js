import apiClient from '../api/client';

// In your React components
fetch(`${process.env.REACT_APP_API_URL}/api/cities`)
  .then(response => response.json())
  .then(data => console.log(data));