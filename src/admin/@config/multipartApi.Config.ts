// import axios, {
//   AxiosError,
//   AxiosResponse,
//   InternalAxiosRequestConfig,
// } from "axios";
// import { ENV } from "./ENV.config";
// import { LocalStorageService } from "@admin/utils/localStorage.service";

// const ACCESS_TOKEN_KEY = "authInfo";

// const instance = axios.create({
//   baseURL: ENV.ApiEndpoint as string,
//   headers: {
//     Accept: "application/json",
//   },
// });

// let isRefreshing = false;
// let failedQueue: Array<{
//   resolve: (value?: unknown) => void;
//   reject: (error?: unknown) => void;
// }> = [];

// const processQueue = (
//   error: AxiosError | null,
//   token: string | null = null
// ) => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });

//   failedQueue = [];
// };

// // 👉 REQUEST INTERCEPTOR
// instance.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const authInfo = LocalStorageService.get(ACCESS_TOKEN_KEY);

//     if (authInfo?.accessToken) {
//       config.headers.Authorization = authInfo.accessToken; // ✅ Only token, no Bearer
//     }

//     return config;
//   },
//   (error: AxiosError) => {
//     return Promise.reject({
//       status: false,
//       message: "Request Error",
//       errors: [error.message],
//     });
//   }
// );

// // 👉 RESPONSE INTERCEPTOR
// instance.interceptors.response.use(
//   (res: AxiosResponse) => {
//     if (res.data?.success) {
//       return res.data;
//     }
//     return Promise.reject(res.data);
//   },
//   async (error: AxiosError) => {
//     const originalRequest: any = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       const authInfo = LocalStorageService.get(ACCESS_TOKEN_KEY);

//       if (!authInfo?.refreshToken) {
//         return Promise.reject({
//           status: 401,
//           // message: "No refresh token found",
//         });
//       }

//       if (isRefreshing) {
//         return new Promise(function (resolve, reject) {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             originalRequest.headers.Authorization = token;
//             return instance(originalRequest);
//           })
//           .catch((err) => Promise.reject(err));
//       }

//       isRefreshing = true;

//       try {
//         const response = await axios.post(
//           `${ENV.ApiEndpoint}/auth/create-access-token`,
//           { refresh_token: authInfo.refreshToken }
//         );

//         if (response.data?.success) {
//           const newAccessToken = response?.data?.data?.accessToken;

//           // 🔄 Save new token
//           LocalStorageService.set(ACCESS_TOKEN_KEY, {
//             ...authInfo,
//             accessToken: newAccessToken,
//           });

//           // 🔄 Update axios headers
//           instance.defaults.headers.common.Authorization = newAccessToken;

//           // 🔄 Resolve queued requests
//           processQueue(null, newAccessToken);

//           originalRequest.headers.Authorization = newAccessToken;
//           return instance(originalRequest);
//         } else {
//           processQueue(new AxiosError("Failed to refresh token"), null);
//           return Promise.reject(response.data);
//         }
//       } catch (err: any) {
//         processQueue(err, null);
//         LocalStorageService.remove(ACCESS_TOKEN_KEY);
//         return Promise.reject(err);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     if (error.response) {
//       return Promise.reject(error.response.data);
//     } else {
//       return Promise.reject({
//         status: 404,
//         message: "Server not responding",
//         payload: {},
//       });
//     }
//   }
// );

// export const MultipartApiIns = instance;

import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ENV } from "./ENV.config";
import { LocalStorageService } from "@admin/utils/localStorage.service";
import { ADMIN_LOGIN_ROUTE } from "@admin/utils/adminPath";

const ACCESS_TOKEN_KEY = "authInfo";
const LOGIN_ROUTE = ADMIN_LOGIN_ROUTE;

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
};

const multipartInstance = axios.create({
  baseURL: ENV.ApiEndpoint as string,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

const normalizeToken = (token?: string | null) =>
  token?.trim().replace(/^["']|["']$/g, "") || "";

const getCookie = (cookieName: string): string | null => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.split("=");
    if (name === cookieName) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
};

const setCookie = (name: string, value: string, maxAge?: number) => {
  if (typeof document === "undefined") return;

  const isHttps = window.location.protocol === "https:";
  let cookie = `${name}=${encodeURIComponent(value)}; path=/; samesite=lax`;

  if (typeof maxAge === "number") {
    cookie += `; max-age=${maxAge}`;
  }

  if (isHttps) {
    cookie += "; secure";
  }

  document.cookie = cookie;
};

const removeCookie = (name: string) => {
  if (typeof document === "undefined") return;

  const hostname = window.location.hostname;
  const domains = [undefined, hostname, `.${hostname}`];
  const securePart = window.location.protocol === "https:" ? "; secure" : "";

  for (const domain of domains) {
    const domainPart = domain ? `; domain=${domain}` : "";

    document.cookie = `${name}=; path=/${domainPart}; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax${securePart}`;
    document.cookie = `${name}=; path=/${domainPart}; max-age=0; samesite=lax${securePart}`;
  }
};

let isRefreshing = false;
let isLoggingOut = false;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((item) => {
    if (error) item.reject(error);
    else if (token) item.resolve(token);
    else item.reject(new Error("No token available"));
  });

  failedQueue = [];
};

const redirectToLogin = () => {
  if (typeof window === "undefined") return;

  const loginUrl = new URL(LOGIN_ROUTE, window.location.origin);
  loginUrl.searchParams.set("logout", "1");
  loginUrl.searchParams.set("_t", String(Date.now()));

  window.location.replace(loginUrl.toString());
};

const forceLogout = () => {
  if (typeof window === "undefined" || isLoggingOut) return;

  isLoggingOut = true;

  try {
    LocalStorageService.remove(ACCESS_TOKEN_KEY);

    removeCookie("authToken");
    removeCookie("refreshToken");

    delete multipartInstance.defaults.headers.common.Authorization;

    sessionStorage.setItem("force_logged_out", "1");
    sessionStorage.setItem("force_logged_out_at", String(Date.now()));
  } finally {
    redirectToLogin();
  }
};

multipartInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // multipart/form-data এর ক্ষেত্রে browser boundary set করবে
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    const token = normalizeToken(getCookie("authToken"));

    if (token) {
      config.headers.Authorization = token;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject({
      status: false,
      message: "Request Error",
      errors: [error.message],
    });
  },
);

multipartInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    if (res.data?.success) return res.data;
    return Promise.reject(res.data);
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const requestUrl = originalRequest.url || "";

    if (isLoggingOut) {
      return Promise.reject(error.response?.data || error);
    }

    if (status === 401 && requestUrl.includes("/auth/create-access-token")) {
      processQueue(new Error("Refresh token expired"), null);
      forceLogout();
      return Promise.reject(error.response?.data || error);
    }

    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest._skipAuthRefresh
    ) {
      originalRequest._retry = true;

      const refreshToken = normalizeToken(getCookie("refreshToken"));

      if (!refreshToken) {
        processQueue(new Error("No refresh token found"), null);
        forceLogout();
        return Promise.reject({
          status: 401,
          message: "No refresh token found",
        });
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = newToken;
            }
            return multipartInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const response = await axios.post(
          `${ENV.ApiEndpoint}/auth/create-access-token`,
          { refresh_token: refreshToken },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        );

        if (!response.data?.success) {
          throw new Error(response.data?.message || "Failed to refresh token");
        }

        const newAccessToken = response.data?.data?.accessToken;

        if (!newAccessToken) {
          throw new Error("No access token returned");
        }

        setCookie("authToken", newAccessToken, 60 * 60 * 24 * 7);

        multipartInstance.defaults.headers.common.Authorization =
          newAccessToken;

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = newAccessToken;
        }

        return multipartInstance(originalRequest);
      } catch (err: any) {
        processQueue(err, null);
        forceLogout();
        return Promise.reject(err?.response?.data || err);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 401) {
      forceLogout();
      return Promise.reject(error.response?.data || error);
    }

    if (error.response) {
      return Promise.reject(error.response.data);
    }

    return Promise.reject({
      status: 500,
      message: "Server not responding",
      payload: {},
    });
  },
);

export const MultipartApiIns = multipartInstance;
