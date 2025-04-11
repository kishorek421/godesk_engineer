import { useState, useEffect, useRef } from "react";
import { getFCMToken, registerForegroundHandler } from "@/services/fcm";
import { requestNotificationPermission } from "@/services/notification_service";
import { getFirebaseMessaging } from "@/config/firebase_config";

export interface UseFirebaseMessagingProps {
  isMessagingReady: boolean;
  // fcmToken?: string;
  messagingRef?: any;
}

export const useFirebaseMessaging = (): UseFirebaseMessagingProps => {
  const [isMessagingReady, setIsMessagingReady] = useState(false);
  // const [fcmToken, setFcmToken] = useState<string | undefined>(undefined);
  const messagingRef = useRef<any>(undefined);

  useEffect(() => {
    try {
      const initializeFCM = async () => {
        const hasPermission = await requestNotificationPermission();
        if (hasPermission) {
          if (!messagingRef.current) {
            const initializeMessage = async () => {
              const iMessaging = await getFirebaseMessaging();
              if (iMessaging) {
                messagingRef.current = iMessaging;
                registerForegroundHandler(iMessaging);
                setIsMessagingReady(true);
                // try {
                //   const iFcmToken = await getFCMToken(iMessaging);
                //   if (iFcmToken) {
                //     setFcmToken(iFcmToken);
                //     console.log("FCM Token:", iFcmToken);
                //   }
                // } catch (e) {
                //   console.error("Token Error ->", e);
                // }
              }
            };
            initializeMessage();
          }
        }
      };

      initializeFCM();
    } catch (error) {
      console.error("FCM Initialization Error:", error);
    }
  }, []);

  return { isMessagingReady, messagingRef };
};
