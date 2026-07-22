// import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
// import { ENV } from "./env.config";
// declare module "axios" {
//   interface AxiosRequestConfig {
//     next?: {
//       revalidate?: number | false;
//       tags?: string[];
//     };
//   }
// }

// const isServer = typeof window === "undefined";
// const instance: AxiosInstance = axios.create({
//   baseURL: isServer ? ENV.ApiEndpoint : "/",

//   headers: { "Content-Type": "multipart/form-data" },
//   timeout: 10000,
//   withCredentials: true,
// });

// // Request interceptor (same as before)
// instance.interceptors.request.use((config) => {
//   if (typeof window === "undefined" && config.next) {
//     if (config.next.revalidate !== undefined) {
//       config.headers["x-vercel-revalidate"] = config.next.revalidate;
//     }
//     if (config.next.tags) {
//       config.headers["x-vercel-cache-tag"] = config.next.tags.join(",");
//     }
//   }
//   return config;
// });

// // Response interceptor (same as before)
// instance.interceptors.response.use(
//   (response: AxiosResponse) => response.data,
//   (error: AxiosError) => {
//     if (error.response) {
//       return Promise.reject({
//         status: error.response.status,
//         message: error.message,
//         data: error.response.data,
//       });
//     } else if (error.request) {
//       return Promise.reject({
//         status: 503,
//         message: "Service unavailable",
//       });
//     } else {
//       return Promise.reject({
//         status: 500,
//         message: "Request setup error",
//       });
//     }
//   }
// );
// export const multipartApiIns = instance;

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
  baseURL: isServer ? ENV.ApiEndpoint : "/",
  headers: { "Content-Type": "multipart/form-data" },
  timeout: 10000,
  withCredentials: true,
});

// ✅ Request interceptor
instance.interceptors.request.use((config) => {
  if (typeof window === "undefined" && config.next) {
    if (config.next.revalidate !== undefined) {
      config.headers["x-vercel-revalidate"] = config.next.revalidate;
    }
    if (config.next.tags) {
      config.headers["x-vercel-cache-tag"] = config.next.tags.join(",");
    }
  }
  return config;
});

// ✅ Response interceptor
instance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    if (error.response) {
      const resData: any = error.response.data;
      const backendMessage =
        resData?.message ||
        resData?.error ||
        resData?.errorSources?.[0]?.message ||
        error.message;

      return Promise.reject({
        status: error.response.status,
        message: backendMessage,
        data: resData,
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
  }
);

export const multipartApiIns = instance;
