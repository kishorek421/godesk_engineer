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
import PrimaryText from "@/components/PrimaryText";
import {
  GET_CHECK_IN_OUT_STATUS,
  GET_INPROGRESS_TICKETS_DETAILS,
  GET_USER_DETAILS,
  GET_ATTENDANCE_TRANSACTION
} from "@/constants/api_endpoints";
import TicketListLayout from "@/components/tickets/TicketListLayout";
import { CheckInOutStatusDetailsModel, UserDetailsModel } from "@/models/users";
import { getGreetingMessage } from "@/utils/helper";
import { Button, ButtonText } from "@/components/ui/button";
import CheckInOutModal from "@/components/home/CheckInOutModal";
import Ionicons from "@expo/vector-icons/Ionicons";
import BasePage from "@/components/base/base_page";
import { t } from "i18next";
import { useToast } from "@/context/ToastContext";
// import useLocation from "@/hooks/useLocation";
import { removeItem, setItem } from "@/utils/secure_store";
import { requestForegroundPermissionsAsync } from "expo-location";
import { TouchableWithoutFeedback } from "react-native";

const HomeScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [exitApp, setExitApp] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bottomSheetRef = useRef(null);
  const segments = useSegments();
  const { showToast } = useToast();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [checkInOutStatusDetails, setCheckInOutStatusDetails] =
    useState<CheckInOutStatusDetailsModel>({});
  const [checkInOutStatus, setCheckInOutStatus] = useState<CheckInOutStatusDetailsModel[]>([]);
    const [expanded, setExpanded] = useState(false);
  const [inProgressTicketDetails, setInProgressTicketDetails] =
    useState<TicketListItemModel>({});
  const [userDetails, setUserDetails] = useState<UserDetailsModel>({});

  // const {
  //   isForegroundLocationPermissionAllowed,
  //   isBackgroundLocationPermissionAllowed,
  //   startBackgroundLocationTracking,
  //   startForegroundLocationTracking,
  // } = useLocation();

  const [todayCheckInTime, setTodayCheckInTime] = useState<string | null>(null);
  const [todayCheckOutTime, setTodayCheckOutTime] = useState<string | null>(null);
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
    getCheckInOutStatus();
    fetchCheckInOutStatus();
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
  const getCheckInOutStatus = async () => {
    try {
      const response = await apiClient.get(GET_ATTENDANCE_TRANSACTION);
      const data = response.data?.data?.content;

      if (data && Array.isArray(data)) {
        const today = new Date().toISOString().split("T")[0];
        const todayEntry = data.find((item: CheckInOutStatusDetailsModel) => item.date === today);

        if (todayEntry?.check_in) {
          setTodayCheckInTime(todayEntry.check_in.split(".")[0]);
        } else {
          setTodayCheckInTime(null);
        }

        if (todayEntry?.check_out) {
          setTodayCheckOutTime(todayEntry.check_out.split(".")[0]);
        } else {
          setTodayCheckOutTime(null);
        }
      }
    } catch (e: any) {
      console.error("Error fetching ", e.response?.data || e.message);
    }
  };

  // useEffect(() => {
  //   if (
  //     isForegroundLocationPermissionAllowed &&
  //     isBackgroundLocationPermissionAllowed
  //   ) {
  //     if (inProgressTicketDetails?.id) {
  //       console.log(
  //         "start tracking background -------------------------------->"
  //       );

  //       startBackgroundLocationTracking();
  //     } else if (isForegroundLocationPermissionAllowed) {
  //       // if background permission is not allowed, start foreground location tracking
  //       startForegroundLocationTracking();
  //     }
  //   } else if (isForegroundLocationPermissionAllowed) {
  //     // if background permission is not allowed, start foreground location tracking
  //     startForegroundLocationTracking();
  //   }
  // }, [
  //   isForegroundLocationPermissionAllowed,
  //   isBackgroundLocationPermissionAllowed,
  //   inProgressTicketDetails?.id,
  // ]);


  const fetchInProgressTicketDetails = () => {
    apiClient
      .get(GET_INPROGRESS_TICKETS_DETAILS)
      .then(async (response) => {
        const content = response.data?.data?.content;
        console.log("inProgressTicketDetails", JSON.stringify(content));

        if (content && content.length > 0) {
          const ticketData = content[0] ?? {};
          console.log("ticketId -------------->", ticketData.id);
          setInProgressTicketDetails(ticketData);
          const ticketId = ticketData.id;
          await setItem("inProgressTicketId", ticketId);
        } else {
          await removeItem("inProgressTicketId");
        }
      })
      .catch(async (error) => {
        console.error("Error fetching tickets", error);
        await removeItem("inProgressTicketId");
      })
      .finally(() => {
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
    <BasePage>
      <View className="mt-4 mx-3 flex-row justify-between items-start">
        <View>
          {todayCheckInTime && (
            <View className="bg-blue-200 rounded-md px-2 py-1 mx-4 self-start">
              <PrimaryText className="text-gray-800 font-medium text-sm" >
               {t("checkInMessage", { time: todayCheckInTime })}
              </PrimaryText>

              {todayCheckOutTime && (
                <PrimaryText className="text-gray-800 font-medium text-sm" >
                  {t("checkOutMessage", { time: todayCheckOutTime })}
                </PrimaryText>
              )}
            </View>
          )}
        </View>

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
            <PrimaryText className="mx-2  font-medium text-md leading-5">
              {t(getGreetingMessage())} 👋
            </PrimaryText>
            <PrimaryText className="mx-2 mt-[2px] font-semibold font-regular text-md text-primary-950">
              {userDetails?.firstName ?? ""} {userDetails?.lastName ?? ""}
            </PrimaryText>
            <PrimaryText className=""><Link href={'/sitemap'}>sitemap</Link></PrimaryText>
          </View>
          {checkInOutStatusDetails.value !== "Checked Out" && (
            <View className="me-4">
              <Button
                className="bg-primary-950 rounded-lg"
                  onPress={async () => {
                  const { status } = await requestForegroundPermissionsAsync();
                  if (status === "granted") {
                    toggleImagePicker();
                    await getCheckInOutStatus();
                    await fetchCheckInOutStatus();
                  } else {
                    showToast({
                      position: "top",
                      type: "error",
                      message: "toast18",
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
          <PrimaryText className="mt-6 text-center font-regular text-gray-500">
            Loading...
          </PrimaryText>
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
                   <View className="flex-row justify-between w-full">
                    <View className="flex-1">
                      <PrimaryText className="text-tertiary-950 leading-5  font-bold-1">
                        {inProgressTicketDetails?.ticketNo ?? "-"}
                      </PrimaryText>
                      <TouchableWithoutFeedback onPress={() => setExpanded(!expanded)}>
                        <PrimaryText
                          className="mt-[1px] text-[13px] text-gray-900 font-regular"
                          translate="api"
                          numberOfLines={expanded ? undefined : 4}
                          ellipsizeMode="tail"
                        >
                          {`${t('issueIn')}: ${Array.isArray(inProgressTicketDetails.issueTypeDetails) && inProgressTicketDetails.issueTypeDetails.length > 0
                            ? inProgressTicketDetails.issueTypeDetails.map((item) => item?.name).filter(Boolean).join(', ')
                            : "-"
                            }`}
                        </PrimaryText>
                      </TouchableWithoutFeedback>
                    </View>
                    <TicketStatusComponent
                      statusKey={inProgressTicketDetails.statusDetails?.key}
                      statusValue={inProgressTicketDetails.statusDetails?.value}
                    />
                  </View>
                  <View className="border-[1px] border-gray-300 mt-3 mb-3 border-dashed w-full h-[1px]" />
                  <View className="w-full">
                    <View className="flex-row justify-between items-center">
                      <View className="flex">
                        <PrimaryText className="text-gray-500 font-regular text-md">
                          raisedBy
                        </PrimaryText>
                        <PrimaryText className="mt-[2px] font-semibold text-gray-900 text-md leading-5">
                          {inProgressTicketDetails.customerDetails?.firstName ??
                            ""}{" "}
                          {inProgressTicketDetails.customerDetails?.lastName ??
                            ""}
                        </PrimaryText>
                      </View>
                      <View className="flex items-end">
                        <PrimaryText className="text-gray-500 font-regular text-md">
                          raisedAt
                        </PrimaryText>
                        <PrimaryText className="mt-[2px] font-semibold text-gray-900 text-md leading-5">
                          {inProgressTicketDetails.createdAt
                            ? moment(
                                Number.parseInt(
                                  inProgressTicketDetails.createdAt
                                )
                              ).format("DD-MM-YYYY hh:mm a")
                            : "-"}
                        </PrimaryText>
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
    </BasePage>
  );
};

export default HomeScreen;