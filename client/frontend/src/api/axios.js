import axios from 'axios';

// Use the deployed backend URL for production, localhost for development
const API = axios.create({
  baseURL: process.env.VITE_API_BASE || 'http://localhost:5000/api',
});

// Attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token'); // Adjust if you use a different key
  if (token) {
    req.headers['x-auth-token'] = token; // ✅ matches backend expectation
  }
  return req;
});

export default API;
