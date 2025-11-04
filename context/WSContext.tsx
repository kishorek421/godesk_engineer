// import React, { createContext, useContext, useEffect, useState } from "react";
// import WebSocketClient from "../clients/ws_client";
// import { API_BASE_WS_URL } from "@/config/env";

// interface WebSocketProviderProps {
//   children: React.ReactNode;
// }

// const WebSocketContext = createContext<WebSocketClient | null>(null);

// export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
//   children,
// }) => {
//   const ws = WebSocketClient.getInstance(API_BASE_WS_URL);

//   return (
//     <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>
//   );
// };

// export const useWebSocket = (): WebSocketClient | null => {
//   return useContext(WebSocketContext);
// };
