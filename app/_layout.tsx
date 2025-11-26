import { View, Text, Pressable, Alert, DeviceEventEmitter, Platform } from "react-native";
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import React from "react";
import { useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { AuthProvider, InitialNotificationStatus, } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
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
import i18n from "@/i18n";
import { I18nextProvider } from "react-i18next";
import BasePage from '@/components/base/base_page';
import Toast from "@/components/base/toast";
import { LocationProvider } from "@/context/LocationContext";
import { RefreshProvider } from "@/context/RefreshContext";
import VersionCheck from "react-native-version-check";
import { Linking } from "react-native";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
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
  const [isVisible, setIsVisible] = useState(false);
  const [storeUrl, setStoreUrl] = useState("");
  const { messagingRef, isMessagingReady } = useFirebaseMessaging();

  useEffect(() => {
    checkAppVersion();
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  const promptUpdateIfNeeded = async () => {
    const latestVersion = await VersionCheck.getLatestVersion();
    const currentVersion = VersionCheck.getCurrentVersion();

    console.log("latestVersion", latestVersion);
    console.log("currentVersion", currentVersion);

    const updateInfo = await VersionCheck.needUpdate({ currentVersion, latestVersion });
    console.log("updateInfo", updateInfo);
    // if (updateInfo.isNeeded && latestVersion > currentVersion) {
    //   Alert.alert(
    //     "Update Available",
    //     "Please update the app to the latest version.",
    //     [
    //       {
    //         text: "Update",
    //         onPress: async () => {
    //           const url = await VersionCheck.getStoreUrl({
    //             appID: "6741766542",
    //             packageName: "com.godezk.godezkengineer",
    //           });
    //           Linking.openURL(url);
    //         },
    //       },
    //     ],
    //     { cancelable: false }
    //   );
    //   const url = await VersionCheck.getStoreUrl({
    //     appID: "6741766542",
    //     packageName: "com.godezk.godezkengineer",
    //   });
    //   setStoreUrl(url);
    //   setIsVisible(true);
    // }
  };


  useEffect(() => {
    promptUpdateIfNeeded();
    checkAppVersion();

    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);


const processedNotificationsRef = React.useRef(new Set<string>());

useEffect(() => {
  let unsubscribeOnMessage: (() => void) | undefined;
  let unsubscribeOnClickNotificationListener: any;
  let unsubscribeOnOpen: (() => void) | undefined;

  if (isMessagingReady && messagingRef.current) {
    // Add a single click/tap listener (only once)
    unsubscribeOnClickNotificationListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        try {
          const content = response.notification.request.content;
          const data = (content.data as any) || {};
          console.log("✅ [NOTIFICATION] User tapped notification:", content);
          // Normalize shape expected by handleNotificationNavigation
          handleNotificationNavigation({
            notification: {
              title: content.title,
              body: content.body,
            },
            data,
          } as any);
        } catch (e) {
          console.error("Error handling notification response:", e);
        }
      });

    unsubscribeOnMessage = messagingRef.current.onMessage(
      async (remoteMessage: any) => {
        try {
          console.log("Foreground message:", remoteMessage);

          // Build a stable id to dedupe notifications
          const uniqueId =
            remoteMessage?.data?.id ||
            remoteMessage?.messageId ||
            remoteMessage?.notification?.title + "|" + remoteMessage?.notification?.body ||
            JSON.stringify(remoteMessage?.data || {});

          // Skip if we've recently processed this notification
          if (processedNotificationsRef.current.has(uniqueId)) {
            console.log("Skipping duplicate notification:", uniqueId);
            return;
          }
          processedNotificationsRef.current.add(uniqueId);
          // Remove dedupe key after 30s to allow future notifications with same id
          setTimeout(() => {
            processedNotificationsRef.current.delete(uniqueId);
          }, 30_000);

          const token = await getItem(AUTH_TOKEN_KEY);
          const userIdNull = remoteMessage?.data?.userId;
          const userId =
            !userIdNull || userIdNull === "null" ? null : userIdNull;

          if (remoteMessage?.notification) {
            console.log("✅ [NOTIFICATION] Received in foreground:", {
              title: remoteMessage.notification.title,
              body: remoteMessage.notification.body,
              type: remoteMessage?.data?.type,
              id: remoteMessage?.data?.id,
            });

            try {
              const notificationId =
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: remoteMessage.notification.title,
                    body: remoteMessage.notification.body,
                    sound: "default",
                    data: {
                      ...(remoteMessage.data || {}),
                      type: remoteMessage?.data?.type,
                      id: remoteMessage?.data?.id,
                    },
                  },
                  trigger: null,
                });

              console.log(
                "✅ [NOTIFICATION] Notification scheduled with ID:",
                notificationId
              );
            } catch (error: any) {
              console.error(
                "❌ [NOTIFICATION] Error scheduling notification:",
                error
              );
            }

            DeviceEventEmitter.emit("new-notification", {
              type: remoteMessage?.data?.type,
              subtype:
                remoteMessage?.data?.subType || remoteMessage?.data?.subtype,
              message: {
                id: remoteMessage?.data?.id,
                title: remoteMessage?.notification?.title,
                body: remoteMessage?.notification?.body,
              },
            });
          }
        } catch (err) {
          console.error("onMessage handler error:", err);
        }
      }
    );

    unsubscribeOnOpen = messagingRef.current.onNotificationOpenedApp(
      (remoteMessage: any) => {
        try {
          console.log(
            "✅ [NOTIFICATION] App opened from background notification:",
            {
              title: remoteMessage?.notification?.title,
              body: remoteMessage?.notification?.body,
              type: remoteMessage?.data?.type,
            }
          );

          // Use token to decide navigation, same logic as before
          getItem(AUTH_TOKEN_KEY).then((token) => {
            if (!token) {
              handleNotificationNavigation({
                ...remoteMessage,
                data: {
                  ...remoteMessage?.data,
                  id: null,
                  roleDetails: null,
                  type: null,
                  subtype: null,
                },
              });
              return;
            }
            handleNotificationNavigation(remoteMessage);
          });
        } catch (e) {
          console.error("onNotificationOpenedApp error:", e);
        }
      }
    );

    messagingRef.current
      .getInitialNotification()
      .then(async (remoteMessage: any) => {
        try {
          console.log("🔍 [NOTIFICATION] Checking initial notification...");

          if (remoteMessage) {
            console.log(
              "✅ [NOTIFICATION] App opened from terminated state:",
              {
                title: remoteMessage?.notification?.title,
                body: remoteMessage?.notification?.body,
                type: remoteMessage?.data?.type,
              }
            );

            const data = remoteMessage.data;
            const token = await getItem(AUTH_TOKEN_KEY);

            if (data) {
              if (!token) {
                handleNotificationNavigation({
                  ...remoteMessage,
                  data: {
                    ...remoteMessage?.data,
                    id: null,
                    roleDetails: null,
                    type: null,
                    subtype: null,
                  },
                });
              } else {
                handleNotificationNavigation(remoteMessage);
              }
              setInitialNotificationStatus(
                InitialNotificationStatus.notifications_pending
              );
            } else {
              setInitialNotificationStatus(
                InitialNotificationStatus.notifications_empty
              );
            }
          } else {
            console.log("ℹ️ [NOTIFICATION] No initial notification found");
            setInitialNotificationStatus(
              InitialNotificationStatus.notifications_empty
            );
          }
        } catch (e) {
          console.error("getInitialNotification then handler error", e);
        }
      });

      // when app is in background
      messagingRef.current.setBackgroundMessageHandler(
        async (remoteMessage: any) => {
          console.log("Background message:", remoteMessage);
        }
      );
    }

    try {
      const initializeAnalytics = async () => {
        if (Platform.OS === "android") {
          // setAnalyticsCollectionEnabled(analyticsRef.current, true);
          // await analyticsRef.current.setAnalyticsCollectionEnabled(true);
          // await analytics().setAnalyticsCollectionEnabled(true);
          return;
        }
        // Check if consent has already been granted
        const storedConsent = await getItem("analyticsConsent");
        console.log(
          "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~storedConsent",
          storedConsent,
          typeof storedConsent
        );

        if (storedConsent !== null) {
          console.log("type of storedConsent", typeof storedConsent);

          const consented = storedConsent === "true";
          // await analyticsRef.current.setAnalyticsCollectionEnabled(consented);
          // await analytics().setAnalyticsCollectionEnabled(consented);
          // setAnalyticsCollectionEnabled(analyticsRef.current, consented);
          console.log("content setted ---->");
          // await analytics().logEvent("test_event", {
          //   user: "kishore",
          //   screen: "dashboard",
          // });
          console.log("📨 test_event sent");

          //  setConsentRequested(true);
          return;
        }

        console.log(
          "------------------------analyticsRef.current-------------------------"
        );

        // Disable analytics by default
        // setAnalyticsCollectionEnabled(analyticsRef.current, false);

        console.log(
          "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~> permission ------------------>"
        );

        const requestPermission = async () => {
          const { status } = await requestTrackingPermissionsAsync();
          console.log("Tracking Permission Status:", status);
          // Handle the status accordingly
          if (status === "granted") {
            // Proceed with tracking-related tasks
            return true;
          } else {
            // Skip or limit tracking
            return false;
          }
        };

        // Request tracking permission before any data is collected
        // requestPermission();

        console.log(
          "prompting for analytics -------------------------------------->"
        );

        // Show consent prompt
        Alert.alert(
          "Data Collection Consent",
          "We would like to collect analytics data to improve your experience. Do you consent to this?",
          [
            {
              text: "Decline",
              onPress: async () => {
                await setItem("analyticsConsent", "false");
                // setAnalyticsCollectionEnabled(analyticsRef.current, false);
                // await analyticsRef.current.setAnalyticsCollectionEnabled(false);
                // await analytics().setAnalyticsCollectionEnabled(false);
                //  setConsentRequested(true);
              },
            },
            {
              text: "Accept",
              onPress: async () => {
                // Check ATT for iOS
                const attAuthorized = await requestPermission();
                const canTrack = attAuthorized; // Add additional consent logic for Android if needed
                await setItem("analyticsConsent", canTrack.toString());
                // setAnalyticsCollectionEnabled(analyticsRef.current, canTrack);
                // await analyticsRef.current.setAnalyticsCollectionEnabled(canTrack);
                // await analytics().setAnalyticsCollectionEnabled(canTrack);
                console.log("setting analytics true");
                //  setConsentRequested(true);
              },
            },
          ],
          { cancelable: false }
        );
      };
      initializeAnalytics();
    } catch (e) {
      console.error("initialize analytics error", e);
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
    // };
    // initNotificationListener();
  }, [loaded, isMessagingReady]);

  if (!loaded) {
    return null;
  }
  return (
    <>
    <SafeAreaProvider>
      <GluestackUIProvider mode="light">
        <AuthProvider>
          <LocationProvider>
            <RefreshProvider>
              <I18nextProvider i18n={i18n}>
                <ToastProvider>
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
                    name="leave/leave_history/list/[userRole]"
                    options={{
                      headerTitle: "All Leaves",
                      headerBackTitle: "Home",
                      // headerRight: () => {
                      //   return (
                      //     <Pressable
                      //       onPress={() => router.push("/leave/create_leave_request")}
                      //     >
                      //       <AntDesign
                      //         name="pluscircleo"
                      //         size={20}
                      //         color="black"
                      //       />
                      //         {/* <Text><Link href={'/leave/create_leave_request'} className="text-lg">+</Link></Text> */}
                      //     </Pressable>
                      //   );
                      // },
                      headerTitleStyle: {
                        fontFamily: "SemiBold",
                      },
                      headerBackTitleStyle: {
                        fontFamily: "Regular",
                      },
                    }}
                  />
                  <Stack.Screen
                    name="leave/create_leave_request/[leaveId]"
                    options={{
                      headerTitle: "Apply Leave",
                      // headerShown: false,
                      headerTitleStyle: {
                        fontFamily: "SemiBold",
                      },
                      headerBackTitleStyle: {
                        fontFamily: "Regular",
                      },
                    }}
                  />
                  <Stack.Screen
                    name="leave/leave_history/details/[leaveId]/[userId]/[roleCode]"
                    options={{
                      headerTitle: "Leave Details",
                      // headerShown: false,
                      headerTitleStyle: {
                        fontFamily: "SemiBold",
                      },
                      headerBackTitleStyle: {
                        fontFamily: "Regular",
                      },
                    }}
                  />
                  <Stack.Screen
                    name="checkIn_out/checkIn_out_list"
                    options={{
                      headerTitle: "Attendance List",
                    }}
                  />
                  <Stack.Screen
                    name="change_password"
                    options={{
                      headerTitle: "Change PIN",
                    }}
                  />
                  <Stack.Screen
                    name="checkIn_out/checkIn/[checkIn]"
                    options={{
                      headerTitle: "Attendance Details",
                    }}
                  />
                  <Stack.Screen
                    name="(root)"
                    options={{
                      headerShown: false,
                      headerTitle: "Home",
                      headerTitleStyle: {
                        fontFamily: "SemiBold",
                      },
                      headerBackTitleStyle: {
                        fontFamily: "Regular",
                      },
                    }}
                  />
                  <Stack.Screen
                    name="(auth)/home"
                    options={{
                      headerTitle: "All Tickets",
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
                    name="(auth)/login"
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
                    name="forgot_password"
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
                      // headerShown: false,
                      headerTitle: "Ticket Details",
                      headerTitleStyle: {
                        fontFamily: "SemiBold",
                      },
                      headerBackTitleStyle: {
                        fontFamily: "Regular",
                      },
                    }}
                  />

                  <Stack.Screen
                    name="translations/language_selection"
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
                </ToastProvider>
              </I18nextProvider>
            </RefreshProvider>
          </LocationProvider>
        </AuthProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
    </>
  );
}
