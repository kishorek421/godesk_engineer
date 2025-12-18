import { BASE_URL } from "@/config/env";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/storage_keys";
import axios, { AxiosError } from "axios";
import { getItem, setItem } from "@/utils/secure_store";
import { useFirebaseMessaging } from "@/hooks/useFirebaseMessaging";
import { getFirebaseMessaging } from "@/config/firebase_config";
import { getFCMToken } from "@/services/fcm";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the token to headers
apiClient.interceptors.request.use(
  async (config) => {
    let token = await getItem(AUTH_TOKEN_KEY);
    // //console.log("token", token);
    // console.log(config);
    if (token) {
      let fcmToken = "";

      try {
        const iMessaging = await getFirebaseMessaging();
        fcmToken = (await getFCMToken(iMessaging)) ?? "";
      } catch (e) {
        console.error("Token Error ->", e);
      }

      try {
        await axios.post(BASE_URL + `/login/validate?token=${token}&fcmToken=${fcmToken}`, {});
      } catch (e) {
        console.error("token invalid");
        try {
          const refreshToken = await getItem(REFRESH_TOKEN_KEY);
          //console.log("refreshToken", refreshToken);
          const response = await axios.get(
            BASE_URL + "/login/refresh_token" + `?refreshToken=${refreshToken}&fcmToken=${fcmToken}`
          );
          const newToken = response.data?.data?.accessToken;
          await setItem(AUTH_TOKEN_KEY, newToken);
          //console.log("newToken", newToken);
          token = newToken;
        } catch (e) {
          console.error("Refresh token error");
          if (e && e instanceof AxiosError) {
            console.log(e.response?.data);
          }
        }
      }
      config.headers.Authorization = `Bearer ${token}`;
      // await removeItem(AUTH_TOKEN_KEY);
    }
    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     //console.log("error -> ", error);
//     if (error.response && error.response.status === 401) {
//       console.error("Unauthorized, logging out...");
//     }
//     console.error("API Error:", error.response?.data);
//     return Promise.reject(error);
//   },
// );

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {

//     console.error(error);
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

//       await setItem(AUTH_TOKEN_KEY, newToken);
//       api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
//       originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
//       return api(originalRequest);
//     }
//     return Promise.reject(error);
//   },
// );

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error(error);
    return Promise.reject(error);
  }
);

export default apiClient;
