import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { ENV } from "./env.config";
declare module "axios" {
  interface AxiosRequestConfig {
    next?: {
      revalidate?: number | false;
      tags?: string[];
    };
  }
}

const isServer = typeof window === "undefined";
const instance: AxiosInstance = axios.create({
  baseURL: ENV.ApiEndpoint,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor (same as before)
instance.interceptors.request.use(
  (config) => {
    if (typeof window === "undefined" && config.next) {
      if (config.next.revalidate !== undefined) {
        config.headers["x-vercel-revalidate"] = config.next.revalidate;
      }
      if (config.next.tags) {
        config.headers["x-vercel-cache-tag"] = config.next.tags.join(",");
      }
    }

    // Debug logging for development
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      const fullUrl = config.baseURL
        ? `${config.baseURL}${config.url || ""}`
        : config.url;
    }

    return config;
  },
  (error) => {
    console.error("[API] Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor (same as before)
instance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    if (error.response) {
      return Promise.reject({
        status: error.response.status,
        message: error.message,
        data: error.response.data,
      });
    } else if (error.request) {
      return Promise.reject({
        status: 503,
        message: "Service unavailable",
      });
    } else {
      return Promise.reject({
        status: 500,
        message: "Request setup error",
      });
    }
  },
);
export const apiIns = instance;
