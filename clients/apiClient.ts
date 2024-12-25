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
    //   "eyJhbGciOiJIUzUxMiJ9.eyJwYXNzd29yZCI6IjZLU0IyR3VhTDluUC9zdEowaWd2MXk2R3JHdjVnRmJSSzJ1dzNwVjIzL289Iiwicm9sZSI6WyJGSUVMRF9FTkdJTkVFUiJdLCJpZCI6ImFiMTliOTk5LTE1ODEtNDE5My1iOWUyLTk2N2UxNWZiZjUzZCIsInVzZXJPcmdEZXRhaWxzIjp7ImxlYWRJZCI6IjIxYWUzYWI3LTg2NWYtNGQ0Yi05OTBiLThjMDU2ZWRlZTE2MSIsIm9yZ0lkIjoiYjBiYzhiZTUtZTRlYi00NTAzLWE4MTMtMTNiOTdiNzZjNzczIiwib3JnRGVwYXJ0bWVudElkIjoiMjUxMWI0NGQtOTE1ZC00NTM1LTliNzgtMGVjNTkyYzBhMDFjIiwib3JnRGVzaWduYXRpb25JZCI6ImM1YzRkMjE2LTZiMmItNDI2Ny05YWFiLTk5Nzg1MGFkZTZhYiJ9LCJlbWFpbCI6ImJvamphbWFoaTg1NzJAZ21haWwuY29tIiwidXNlcm5hbWUiOiJNYWhpIiwic3ViIjoiYm9qamFtYWhpODU3MkBnbWFpbC5jb20iLCJpYXQiOjE3MzUxMTk3MzEsImV4cCI6MTczNTE0ODUzMX0.LLkadK44mF1hiJZ2pxS0-uWaVebky6OWaFDSsKo9UOpbnFj202SsFrf9Bb5adbbVt_aYcz1biheZUFBVX38huQ");
    let token = await getItem(AUTH_TOKEN_KEY);
    if (token) {
      try {
        console.log("BASE_URL", BASE_URL);
        
        await axios.post(BASE_URL + `/login/validate?token=${token}`, {});
        // console.log(validateResponse);
      } catch (e) {
        if (e instanceof AxiosError) {
          console.error("token invalid", e.response?.data);
        }
        try {
          const refreshToken = await getItem(REFRESH_TOKEN_KEY);
          console.log("refreshToken", refreshToken);
          const response = await axios.post(BASE_URL + "/auth/refresh-token", {
            token: refreshToken,
          });
          const newToken = response.data.token;
          await setItem(AUTH_TOKEN_KEY, newToken);
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
    console.log("no token", token);
    
    return config;
  },
  (error) => {
    console.log("error ->>>>>>>>>>>>>>>>>>>", error);
    return Promise.reject(error);
  },
);

export default apiClient;