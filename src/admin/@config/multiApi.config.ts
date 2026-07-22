// // multipartApi.Config.ts
// import axios from "axios";
// import { ENV } from "./ENV.config";
// import { LocalStorageService } from "@admin/utils/localStorage.service";

// const ACCESS_TOKEN_KEY = "authInfo";

// export const MultipartApiIn = axios.create({
//   baseURL: ENV.ApiEndpoint ?? "",
//   headers: {
//     Accept: "application/json",
//   },
// });

// // ✅ Request Interceptor
// MultipartApiIn.interceptors.request.use((config) => {
//   const authInfo = LocalStorageService.get(ACCESS_TOKEN_KEY);
//   if (authInfo?.accessToken) {
//     config.headers.Authorization = authInfo.accessToken;
//   }
//   return config;
// });
