import { View, Text } from "react-native";
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import React from "react";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { AuthProvider } from "@/context/AuthContext";
import Toast from "react-native-toast-message";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { clearStorage, getItem, setItem } from "@/utils/secure_store";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();
const APP_VERSION = "1.0.10";
async function checkAppVersion() {
  const storedVersion = await getItem("app_version");
  if (storedVersion !== APP_VERSION) {
    await clearStorage(); // Clear old storage if the version is outdated
    await setItem("app_version", APP_VERSION); // Update the version
  }
}
export default function RootLayout() {
  const [loaded] = useFonts({
    Regular: Poppins_400Regular,
    Medium: Poppins_500Medium,
    SemiBold: Poppins_600SemiBold,
    Bold: Poppins_700Bold,
  });

  useEffect(() => {
    checkAppVersion();
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GluestackUIProvider mode="light">
      <AuthProvider>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
              headerTitleStyle: {
                fontFamily: "SemiBold",
              },
              headerBackTitleStyle: {
                fontFamily: "Regular",
              },
            }}
          />
          <Stack.Screen
            name="home"
            options={{
              headerShown: false,
              headerTitleStyle: {
                fontFamily: "SemiBold",
              },
              headerBackTitleStyle: {
                fontFamily: "Regular",
              },
            }}
          />
          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
              headerTitleStyle: {
                fontFamily: "SemiBold",
              },
              headerBackTitleStyle: {
                fontFamily: "Regular",
              },
            }}
          />
          <Stack.Screen
            name="verify_otp"
            options={{
              headerShown: false,
              headerTitleStyle: {
                fontFamily: "SemiBold",
              },
              headerBackTitleStyle: {
                fontFamily: "Regular",
              },
            }}
          />
          <Stack.Screen
            name="ticket_details/[ticketId]"
            options={{
              headerShown: false,
              headerTitleStyle: {
                fontFamily: "SemiBold",
              },
              headerBackTitleStyle: {
                fontFamily: "Regular",
              },
            }}
          />
          <Stack.Screen
            name="data_storage/[homescreen]"
            options={{
              headerShown: false,
              headerTitleStyle: {
                fontFamily: "SemiBold",
              },
              headerBackTitleStyle: {
                fontFamily: "Regular",
              },
            }}
          />
          <Stack.Screen
            name="image_viewer/[uri]"
            options={{
              presentation: "modal",
              headerShown: false,
              headerTitleStyle: {
                fontFamily: "SemiBold",
              },
              headerBackTitleStyle: {
                fontFamily: "Regular",
              },
            }}
          />
        </Stack>
        <Toast />
      </AuthProvider>
    </GluestackUIProvider>
  );
}
