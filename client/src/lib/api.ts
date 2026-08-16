import axios, { type AxiosError } from "axios";
import { API_URL } from "./constants";
import type { ApiResponse } from "@/types";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname;
      if (!path.startsWith("/login") && !path.startsWith("/register") && path !== "/") {
        localStorage.removeItem("token");
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await api.get<ApiResponse<T>>(url, { params });
  return data.data;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.post<ApiResponse<T>>(url, body);
  return data.data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.patch<ApiResponse<T>>(url, body);
  return data.data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const { data } = await api.delete<ApiResponse<T>>(url);
  return data.data;
}
