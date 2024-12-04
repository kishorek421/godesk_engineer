import axios, { AxiosError } from "axios";
import { BASE_URL } from "@/config/env";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/storage_keys";
import { getItem, setItem } from "@/utils/secure_store";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    // await setItem(
    //   AUTH_TOKEN_KEY,
    //   "eyJhbGciOiJIUzUxMiJ9.eyJwYXNzd29yZCI6Ik5GVFdMNzltOTNLU3IvS1crdDNLRzI3YWxWT2l4bGg1a0FGVnhROG1VRlk9Iiwicm9sZSI6WyJGSUVMRF9FTkdJTkVFUiJdLCJpZCI6IjliYTA0OWQxLTFiNTEtNGNlMS05MzkyLTViYTUyZjE1NWY0OSIsInVzZXJPcmdEZXRhaWxzIjp7ImxlYWRJZCI6ImUwZmJlZmNiLTFiZWYtNDhhNy1hNmVmLTlmZThhZTczYzk3ZiIsIm9yZ0lkIjoiYjBiYzhiZTUtZTRlYi00NTAzLWE4MTMtMTNiOTdiNzZjNzczIiwib3JnRGVwYXJ0bWVudElkIjoiMjUxMWI0NGQtOTE1ZC00NTM1LTliNzgtMGVjNTkyYzBhMDFjIiwib3JnRGVzaWduYXRpb25JZCI6IjY1MWYwYjNjLWM3ZDAtNGQyNi05NzEwLWE0NGJiZGFlMWQyZCJ9LCJlbWFpbCI6ImJoYXJhdGlwYXJpdDRAZ21haWwuY29tIiwidXNlcm5hbWUiOiJCaGFyYXRpIiwic3ViIjoiYmhhcmF0aXBhcml0NEBnbWFpbC5jb20iLCJpYXQiOjE3MzMyMjQyMzQsImV4cCI6MTczMzI1MzAzNH0.979q9XCjMS9FoenTFX3m0cSLfBxe4fWBdmLoGzOcsjCYbCI2Jn3Z-sqYKDnxJNxo2BL9HUw2sAPqDWhy38dgYQ");
    let token = await getItem(AUTH_TOKEN_KEY);
    if (token) {
      try {
        await axios.post(BASE_URL + `/login/validate?token=${token}`, {});
        // console.log(validateResponse);
      } catch (e) {
        console.error("token invalid");
        try {
          const refreshToken = await getItem(REFRESH_TOKEN_KEY);
          console.log("refreshToken", refreshToken);
          const response = await axios.get(
            BASE_URL + "/login/refresh_token" + `?refreshToken=${refreshToken}`,
          );
          const newToken = response.data?.data?.accessToken;
          await setItem(AUTH_TOKEN_KEY, newToken);
          console.log("newToken", newToken);
          token = newToken;
        } catch (e) {
          console.error("Refresh token error");
          if (e && e instanceof AxiosError) {
            console.log(e.response?.data);
          }
        }
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log("error ->>>>>>>>>>>>>>>>>>>", error);
    return Promise.reject(error);
  },
);

export default apiClient;
