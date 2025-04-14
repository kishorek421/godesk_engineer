import { View, Text ,Pressable} from "react-native";
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import React from "react";
import { useEffect,useState } from "react";
import { Stack,router } from "expo-router";
import { useFonts } from "expo-font";
import { AuthProvider,  InitialNotificationStatus, } from "@/context/AuthContext";
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
import { AUTH_TOKEN_KEY } from "@/constants/storage_keys";
import { handleNotificationNavigation } from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
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
  const [initialNotificationStatus, setInitialNotificationStatus] =
  useState<InitialNotificationStatus>(InitialNotificationStatus.fetching);

  const { messagingRef, isMessagingReady } = useFirebaseMessaging();

  useEffect(() => {
    checkAppVersion();
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);


  useEffect(() => {
    const initNotificationListener = async () => {
      let unsubscribeOnMessage: (() => void) | undefined;
      let unsubscribeOnClickNotificationListener: any;
      let unsubscribeOnOpen: (() => void) | undefined;

      if (isMessagingReady && messagingRef.current) {
        console.log("messaging is ready");

        unsubscribeOnMessage = messagingRef.current.onMessage(
          async (remoteMessage: any) => {
            console.log("Foreground message:", remoteMessage);

            // Sentry.captureMessage(
            //   "remoteMessage -> " + JSON.stringify(remoteMessage),
            // );

            const token = await getItem(AUTH_TOKEN_KEY);
            // const userDetails = JSON.parse((await getItem(USER_DETAILS)) ?? "");
            const userId = remoteMessage?.data?.userId;
            if (
              token &&
               
              userId &&
              remoteMessage?.notification
            ) {
              // setNotificationData(remoteMessage);

              await Notifications.scheduleNotificationAsync({
                content: {
                  title: remoteMessage.notification.title,
                  body: remoteMessage.notification.body,
                  sound: "default",
                },
                trigger: null,
              });
              // setNotificationFrom(true);
              // unsubscribeOnClickNotificationListener =
              //   Notifications.addNotificationReceivedListener((response) => {
              //     console.log("response ----->", response);
              //     handleNotificationNavigation(remoteMessage);
              //   });
              unsubscribeOnClickNotificationListener =
                Notifications.addNotificationResponseReceivedListener(
                  (response) => {
                    console.log(
                      "response ->",
                      response.notification.request.content,
                    );
                    handleNotificationNavigation(
                      remoteMessage,
                      "addNotificationResponseReceivedListener",
                    );
                  },
                );
            }
          },
        );

        unsubscribeOnOpen = messagingRef.current.onNotificationOpenedApp(
          (remoteMessage: any) => {
            // Sentry.captureMessage(
            //   "remoteMessage:onNotificationOpenedApp --->" + remoteMessage,
            // );
            handleNotificationNavigation(
              remoteMessage,
              "onNotificationOpenedApp",
            );
          },
        );

        messagingRef.current
          .getInitialNotification()
          .then((remoteMessage: any) => {
            console.log("fetch initial notifications");

            // this method will be triggered when app is terminated also
            if (remoteMessage) {
              const data = remoteMessage.data;
              if (data) {
                handleNotificationNavigation(
                  remoteMessage,
                  "getInitialNotification",
                );
                setInitialNotificationStatus(
                  InitialNotificationStatus.notifications_pending,
                );
              } else {
                setInitialNotificationStatus(
                  InitialNotificationStatus.notifications_empty,
                );
              }
            } else {
              setInitialNotificationStatus(
                InitialNotificationStatus.notifications_empty,
              );
            }
            console.log("remoteMessage ----->", remoteMessage);
          });

        messagingRef.current.setBackgroundMessageHandler(
          async (remoteMessage: any) => {
            console.log("Background message:", remoteMessage);
            // Sentry.captureMessage("remoteMessage" + remoteMessage);
            if (remoteMessage)
              handleNotificationNavigation(
                remoteMessage,
                "setBackgroundMessageHandler",
              );
          },
        );
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
    };
    initNotificationListener();
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
            name="notifications/all_notifications"
            
            options={{
              headerTitle: "Notifications",
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
