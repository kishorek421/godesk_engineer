import axios from "axios";
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
    await setItem(
      AUTH_TOKEN_KEY,
      "eyJhbGciOiJIUzUxMiJ9.eyJwYXNzd29yZCI6IjZLU0IyR3VhTDluUC9zdEowaWd2MXk2R3JHdjVnRmJSSzJ1dzNwVjIzL289Iiwicm9sZSI6WyJGSUVMRF9FTkdJTkVFUiJdLCJpZCI6ImFiMTliOTk5LTE1ODEtNDE5My1iOWUyLTk2N2UxNWZiZjUzZCIsInVzZXJPcmdEZXRhaWxzIjp7ImxlYWRJZCI6IjIxYWUzYWI3LTg2NWYtNGQ0Yi05OTBiLThjMDU2ZWRlZTE2MSIsIm9yZ0lkIjoiYjBiYzhiZTUtZTRlYi00NTAzLWE4MTMtMTNiOTdiNzZjNzczIiwib3JnRGVwYXJ0bWVudElkIjoiMjUxMWI0NGQtOTE1ZC00NTM1LTliNzgtMGVjNTkyYzBhMDFjIiwib3JnRGVzaWduYXRpb25JZCI6ImM1YzRkMjE2LTZiMmItNDI2Ny05YWFiLTk5Nzg1MGFkZTZhYiJ9LCJlbWFpbCI6ImJvamphbWFoaTg1NzJAZ21haWwuY29tIiwidXNlcm5hbWUiOiJNYWhpIiwic3ViIjoiYm9qamFtYWhpODU3MkBnbWFpbC5jb20iLCJpYXQiOjE3MzMxOTU2OTMsImV4cCI6MTczMzIyNDQ5M30.5vGrELO6UwtEEptMI35g_LISi8p2Kvc45vyO39NjOQOMGee0Q8L2vLyosWpLQXQykgOdmo62iMc002ObQYkU9A");
    let token = await getItem(AUTH_TOKEN_KEY);
    if (token) {
      try {
        await axios.post(BASE_URL + `/login/validate?token=${token}`, {});
      } catch (e) {
        console.error(e);
        const refreshToken = await getItem(REFRESH_TOKEN_KEY);
        const response = await axios.post(BASE_URL + "/auth/refresh-token", {
          token: refreshToken,
        });
        const newToken = response.data.token;
        await setItem(AUTH_TOKEN_KEY, newToken);
        token = newToken;
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
