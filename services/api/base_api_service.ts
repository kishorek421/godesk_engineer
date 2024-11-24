import axios from "axios";
import { BASE_URL } from "@/config/env";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/storage_keys";
import { getItem, setItem, removeItem } from "@/utils/secure_store";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    console.log("requesting");
    await setItem(
      AUTH_TOKEN_KEY,
      "eyJhbGciOiJIUzUxMiJ9.eyJwYXNzd29yZCI6Ik5GVFdMNzltOTNLU3IvS1crdDNLRzI3YWxWT2l4bGg1a0FGVnhROG1VRlk9Iiwicm9sZSI6WyJGSUVMRF9FTkdJTkVFUiJdLCJpZCI6IjliYTA0OWQxLTFiNTEtNGNlMS05MzkyLTViYTUyZjE1NWY0OSIsInVzZXJPcmdEZXRhaWxzIjp7ImxlYWRJZCI6ImUwZmJlZmNiLTFiZWYtNDhhNy1hNmVmLTlmZThhZTczYzk3ZiIsIm9yZ0lkIjoiYjBiYzhiZTUtZTRlYi00NTAzLWE4MTMtMTNiOTdiNzZjNzczIiwib3JnRGVwYXJ0bWVudElkIjoiMjUxMWI0NGQtOTE1ZC00NTM1LTliNzgtMGVjNTkyYzBhMDFjIiwib3JnRGVzaWduYXRpb25JZCI6IjY1MWYwYjNjLWM3ZDAtNGQyNi05NzEwLWE0NGJiZGFlMWQyZCJ9LCJlbWFpbCI6ImJoYXJhdGlwYXJpdDRAZ21haWwuY29tIiwidXNlcm5hbWUiOiJCaGFyYXRpIiwic3ViIjoiYmhhcmF0aXBhcml0NEBnbWFpbC5jb20iLCJpYXQiOjE3MzIyNzM4NDAsImV4cCI6MTczMjMwMjY0MH0.LuZ7n7CNVwyGoxosbIA0AZHKJbRI2uqsN_pvfMKhxWFPImCAMMA-cQRqwznMRx2hziiyp-Q0ZISr4pQLyZ8OrA");
    await setItem(
      REFRESH_TOKEN_KEY,
      "ddf0c17b-f3a9-411f-8a42-65f0c567b95a",
    );
    let token = await getItem(AUTH_TOKEN_KEY);
    // console.log("token", token);
    // console.log(config);
    // const token =
    //   "eyJhbGciOiJIUzUxMiJ9.eyJwYXNzd29yZCI6Ikt2Qjl6dDIwQzd2SXBDcUlyVzBzRVBXczdSL3M3aWpqcnVhZHROY29GUWM9Iiwicm9sZSI6WyJTQUxFU19QRVJTT04iXSwiaWQiOiI4ODhiYmExMS04ZjAzLTQ4ZjctYmZlNS0xNTI1MTdhYmJmNDciLCJ1c2VyT3JnRGV0YWlscyI6eyJsZWFkSWQiOiI4MDE2MGRkZi1hZjJkLTQ5YmItOWM2Ny02MzNmZmJjN2M0ZmEiLCJvcmdJZCI6ImIwYmM4YmU1LWU0ZWItNDUwMy1hODEzLTEzYjk3Yjc2Yzc3MyIsIm9yZ0RlcGFydG1lbnRJZCI6ImY5MmFkN2Y1LWJmNzUtNGI0MS1iZTgzLTdhMjkxZTE1N2M2OSIsIm9yZ0Rlc2lnbmF0aW9uSWQiOiI1ZDQ1N2ZiNC04YWM0LTQ1NDgtYmFmMi04OThiY2UyNGM1YTYifSwiZW1haWwiOiJjaG93ZGFyeWxhc3lhODAxQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiTGFzeWEiLCJzdWIiOiJjaG93ZGFyeWxhc3lhODAxQGdtYWlsLmNvbSIsImlhdCI6MTcyOTQ5OTYxMiwiZXhwIjoxNzI5NTI4NDEyfQ.u1Sail9ADZccss2aOChdfleOVy_f-AmR9QOOOnW09I4vHcuk8rZWy7SVoWNpHjIMOFua_Ra7gWaqXnjBeGLp4Q";
    if (token) {
      try {
        await axios.post(BASE_URL + `/login/validate?token=${token}`, {});
        // console.log(validateResponse);
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
      // await removeItem(AUTH_TOKEN_KEY);
    }
    return config;
  },
  (error) => {
    console.log("error ->>>>>>>>>>>>>>>>>>>", error);
    return Promise.reject(error);
  },
);

// Define the function to check ticket status by ticket ID

// // Request interceptor: Add Authorization Header
// apiService.interceptors.request.use(
//   async (config) => {
//     const token = await getItem(AUTH_TOKEN_KEY); 
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${"eyJhbGciOiJIUzUxMiJ9.eyJwYXNzd29yZCI6Ik5GVFdMNzltOTNLU3IvS1crdDNLRzI3YWxWT2l4bGg1a0FGVnhROG1VRlk9Iiwicm9sZSI6WyJGSUVMRF9FTkdJTkVFUiJdLCJpZCI6IjliYTA0OWQxLTFiNTEtNGNlMS05MzkyLTViYTUyZjE1NWY0OSIsInVzZXJPcmdEZXRhaWxzIjp7ImxlYWRJZCI6ImUwZmJlZmNiLTFiZWYtNDhhNy1hNmVmLTlmZThhZTczYzk3ZiIsIm9yZ0lkIjoiYjBiYzhiZTUtZTRlYi00NTAzLWE4MTMtMTNiOTdiNzZjNzczIiwib3JnRGVwYXJ0bWVudElkIjoiMjUxMWI0NGQtOTE1ZC00NTM1LTliNzgtMGVjNTkyYzBhMDFjIiwib3JnRGVzaWduYXRpb25JZCI6IjY1MWYwYjNjLWM3ZDAtNGQyNi05NzEwLWE0NGJiZGFlMWQyZCJ9LCJlbWFpbCI6ImJoYXJhdGlwYXJpdDRAZ21haWwuY29tIiwidXNlcm5hbWUiOiJCaGFyYXRpIiwic3ViIjoiYmhhcmF0aXBhcml0NEBnbWFpbC5jb20iLCJpYXQiOjE3MzE5OTg1MDcsImV4cCI6MTczMjAyNzMwN30.t-krcWvNkV25TUBqtaoNXX7SU7Z069EFpJTT44k6GG-ON1y8xCNYDRJjQsaW0yFBLByQN5-oYyZDTcpyCWx5nA"}`; // Add token to header
//     } else {
//       console.error("No token found in SecureStore.");
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error); // Handle request error
//   }
// );

// Response interceptor: Handle errors and refresh tokens
// apiService.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     if (
//       error.response &&
//       error.response.status === 401 &&
//       !originalRequest._retry
//     ) {
//       originalRequest._retry = true;
//       try {
//         const refreshToken = await getItem("REFRESH_TOKEN_KEY");
//         if (!refreshToken) throw new Error("No refresh token available");

//         // Fetch new access token
//         const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
//           token: refreshToken,
//         });
//         const newAccessToken = response.data.accessToken;

//         // Store new token and retry original request
//         await setItem(AUTH_TOKEN_KEY, newAccessToken);
//         apiService.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
//         originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

//         return apiService(originalRequest);
//       } catch (refreshError) {
//         console.error("Token refresh failed:", refreshError);
//         // Optionally handle logout
//         await removeItem(AUTH_TOKEN_KEY);
//         await removeItem("REFRESH_TOKEN_KEY");
//         // Redirect to login or notify user
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// // Example usage: Check if token is saved
// async function checkToken() {
//   try {
//     const token = await getItem(AUTH_TOKEN_KEY);
//     if (token) {
//       console.log("Token is saved: ", token);
//       return true;  // Token is found
//     } else {
//       console.log("No token found");
//       return false;  // No token found
//     }
//   } catch (error) {
//     console.error("Error checking token:", error);
//     return false;  // In case of an error, return false
//   }
// }

// checkToken();

export default api;
