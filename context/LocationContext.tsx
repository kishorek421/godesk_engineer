import React, { useEffect, useRef, useState } from "react";
import { createContext, ReactNode } from "react";
import * as Location from "expo-location";
import api from "@/clients/apiClient";
import { AppState, AppStateStatus, Platform } from "react-native";
import { useWebSocket } from "./WSContext";
import useAuth from "@/hooks/useAuth";
import * as TaskManager from "expo-task-manager";

interface CurrentLocationModel {
  latitude: number;
  longitude: number;
  heading: number;
}

interface LocationContextProps {
  clearAllData: () => void;
  checkPermission: () => Promise<boolean>;
  isLocationEnabled: boolean;
  isLocationPermissionAllowed: boolean;
  watchCurrentLocationChanges: (ticketId?: string) => void;
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
  async ({ data, error }: { data: CurrentLocationModel; error: any }) => {
    if (error) {
      console.error("Background location error:", error);
      return;
    }

    if (data) {
      const { latitude, longitude, heading } = data;
      console.log("📍 Background location:", latitude, longitude, heading);
      // You can: update a server, save to local DB, etc.
    }
  }
);

export const LocationProvider = ({ children }: LcoationProviderProps) => {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const { token } = useAuth();

  const [isLocationEnabled, setIsLocationEnabled] = useState<boolean>(false);
  const [isLocationPermissionAllowed, setIsLocationPermissionAllowed] =
    useState(false);

  const socket = useWebSocket();

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

  // track location is backgorund

  const startBackgroundLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const { status: bgStatus } =
      await Location.requestBackgroundPermissionsAsync();

    if (status !== "granted" || bgStatus !== "granted") {
      console.warn("Location permissions not granted!");
      return;
    }

    const isRegistered =
      await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (!isRegistered) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 5000, // 5 seconds
        distanceInterval: 5,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "GoDesk Tracking",
          notificationBody: "Tracking your delivery route in background",
          notificationColor: "#206e69", // your primary color
        },
      });
    }
  };

  // call only at first time app renders
  // till user closes consider this location as current location
  const setCurrentLocationAsDefault = async () => {
    const isPermitted = await checkForegroundPermission();
    setIsLocationPermissionAllowed(isPermitted);
    if (isPermitted) {
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

  const clearAllData = () => {
    setCurrentLocation(undefined);
  };

  const watchCurrentLocationChanges = async (ticketId?: string) => {
    if (isLocationPermissionAllowed) {
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
              ticketId: ticketId,
              lat: latitude,
              lng: longitude,
              heading: heading,
              token: token,
            });
          }
        }
      );
    }
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        clearAllData,
        checkPermission: checkForegroundPermission,
        isLocationEnabled,
        isLocationPermissionAllowed,
        watchCurrentLocationChanges,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
