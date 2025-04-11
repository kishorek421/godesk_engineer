import { Platform } from "react-native";
import {  getToken } from "@react-native-firebase/messaging";

export async function getFCMToken(messaging: any) {
  if (!(await messaging.hasPermission())) return null;
  return await getToken(messaging);
}

// For iOS foreground notifications
export async function registerForegroundHandler(messaging: any) {
  if (Platform.OS === "ios") {
    await messaging.setAutoInitEnabled(true);
    // await messaging.registerDeviceForRemoteMessages();
  }
}
