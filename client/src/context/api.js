import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:8000/api',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

const api = axios.create({
  baseURL: "http://localhost/api",
  headers: {
    "Content-Type": "application/json",
  }
})

// Interceptor to add Token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;