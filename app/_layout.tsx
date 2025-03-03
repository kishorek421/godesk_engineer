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
import { useFirebaseMessaging } from "@/hooks/useFirebaseMessaging";
import * as Notifications from "expo-notifications";
import { handleNotificationNavigation } from "@/utils/helper";

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

  const { messagingRef, isMessagingReady } = useFirebaseMessaging();

  useEffect(() => {
    checkAppVersion();
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);


  useEffect(() => {
    let unsubscribeOnMessage: (() => void) | undefined;
    let unsubscribeOnOpen: (() => void) | undefined;
    let unsubscribeOnClickNotificationListener: any;

    if (isMessagingReady && messagingRef.current) {
      console.log("messaging is ready");

      unsubscribeOnMessage = messagingRef.current.onMessage(
        async (remoteMessage: any) => {
          console.log("Foreground message:", remoteMessage);

          if (remoteMessage?.notification) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: remoteMessage.notification.title,
                body: remoteMessage.notification.body,
                sound: "default",
              },
              trigger: null,
            });
            unsubscribeOnClickNotificationListener =
              Notifications.addNotificationResponseReceivedListener(
                (response) => {
                  console.log(
                    "response ->",
                    response.notification.request.content
                  );

                  handleNotificationNavigation(remoteMessage);
                }
              );
          }
        }
      );

      unsubscribeOnOpen = messagingRef.current.onNotificationOpenedApp(
        (remoteMessage: any) => {
          handleNotificationNavigation(remoteMessage);
        }
      );

      messagingRef.current
        .getInitialNotification()
        .then((remoteMessage: any) => {
          if (remoteMessage) handleNotificationNavigation(remoteMessage);
        });

      messagingRef.current.setBackgroundMessageHandler(
        async (remoteMessage: any) => {
          console.log("Background message:", remoteMessage);
        }
      );

      const checkInitialNotification = async () => {
        const response = await Notifications.getLastNotificationResponseAsync();
        if (response) {
          console.log(
            "response.notification.request.content",
            response.notification.request.content
          );
          handleNotificationNavigation(response.notification.request.content);
        }
      };

      checkInitialNotification();
    }

    return () => {
      if (unsubscribeOnMessage) {
        console.log("Closing messaging listener...");
        unsubscribeOnMessage();
      } else {
        console.log("unsubscribe is null");
      }
      if (unsubscribeOnOpen) {
        console.log("Closing onNotificationOpenedApp listener...");
        unsubscribeOnOpen();
      }
      if (unsubscribeOnClickNotificationListener) {
        unsubscribeOnClickNotificationListener.remove();
      }
    };
  }, [loaded, isMessagingReady]);


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
