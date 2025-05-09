import {
  View,
  Text,
  BackHandler,
  ToastAndroid,
  SafeAreaView,
  Pressable,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { router, Link, useSegments } from "expo-router";
import { TicketListItemModel } from "@/models/tickets";
import apiClient from "@/clients/apiClient";
import TicketStatusComponent from "@/components/tickets/TicketStatusComponent";
import moment from "moment";
import {
  GET_CHECK_IN_OUT_STATUS,
  GET_INPROGRESS_TICKETS_DETAILS,
  GET_USER_DETAILS,
} from "@/constants/api_endpoints";
import TicketListLayout from "@/components/tickets/TicketListLayout";
import { CheckInOutStatusDetailsModel, UserDetailsModel } from "@/models/users";
import { getGreetingMessage } from "@/utils/helper";
import { Button, ButtonText } from "@/components/ui/button";
import CheckInOutModal from "@/components/home/CheckInOutModal";
import { useTranslation } from "react-i18next";
import {
  hasServicesEnabledAsync,
  requestForegroundPermissionsAsync,
} from "expo-location";
import Toast from "react-native-toast-message";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import Ionicons from "@expo/vector-icons/Ionicons";
const LOCATION_TASK_NAME = "background-location-task";

// // Define the background task
// TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
//   if (error) {
//     console.error(error);
//     return;
//   }

//   if (data) {
//     const { locations } = data; // Array of location updates
//     console.log("Received new locations:", locations);
//   }
// });

const HomeScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [exitApp, setExitApp] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { t } = useTranslation();
  const bottomSheetRef = useRef(null);
  const segments = useSegments();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [checkInOutStatusDetails, setCheckInOutStatusDetails] =
    useState<CheckInOutStatusDetailsModel>({});
  const [inProgressTicketDetails, setInProgressTicketDetails] =
    useState<TicketListItemModel>({});
  const [userDetails, setUserDetails] = useState<UserDetailsModel>({});

  const toggleImagePicker = () => {
    setIsModalVisible(!isModalVisible);
    if (!isModalVisible) {
      bottomSheetRef.current?.show();
    } else {
      bottomSheetRef.current?.hide();
    }
  };

  useEffect(() => {
    fetchInProgressTicketDetails();
    fetchUserDetails();
  }, []);

  const fetchCheckInOutStatus = async () => {
    apiClient
      .get(GET_CHECK_IN_OUT_STATUS)
      .then((response) => {
        console.log("checkInDetails", response.data.data);
        const data = response.data?.data;
        if (data) {
          console.log("data ------>", data);
          setCheckInOutStatusDetails(data);
        }
      })
      .catch((e) => {
        console.error(e.response.data);
      });
  };

  useEffect(() => {
    // requestPermissions();
    fetchCheckInOutStatus();
  }, []);

  const fetchInProgressTicketDetails = () => {
    apiClient
      .get(GET_INPROGRESS_TICKETS_DETAILS)
      .then((response) => {
        const content = response.data?.data?.content;
        console.log("inProgressTicketDetails", content);

        if (content && content.length > 0) {
          const ticketData = content[0] ?? {};
          setInProgressTicketDetails(ticketData);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tickets", error);
        setIsLoading(false);
      });
  };

  const fetchUserDetails = () => {
    apiClient
      .get(GET_USER_DETAILS)
      .then((response) => {
        console.log(response.data?.data);
        const userData = response.data.data ?? {};
        setUserDetails(userData);
      })
      .catch((error) => {
        console.error("Error fetching user details", error);
      });
  };

  const handleDoubleClick = () => {
    if (exitApp) {
      BackHandler.exitApp();
    } else {
      setExitApp(true);
      ToastAndroid.show("Press again to exit", ToastAndroid.SHORT);
      timeoutRef.current = setTimeout(() => {
        setExitApp(false);
      }, 2000);
    }
  };

  useEffect(() => {
    const backAction = () => {
      if (segments.join("/") === "home") {
        handleDoubleClick();
        return true;
      } else if (router.canGoBack()) {
        router.back();
        return true;
      } else {
        ToastAndroid.show("No screen to go back to!", ToastAndroid.SHORT);
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      backHandler.remove();
    };
  }, [exitApp, segments]);

  // Start background location tracking
  // async function startLocationTracking() {
  //   const hasStarted =
  //     await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  //   if (hasStarted) {
  //     console.log("Background location tracking already started");
  //     return;
  //   }

  //   await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
  //     accuracy: Location.Accuracy.High,
  //     timeInterval: 10000, // Update every 10 seconds
  //     distanceInterval: 50, // Update every 50 meters
  //     showsBackgroundLocationIndicator: true, // iOS only
  //     foregroundService: {
  //       notificationTitle: "Tracking your location",
  //       notificationBody: "We are monitoring your location in the background.",
  //     },
  //   });

  //   console.log("Background location tracking started");
  // }

  // async function requestPermissions() {
  //   const { status: foregroundStatus } =
  //     await Location.requestForegroundPermissionsAsync();
  //   console.log("foregroundStatus", foregroundStatus);

  //   if (foregroundStatus === "granted") {
  //     const { status: backgroundStatus } =
  //       await Location.requestBackgroundPermissionsAsync();
  //     console.log("backgroundStatus", backgroundStatus);

  //     if (backgroundStatus === "granted") {
  //       // await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
  //       //   accuracy: Location.Accuracy.Balanced,
  //       // });
  //       startLocationTracking();
  //     }
  //   }

  //   console.log("All permissions granted");
  // }

  return (
    <SafeAreaView>
      <View className="mt-4 flex-row justify-end mx-4">
        <Ionicons
          name="notifications-outline"
          size={20}
          color="black"
          onPress={() => router.push("/notifications/all_notifications")}
        />
      </View>
      <View className="mt-6 p-1">
        <View className="flex-row justify-between items-center">
          <View className="flex px-4">
            <Text className="mx-2  font-medium text-md leading-5">
              {getGreetingMessage()} 👋
            </Text>
            <Text className="mx-2 mt-[2px] font-semibold font-regular text-md text-primary-950">
              {userDetails?.firstName ?? ""} {userDetails?.lastName ?? ""}
            </Text>
            {/* <Text><Link href={'/sitemap'}>sitemap</Link></Text> */}
          </View>

          {checkInOutStatusDetails.id == undefined && checkInOutStatusDetails.value !== "Checked Out" && (
            <View className="me-4">
              <Button
                className="bg-primary-950 rounded-lg"
                onPress={async () => {
                  const { status } = await requestForegroundPermissionsAsync();
                  if (status === "granted") {
                    toggleImagePicker();
                  } else {
                    Toast.show({
                      type: "error",
                      text1: "Allow location permission to Check In/Check Out",
                    });
                  }
                }}
              >
                <ButtonText>
                  {checkInOutStatusDetails.value === "Checked In"
                    ? t("checkOut")
                    : t("checkIn")}
                </ButtonText>
              </Button>

            </View>
          )}

        </View>
        {isLoading ? (
          <Text className="mt-6 text-center font-regular text-gray-500">
            Loading...
          </Text>
        ) : (
          inProgressTicketDetails.id && (
            <Pressable
              className="mt-4 px-4 w-full"
              onPress={() => {
                router.push({
                  pathname: "/ticket_details/[ticketId]",
                  params: { ticketId: inProgressTicketDetails.id ?? "" },
                });
              }}
            >
              <View className="bg-white px-4 py-3 rounded-lg w-full">
                <View className="flex">
                  <View className="flex-row justify-between w-full items-center">
                    <View>
                      <Text className="font-bold-1 text-tertiary-950 leading-5">
                        {inProgressTicketDetails.ticketNo ?? "-"}
                      </Text>
                      <Text className="mt-[1px] text-[13px] text-gray-900 font-regular">
                        Issue in{" "}
                        {inProgressTicketDetails.issueTypeDetails?.name ?? "-"}
                      </Text>
                    </View>
                    <View>
                      <TicketStatusComponent
                        statusKey={
                          inProgressTicketDetails.statusDetails?.key ?? ""
                        }
                        statusValue={
                          inProgressTicketDetails.statusDetails?.value ?? ""
                        }
                      />
                    </View>
                  </View>
                  <View className="border-[1px] border-gray-300 mt-3 mb-3 border-dashed w-full h-[1px]" />
                  <View className="w-full">
                    <View className="flex-row justify-between items-center">
                      <View className="flex">
                        <Text className="text-gray-500 font-regular text-md">
                          {t("raisedBy")}
                        </Text>
                        <Text className="mt-[2px] font-semibold text-gray-900 text-md leading-5">
                          {inProgressTicketDetails.customerDetails?.firstName ??
                            ""}{" "}
                          {inProgressTicketDetails.customerDetails?.lastName ??
                            ""}
                        </Text>
                      </View>
                      <View className="flex items-end">
                        <Text className="text-gray-500 font-regular text-md">
                          {t("raisedAt")}
                        </Text>
                        <Text className="mt-[2px] font-semibold text-gray-900 text-md leading-5">
                          {inProgressTicketDetails.createdAt
                            ? moment(
                              Number.parseInt(
                                inProgressTicketDetails.createdAt
                              )
                            ).format("DD-MM-YYYY hh:mm a")
                            : "-"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          )
        )}
        <CheckInOutModal
          setIsModalVisible={setIsModalVisible}
          bottomSheetRef={bottomSheetRef}
          status={checkInOutStatusDetails.value}
          checkedInId={checkInOutStatusDetails.id}
          onClose={() => {
            setIsModalVisible(false);
            toggleImagePicker();
            fetchCheckInOutStatus();
          }}
        />
        <TicketListLayout />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
