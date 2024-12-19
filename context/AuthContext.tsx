import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "expo-router";
import {
  AUTH_TOKEN_KEY,
  IS_WELCOMED,
  REFRESH_TOKEN_KEY,
} from "@/constants/storage_keys";
import { clearStorage, getItem, removeItem } from "@/utils/secure_store";
import { ThemeProvider } from "@react-navigation/native";
import { GET_USER_DETAILS } from "@/constants/api_endpoints";
import { CustomerDetailsModel } from "@/models/customers";
import { UserDetailsModel } from "@/models/users";
import apiClient from "@/clients/apiClient";

interface AuthContextProps {
  user: CustomerDetailsModel | undefined;
  loading: boolean;
  logout: any;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined,
);

interface AuthProviderProps {
  children?: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserDetailsModel | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      // router.replace({ pathname: "/route/map_view_screen" });
      const token = await getItem(AUTH_TOKEN_KEY);
      console.log("token", token);
      if (token) {
        try {
          const response = await apiClient.get(GET_USER_DETAILS);
          setUser(response.data);
          router.replace({ pathname: "/data_storage/[homescreen]" });
        } catch (error) {
          console.error("Failed to fetch user:", error);
          await clearStorage();
          router.replace({ pathname: "/login" });
        }
      } else {
        router.replace({ pathname: "/data_storage/[homescreen]" });
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const logout = async () => {
    await removeItem(REFRESH_TOKEN_KEY);
    await removeItem(AUTH_TOKEN_KEY);
    setUser(undefined);
    // Redirect to the login screen after logout
    router.replace({ pathname: "/(auth)/login" });
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      <ThemeProvider
        value={{
          fonts: {
            regular: {
              fontFamily: "open-sans",
              fontWeight: "bold",
            },
            medium: {
              fontFamily: "open-sans",
              fontWeight: "bold",
            },
            bold: {
              fontFamily: "open-sans",
              fontWeight: "bold",
            },
            heavy: {
              fontFamily: "open-sans",
              fontWeight: "bold",
            },
          },
          dark: false,
          colors: {
            primary: "#009c68",
            background: "#f2f2f2",
            card: "#fff",
            text: "#000",
            border: "",
            notification: "",
          },
        }}
      >
        {children}
      </ThemeProvider>
    </AuthContext.Provider>
  );
};
