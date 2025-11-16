// src/services/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: '/api', // đi qua proxy Vite
});

// Gắn token nếu sau này có login
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
