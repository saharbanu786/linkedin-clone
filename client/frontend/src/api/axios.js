import axios from 'axios';
console.log("👉 API Base URL:", import.meta.env.VITE_API_BASE);

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token'); 
  if (token) {
    req.headers['x-auth-token'] = token; 
  }
  return req;
});

export default API;
