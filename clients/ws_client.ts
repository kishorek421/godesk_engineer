// import { API_BASE_WS_URL, BASE_URL } from "@/config/env";
// import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/storage_keys";
// import useLocation from "@/hooks/useLocation";
// import { getItem, setItem } from "@/utils/secure_store";
// import axios, { AxiosError } from "axios";

// type Listener = (message: MessageEvent) => void;
// type OpenListener = () => void;

// export default class WebSocketClient {
//   private static instance: WebSocketClient | null = null;
//   private ws: WebSocket | undefined;
//   private listeners: Listener[] = [];
//   private onOpenListeners: OpenListener[] = [];
//   public isWsOpened: boolean | undefined;

//   private constructor(private url: string) {
//     this.initWs(url);
//   }

//   private async initWs(url: string) {
//     console.log("-------------------------------------------------->initWs");

//     // fetch token from getItem
//     let token = await getItem(AUTH_TOKEN_KEY);
//     if (token) {
//       try {
//         await axios.post(BASE_URL + `/login/validate?token=${token}`, {});
//         // console.log(validateResponse);
//       } catch (e) {
//         console.error("token invalid");
//         // Sentry.captureMessage(`token invalid -> ${(e as AxiosError)?.response}`);
//         // Sentry.captureMessage(`token invalid -> ${(e as AxiosError)?.response?.data}`);
//         try {
//           const refreshToken = await getItem(REFRESH_TOKEN_KEY);
//           console.log("refreshToken", refreshToken);
//           const response = await axios.get(
//             BASE_URL + "/login/refresh_token" + `?refreshToken=${refreshToken}`
//           );
//           const newToken = response.data?.data?.accessToken;
//           await setItem(AUTH_TOKEN_KEY, newToken);
//           console.log("newToken", newToken);
//           token = newToken;
//         } catch (e) {
//           console.error("Refresh token error");
//           if (e && e instanceof AxiosError) {
//             console.log(e.response?.data);
//           }
//         }
//       }

//       this.ws = new WebSocket(url + "?token=Bearer " + token);

//       this.ws.onopen = () => {
//         console.log("WebSocket connection opened.");
//         this.isWsOpened = true;
//         this.onOpenListeners.forEach((listener) => listener());
//       };

//       this.ws.onmessage = (message: MessageEvent) => {
//         console.log("WebSocket message received:", message.data);
//         this.listeners.forEach((listener) => listener(message));
//       };

//       this.ws.onerror = (error: Event) => {
//         console.error("WebSocket error:", error);
//       };

//       this.ws.onclose = () => {
//         this.isWsOpened = false;
//         console.log("WebSocket connection closed.");
//       };
//     }
//   }

//   public static getInstance(url: string): WebSocketClient {
//     if (!WebSocketClient.instance) {
//       WebSocketClient.instance = new WebSocketClient(url);
//     }
//     return WebSocketClient.instance;
//   }

//   public sendMessage(message: unknown): void {
//     if (this.ws?.readyState === WebSocket.OPEN) {
//       try {
//         this.ws.send(JSON.stringify(message));
//         console.log("WebSocket message sent successfully:", message);
//       } catch (error) {
//         console.error("Error sending WebSocket message:", error);
//       }
//     } else {
//       console.error("WebSocket is not open. Current state:", this.ws?.readyState);
//     }
//   }

//   public isConnected(): boolean {
//     return this.ws?.readyState === WebSocket.OPEN;
//   }

//   public addMessageListener(listener: Listener): void {
//     this.listeners.push(listener);
//   }

//   public removeMessageListener(listener: Listener): void {
//     this.listeners = this.listeners.filter((l) => l !== listener);
//   }

//   public addOnOpenListener(listener: OpenListener): void {
//     this.onOpenListeners.push(listener);
//   }

//   public removeOnOpenListener(listener: OpenListener): void {
//     this.onOpenListeners = this.onOpenListeners.filter((l) => l !== listener);
//   }

//   public closeSocket(): void {
//     this.ws?.close();
//   }
// }

// export const wsClient = WebSocketClient.getInstance(API_BASE_WS_URL);
