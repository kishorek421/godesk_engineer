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
    //   "eyJhbGciOiJIUzUxMiJ9.eyJwYXNzd29yZCI6IkRXcSt5V3hCYWFweXdTSDhyRWVCSng3S0RXS21oSlJzODZFMUs2Ni9GVFk9Iiwicm9sZSI6WyJDVVNUT01FUiJdLCJpZCI6ImE1ZTcyZjVjLTlhNmEtNDAzNi1iOTQ4LWI0NzVkZjBlY2FkZSIsInVzZXJPcmdEZXRhaWxzIjp7ImxlYWRJZCI6IjgwZGM2MTU3LTZmZDUtNDU0NS1hZDRmLTYxYzNlNDI2NDg2MyIsIm9yZ0lkIjoiYzEzOGRjNTYtNzEyZi00NDMzLTk2MzItMzcyODE1MzIxM2E3Iiwib3JnRGVwYXJ0bWVudElkIjoiYTc5YzlhNWYtMDEzYS00Mjk0LWJiZWEtYTE0ZTkwNWFlZGNiIiwib3JnRGVzaWduYXRpb25JZCI6ImY1NWE4NzI2LTExZTgtNDlmZi05Y2UwLWM2NWU5MGM1MjRhYiJ9LCJlbWFpbCI6Imtpc2hvcmVAYmVsbHdldGhlci5vcmcuaW4iLCJ1c2VybmFtZSI6IlZhcnVuIiwic3ViIjoia2lzaG9yZUBiZWxsd2V0aGVyLm9yZy5pbiIsImlhdCI6MTczMzcxMDUwOCwiZXhwIjoxNzMzNzM5MzA4fQ.2FPoVjTXJ28YwogmbqubLYfyzn2ZWZWDZsSE2ZJrqQsRpwiYFzNHXUmj-icf50PB-P6y3naLxPkW6Yrst9KjUg");
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
