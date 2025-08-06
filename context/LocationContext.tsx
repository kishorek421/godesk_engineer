import React, { useEffect, useRef, useState } from "react";
import { createContext, ReactNode } from "react";
import * as Location from "expo-location";
import api from "@/clients/apiClient";
import { AppState, AppStateStatus, Platform } from "react-native";
import { useWebSocket } from "./WSContext";
import useAuth from "@/hooks/useAuth";
import * as TaskManager from "expo-task-manager";
import { getItem, setItem } from "@/utils/secure_store";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/storage_keys";
import { BASE_URL } from "@/config/env";
import axios, { AxiosError } from "axios";
import { wsClient } from "@/clients/ws_client";
import { primaryColor } from "@/constants/colors";

interface CurrentLocationModel {
  latitude: number;
  longitude: number;
  heading: number;
}

interface LocationContextProps {
  clearAllData: () => void;
  checkPermission: () => Promise<boolean>;
  isLocationEnabled: boolean;
  isForegroundLocationPermissionAllowed: boolean;
  isBackgroundLocationPermissionAllowed: boolean;
  startBackgroundLocationTracking: () => void;
  startForegroundLocationTracking: () => void;
  currentLocation?: CurrentLocationModel;
}

export const LocationContext = createContext<LocationContextProps | undefined>(
  undefined
);

interface LcoationProviderProps {
  children?: ReactNode;
}

const LOCATION_TASK_NAME = "background-location-task";

TaskManager.defineTask(
  LOCATION_TASK_NAME,
  async ({
    data,
    error,
  }: {
    data: {
      locations: {
        coords: CurrentLocationModel;
      }[];
    };
    error: any;
  }) => {
    if (error) {
      console.error("Background location error:", error);
      return;
    }

    const inProgressTicketId = await getItem("inProgressTicketId");
    console.log(
      "inProgressTicketId >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
      inProgressTicketId
    );

    if (inProgressTicketId) {
      if (data) {
        const { locations } = data;
        const { latitude, longitude, heading } = locations[0].coords;
        console.log("📍 Background location:", latitude, longitude, heading);
        // find lastest in progress ticket Id
        let token = await getItem(AUTH_TOKEN_KEY);
        if (token) {
          try {
            await axios.post(BASE_URL + `/login/validate?token=${token}`, {});
            // console.log(validateResponse);
          } catch (e) {
            console.error("token invalid");
            // Sentry.captureMessage(`token invalid -> ${(e as AxiosError)?.response}`);
            // Sentry.captureMessage(`token invalid -> ${(e as AxiosError)?.response?.data}`);
            try {
              const refreshToken = await getItem(REFRESH_TOKEN_KEY);
              console.log("refreshToken", refreshToken);
              const response = await axios.get(
                BASE_URL +
                  "/login/refresh_token" +
                  `?refreshToken=${refreshToken}`
              );
              const newToken = response.data?.data?.accessToken;
              await setItem(AUTH_TOKEN_KEY, newToken);
              console.log("newToken", newToken);
              token = newToken;
            } catch (e) {
              console.error("Refresh token error");
              if (e && e instanceof AxiosError) {
                console.log(e.response?.data);
              }
            }
          }

          wsClient.sendMessage({
            // ticketId: inProgressTicketId,
            ticketId: "2b7bb95a-6c3a-4d39-95fc-ba14eb3c3e80",
            lat: latitude,
            lng: longitude,
            heading: heading,
            token: "Bearer " + token,
          });
        }
      }
    } else {
      // console.log("No inProgressTicketId");
      // await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
  }
);

export const LocationProvider = ({ children }: LcoationProviderProps) => {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const { token } = useAuth();

  const socket = useWebSocket();

  const [isLocationEnabled, setIsLocationEnabled] = useState<boolean>(false);
  const [
    isForegroundLocationPermissionAllowed,
    setIsForegroundLocationPermissionAllowed,
  ] = useState(false);
  const [
    isBackgroundLocationPermissionAllowed,
    setIsBackgroundLocationPermissionAllowed,
  ] = useState(false);

  // current location of the user
  const [currentLocation, setCurrentLocation] =
    useState<CurrentLocationModel>(); // [lat, long]

  useEffect(() => {
    console.log("fetching address list ----------------------");

    // fetch the user address
    // fetchAddressList();
    // simultanously fetch the currect location of the user
    setCurrentLocationAsDefault();
  }, []);

  // handle location permission changes onResume
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      console.log("nextAppState", nextAppState);
      console.log("appState.current", appState.current);

      if (nextAppState === "active") {
        appState.current = nextAppState;
        setCurrentLocationAsDefault();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const checkLocationServices = async () => {
    const enabled = await Location.hasServicesEnabledAsync();
    setIsLocationEnabled(enabled);
    console.log("Location services enabled:", enabled);
    return enabled;
  };

  const checkForegroundPermission = async (): Promise<boolean> => {
    try {
      await checkLocationServices();
      if (Platform.OS === "android") {
        try {
          let { status, canAskAgain } =
            await Location.getForegroundPermissionsAsync();
          if (status === "granted") {
            return true;
          } else if (status === "undetermined") {
            let { status: newStatus } =
              await Location.requestForegroundPermissionsAsync();
            if (newStatus === "granted") {
              return true;
            }
          } else if (status === "denied" && canAskAgain) {
            let { status: newStatus } =
              await Location.requestForegroundPermissionsAsync();
            if (newStatus === "granted") {
              return true;
            }
          }
        } catch (e) {
          console.error("e -> ", e);
        }
        return false;
      } else {
        // granted = true; // Assuming iOS permission is handled elsewhere
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log("status ->", status);
        if (status === "granted") {
          return true;
        }
      }
    } catch (e) {
      console.error("e -> ", e);
    }
    return false;
  };

  const checkBackgroundPermission = async (): Promise<boolean> => {
    try {
      await checkLocationServices();
      if (Platform.OS === "android") {
        try {
          let { status, canAskAgain } =
            await Location.getBackgroundPermissionsAsync();
          if (status === "granted") {
            return true;
          } else if (status === "undetermined") {
            let { status: newStatus } =
              await Location.requestBackgroundPermissionsAsync();
            if (newStatus === "granted") {
              return true;
            }
          } else if (status === "denied" && canAskAgain) {
            let { status: newStatus } =
              await Location.requestBackgroundPermissionsAsync();
            if (newStatus === "granted") {
              return true;
            }
          }
        } catch (e) {
          console.error("e -> ", e);
        }
        return false;
      } else {
        // granted = true; // Assuming iOS permission is handled elsewhere
        const { status } = await Location.requestBackgroundPermissionsAsync();
        console.log("status ->", status);
        if (status === "granted") {
          return true;
        }
      }
    } catch (e) {
      console.error("e -> ", e);
    }
    return false;
  };

  // call only at first time app renders
  // till user closes consider this location as current location
  const setCurrentLocationAsDefault = async () => {
    // check foreground permission allowed
    const isForegroundPermitted = await checkForegroundPermission();
    setIsForegroundLocationPermissionAllowed(isForegroundPermitted);
    // check background permission allowed
    const isBackgroundPermitted = await checkBackgroundPermission();
    setIsBackgroundLocationPermissionAllowed(isBackgroundPermitted);
    // if foreground permission allowed fetch the current location
    if (isForegroundPermitted) {
      // check last know location
      let lastLocation = await Location.getLastKnownPositionAsync();
      if (lastLocation) {
        const { latitude, longitude } = lastLocation.coords;
        if (latitude && longitude) {
          // set current location and address
          setCurrentLocation({ latitude, longitude, heading: 0 });
        }
      } else {
        // if no last known location, get the current location
        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (coords.latitude && coords.longitude) {
          // set current location and address
          setCurrentLocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
            heading: 0,
          });
        } else {
          // set empty location and trigger fetchAddressList to find preferred Location
          setCurrentLocation(undefined);
        }
      }
    }
  };

  // track location is backgorund
  const startBackgroundLocationTracking = async () => {
    if (
      isForegroundLocationPermissionAllowed &&
      isBackgroundLocationPermissionAllowed
    ) {
      const isRegistered =
        await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      console.log(
        "isRegistered ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~>",
        isRegistered
      );

      if (!isRegistered) {
        console.log(
          "start register ->>>>>>>>>>>>>>>>>>>>>>>-------------------------->"
        );

        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000, // 5 seconds
          distanceInterval: 0,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: "GoDesk Tracking",
            notificationBody: "Tracking your delivery route in background",
            notificationColor: primaryColor, // your primary color
          },
        });
      }
    }
  };

  const startForegroundLocationTracking = async (ticketId?: string) => {
    // if background tracking is not enabled, start foreground tracking
    if (
      isForegroundLocationPermissionAllowed &&
      !isBackgroundLocationPermissionAllowed
    ) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (loc) => {
          const {
            coords: { latitude, longitude, heading },
          } = loc;

          console.log("coords", latitude, longitude, heading);

          setCurrentLocation({
            latitude,
            longitude,
            heading: heading ?? 0,
          });

          if (ticketId) {
            // update current location to customer
            socket?.sendMessage({
              // ticketId: ticketId,
              ticketId: "2b7bb95a-6c3a-4d39-95fc-ba14eb3c3e80",
              lat: latitude,
              lng: longitude,
              heading: heading,
              token: "Bearer " + token,
            });
          }
        }
      );
    }
  };

  const clearAllData = () => {
    setCurrentLocation(undefined);
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        clearAllData,
        checkPermission: checkForegroundPermission,
        isLocationEnabled,
        isForegroundLocationPermissionAllowed,
        isBackgroundLocationPermissionAllowed,
        startBackgroundLocationTracking,
        startForegroundLocationTracking,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
