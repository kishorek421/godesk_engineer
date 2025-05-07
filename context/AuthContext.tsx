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
import { primaryColor } from "@/constants/colors";
interface AuthContextProps {
  user: CustomerDetailsModel | undefined;
  loading: boolean;
  logout: any;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined,
);
export enum InitialNotificationStatus {
  fetching,
  notifications_empty,
  notifications_pending,
}
interface AuthProviderProps {
  initialNotificationStatus?: InitialNotificationStatus;
  children?: ReactNode;
}

export const AuthProvider = ({
  initialNotificationStatus = InitialNotificationStatus.fetching,
  children,
}:  AuthProviderProps) => {
  const [user, setUser] = useState<UserDetailsModel | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // const loadLanuage = async () => {
    //   const selectedLanguage = await getItem('language');
    //   if (selectedLanguage) {
    //     i18n.changeLanguage(selectedLanguage);
    //   }
    // }
    const loadUser = async () => {

      const token = await getItem(AUTH_TOKEN_KEY);
      console.log("token", token);
      const refreshToken = await getItem(REFRESH_TOKEN_KEY);
      console.log("refreshToken", refreshToken);
      if (token) {
        try {
          const response = await apiClient.get(GET_USER_DETAILS);
          setUser(response.data);
          router.replace({ pathname: "/home" });
        } catch (error) {
          console.error("Failed to fetch user:", error);
          await clearStorage();
          router.replace({ pathname: "/data_storage/[homescreen]" });
        }
      } else {
        router.replace({ pathname: "/data_storage/[homescreen]" });
      }
      setLoading(false);
    };
    // loadLanuage();
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
            fontFamily: "sans",
            fontWeight: "400",
          },
          medium: {
            fontFamily: "sans",
            fontWeight: "500",
          },
          bold: {
            fontFamily: "sans",
            fontWeight: "700",
          },
          heavy: {
            fontFamily: "sans",
            fontWeight: "900",
          },
        },
        dark: false,
        colors: {
          primary: primaryColor,
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
