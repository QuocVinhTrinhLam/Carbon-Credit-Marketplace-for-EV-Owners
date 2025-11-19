// src/services/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "/api", // FE -> Vite proxy -> BE
});

// Gắn token tự động (nếu có login)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {}; // tránh lỗi undefined
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});
