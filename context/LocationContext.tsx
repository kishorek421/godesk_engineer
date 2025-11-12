import React, { useEffect, useRef, useState } from "react";
import { createContext, ReactNode } from "react";
import * as Location from "expo-location";
import api from "@/clients/apiClient";
import { AppState, AppStateStatus, Platform } from "react-native";
// import { useWebSocket } from "./WSContext";
import useAuth from "@/hooks/useAuth";
import * as TaskManager from "expo-task-manager";
import { getItem, setItem } from "@/utils/secure_store";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/storage_keys";
import { BASE_URL } from "@/config/env";
import axios, { AxiosError } from "axios";
// import { wsClient } from "@/clients/ws_client";
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
  stopBackgroundLocationTracking: () => Promise<void>;
  isBackgroundLocationRunning: () => Promise<boolean>;
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
      if (data && data.locations && data.locations.length > 0) {
        const { locations } = data;
        const { latitude, longitude, heading } = locations[0].coords;
        console.log("📍 Background location:", latitude, longitude, heading);
        
        // Validate coordinates
        if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
          console.error("Invalid coordinates received:", { latitude, longitude, heading });
          return;
        }

        let token = await getItem(AUTH_TOKEN_KEY);
        if (token) {
          try {
            // Validate token
            await axios.post(BASE_URL + `/login/validate?token=${token}`, {});
          } catch (e) {
            console.error("Token validation failed, attempting refresh");
            try {
              const refreshToken = await getItem(REFRESH_TOKEN_KEY);
              console.log("Refreshing token...");
              const response = await axios.get(
                BASE_URL +
                  "/login/refresh_token" +
                  `?refreshToken=${refreshToken}`
              );
              const newToken = response.data?.data?.accessToken;
              await setItem(AUTH_TOKEN_KEY, newToken);
              console.log("Token refreshed successfully");
              token = newToken;
            } catch (refreshError) {
              console.error("Token refresh failed:", refreshError);
              return; // Exit if we can't get a valid token
            }
          }

          // Check if WebSocket is connected before sending
          if (wsClient.isConnected()) {
            try {
              wsClient.sendMessage({
                ticketId: inProgressTicketId,
                lat: latitude,
                lng: longitude,
                heading: heading,
                token: "Bearer " + token,
              });
              console.log("📍 Location sent via WebSocket successfully");
            } catch (wsError) {
              console.error("WebSocket send error:", wsError);
              // Fallback to API call if WebSocket fails
              try {
                await axios.post(BASE_URL + "/location/update", {
                  ticketId: inProgressTicketId,
                  lat: latitude,
                  lng: longitude,
                  heading: heading || 0,
                }, {
                  headers: { Authorization: "Bearer " + token }
                });
                console.log("📍 Location sent via API fallback");
              } catch (apiError) {
                console.error("API fallback also failed:", apiError);
              }
            }
          } else {
            console.log("WebSocket not connected, attempting to send via API");
            // Fallback to API call if WebSocket is not connected
            try {
              await axios.post(BASE_URL + "/location/update", {
                ticketId: inProgressTicketId,
                lat: latitude,
                lng: longitude,
                heading: heading || 0,
              }, {
                headers: { Authorization: "Bearer " + token }
              });
              console.log("📍 Location sent via API fallback");
            } catch (apiError) {
              console.error("API fallback failed:", apiError);
            }
          }
        } else {
          console.error("No valid token available for location update");
        }
      } else {
        console.log("No location data received in background task");
      }
    } else {
      console.log("No inProgressTicketId, stopping background location updates");
      // Stop background location updates if no active ticket
      try {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        console.log("Background location updates stopped");
      } catch (stopError) {
        console.error("Error stopping location updates:", stopError);
      }
    }
  }
);

export const LocationProvider = ({ children }: LcoationProviderProps) => {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const { token } = useAuth();

  // const socket = useWebSocket();

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
         return false;
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
          let { status } = await Location.getBackgroundPermissionsAsync();
          if (status === "granted") {
            return true;
          }
          // Don't request permissions - just return false if not granted
          return false;
        } catch (e) {
          console.error("e -> ", e);
        }
        return false;
      } else {
        // For iOS, just check status without requesting
        const { status } = await Location.getBackgroundPermissionsAsync();
        console.log("status ->", status);
        return status === "granted";
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

  // track location is background
  const startBackgroundLocationTracking = async () => {
    if (
      isForegroundLocationPermissionAllowed &&
      isBackgroundLocationPermissionAllowed
    ) {
      try {
        // First, check if task is already registered
        const isRegistered =
          await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
        console.log(
          "Background location task registered:",
          isRegistered
        );

        if (isRegistered) {
          console.log("Background location task already running");
          return;
        }

        console.log("Starting background location tracking...");

        // Start location updates with optimized settings
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.High, // Use high accuracy for better tracking
          timeInterval: 5000, // 5 seconds
          distanceInterval: 5, // 5 meters - helps with battery optimization
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: "GoDesk Tracking",
            notificationBody: "Tracking your delivery route in background",
            notificationColor: primaryColor,
          },
          // Add additional options for better reliability
          activityType: Location.ActivityType.AutomotiveNavigation,
          pausesUpdatesAutomatically: false, // Keep tracking even when stationary
        });

        console.log("Background location tracking started successfully");
      } catch (error) {
        console.error("Failed to start background location tracking:", error);
        
        // Try to unregister and re-register if there's an error
        try {
          await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
          console.log("Stopped existing location updates");
          
          // Wait a moment before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 5,
            showsBackgroundLocationIndicator: true,
            foregroundService: {
              notificationTitle: "GoDesk Tracking",
              notificationBody: "Tracking your delivery route in background",
              notificationColor: primaryColor,
            },
            activityType: Location.ActivityType.AutomotiveNavigation,
            pausesUpdatesAutomatically: false,
          });
          
          console.log("Background location tracking restarted successfully");
        } catch (retryError) {
          console.error("Failed to restart background location tracking:", retryError);
        }
      }
    } else {
      console.log("Location permissions not granted for background tracking");
    }
  };

  const stopBackgroundLocationTracking = async () => {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log("Background location tracking stopped");
    } catch (error) {
      console.error("Error stopping background location tracking:", error);
    }
  };

  const isBackgroundLocationRunning = async (): Promise<boolean> => {
    try {
      return await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    } catch (error) {
      console.error("Error checking background location status:", error);
      return false;
    }
  };

  const startForegroundLocationTracking = async (ticketId?: string) => {
    console.log("start foreground location tracking from context ------------------>");
    console.log("isForegroundLocationPermissionAllowed from context------------------>", isForegroundLocationPermissionAllowed);
    console.log("isBackgroundLocationPermissionAllowed from context------------------>", isBackgroundLocationPermissionAllowed);
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

          // if (ticketId) {
          //   // update current location to customer
          //   socket?.sendMessage({
          //     ticketId: ticketId,
          //     lat: latitude,
          //     lng: longitude,
          //     heading: heading,
          //     token: "Bearer " + token,
          //   });
          // }
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
        stopBackgroundLocationTracking,
        isBackgroundLocationRunning,
        startForegroundLocationTracking,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
