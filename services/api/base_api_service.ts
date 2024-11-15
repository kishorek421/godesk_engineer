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
    console.log(config);
    await setItem(
      AUTH_TOKEN_KEY,
      "eyJhbGciOiJIUzUxMiJ9.eyJwYXNzd29yZCI6Ik5GVFdMNzltOTNLU3IvS1crdDNLRzI3YWxWT2l4bGg1a0FGVnhROG1VRlk9Iiwicm9sZSI6WyJGSUVMRF9FTkdJTkVFUiJdLCJpZCI6IjliYTA0OWQxLTFiNTEtNGNlMS05MzkyLTViYTUyZjE1NWY0OSIsInVzZXJPcmdEZXRhaWxzIjp7ImxlYWRJZCI6ImUwZmJlZmNiLTFiZWYtNDhhNy1hNmVmLTlmZThhZTczYzk3ZiIsIm9yZ0lkIjoiYjBiYzhiZTUtZTRlYi00NTAzLWE4MTMtMTNiOTdiNzZjNzczIiwib3JnRGVwYXJ0bWVudElkIjoiMjUxMWI0NGQtOTE1ZC00NTM1LTliNzgtMGVjNTkyYzBhMDFjIiwib3JnRGVzaWduYXRpb25JZCI6IjY1MWYwYjNjLWM3ZDAtNGQyNi05NzEwLWE0NGJiZGFlMWQyZCJ9LCJlbWFpbCI6ImJoYXJhdGlwYXJpdDRAZ21haWwuY29tIiwidXNlcm5hbWUiOiJCaGFyYXRpIiwic3ViIjoiYmhhcmF0aXBhcml0NEBnbWFpbC5jb20iLCJpYXQiOjE3MzE1NjU4ODIsImV4cCI6MTczMTU5NDY4Mn0.W_k47R9qDRzoOg2M7vosfb1SNpEGjKUDCiMa-k9apFsqAbqHCW8ZpMJvBlAxzGQ6T6UT_NHPzWwiPJjO_Afdfw",
    );
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
