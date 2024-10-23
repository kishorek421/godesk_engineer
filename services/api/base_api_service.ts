import { BASE_URL } from "@/config/env";
import { AUTH_TOKEN_KEY } from "@/constants/storage_keys";
import axios from "axios";
import { getItem, setItem } from "@/utils/secure_store";

const apiService = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the token to headers
apiService.interceptors.request.use(
  async (config) => {
    // console.log(config);
    // await setItem(
    //   AUTH_TOKEN_KEY,
    //   "eyJhbGciOiJIUzUxMiJ9.eyJwYXNzd29yZCI6IjB6bHBrRko0SVRWZWhXSDNSeXRVTVByRTl3VlNHcUdaUUF3djRSNnIvOEk9Iiwicm9sZSI6WyJDVVNUT01FUiJdLCJpZCI6ImI5NGViMjg5LTU2M2UtNGEwNC1iNTU4LTEzNGNmMmI0YmQ3OCIsInVzZXJPcmdEZXRhaWxzIjp7ImxlYWRJZCI6IjVmZjg1NzNlLTJiYmQtNDdkNy1hNTFmLTA1MDkxYjgwOGRlNCIsIm9yZ0lkIjoiYjBiYzhiZTUtZTRlYi00NTAzLWE4MTMtMTNiOTdiNzZjNzczIiwib3JnRGVwYXJ0bWVudElkIjoiNGFiNjRkMDMtNDZiYy00MTIwLTkwNDUtOWJlM2MxNDcyODgzIiwib3JnRGVzaWduYXRpb25JZCI6IjZkODBkMWViLTViNTctNDk0ZS1iNzNhLWQ1ZTg3ODZlMDdjMCJ9LCJlbWFpbCI6ImN1c3RvbWVyMUBnbWFpbC5jb20iLCJ1c2VybmFtZSI6IlJhanUiLCJzdWIiOiJjdXN0b21lcjFAZ21haWwuY29tIiwiaWF0IjoxNzI1MTIxNTM2LCJleHAiOjE3MjUxNTAzMzZ9.ZbcUA1TvwwP177yCQqFPBsmDAUxL66XGP3d4nOaXxCkarmLrUANPZ57iR0Q8aZSxDt0JuTx0rKFDxK9XwQ5u2A",
    // );
    const token = await getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // await removeItem(AUTH_TOKEN_KEY);
    }
    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors globally
apiService.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log("error -> ", error);
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized, logging out...");
    }
    console.error("API Error:", error.response?.data);
    return Promise.reject(error);
  },
);

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     if (
//       error.response &&
//       error.response.status === 401 &&
//       !originalRequest._retry
//     ) {
//       originalRequest._retry = true;
//       const refreshToken = await getItem(REFRESH_TOKEN_KEY);
//       const response = await api.post("/auth/refresh-token", {
//         token: refreshToken,
//       });
//       const newToken = response.data.token;
//
//       await setItem(AUTH_TOKEN_KEY, newToken);
//       api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
//       originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
//       return api(originalRequest);
//     }
//     return Promise.reject(error);
//   },
// );

export default apiService;
