import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token'); // or 'authToken' if that's what you saved
  if (token) {
    req.headers['x-auth-token'] = token; // ✅ backend expects this exact header
  }
  return req;
});

export default API;
