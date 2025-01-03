import {
  View,
  Text,
  BackHandler, 
  ToastAndroid,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { useLocalSearchParams, router, Link } from "expo-router";
import { TicketListItemModel } from "@/models/tickets";
import apiClient from "@/clients/apiClient";
import TicketStatusComponent from "@/components/tickets/TicketStatusComponent";
import moment from "moment";
import { useRouter, useSegments } from "expo-router";
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
import { useTranslation } from 'react-i18next';
const HomeScreen = () => {
  const { ticketId } = useLocalSearchParams();
  const [inProgressTicketDetails, setInProgressTicketDetails] =
    useState<TicketListItemModel>({});
  const [userDetails, setUserDetails] = useState<UserDetailsModel>({});
  const [isLoading, setIsLoading] = useState(true);
  const [exitApp, setExitApp] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { refresh } = useLocalSearchParams();
  const { t, i18n } = useTranslation();
  const bottomSheetRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const segments = useSegments(); 
  const [checkInOutStatusDetails, setCheckInOutStatusDetails] =
    useState<CheckInOutStatusDetailsModel>({});

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
          setCheckInOutStatusDetails(data);
        }
      })
      .catch((e) => {
        console.error(e.response.data);
      });
  };

  useEffect(() => {
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
      BackHandler.exitApp(); // Exits the app
    } else {
      setExitApp(true);
      ToastAndroid.show("Press again to exit", ToastAndroid.SHORT); // Optional feedback to user

      // Reset the `exitApp` state after 2 seconds
      timeoutRef.current = setTimeout(() => {
        setExitApp(false);
      }, 2000);
    }
  };

  useEffect(() => {
    const backAction = () => {
      if  (segments.join("/") === "home") {
       
        handleDoubleClick();
        return true;
      } else if (router.canGoBack()) {
        router.back(); // Navigate back if possible
        return true;
      } else {
        ToastAndroid.show("No screen to go back to!", ToastAndroid.SHORT);
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      backHandler.remove(); // Cleanup event listener
    };
  }, [exitApp, segments]);



  return (
    <SafeAreaView>
      <View className="mt-6 p-1">
        <View className="flex-row justify-between items-center">
          <View className="flex px-4">
            <Text className="mx-2 font-bold text-md">
              {getGreetingMessage()} 👋
            </Text>
            <Text className="mx-2 mt-[2px] font-semibold text-md text-primary-950">
              {userDetails?.firstName ?? ""} {userDetails?.lastName ?? ""}
            </Text>
            
          </View>
          {checkInOutStatusDetails.value !== "Checked Out" && (
            <View className="me-4">
              <Button
                className="bg-primary-950 mx-2 rounded-lg"
                onPress={() => {
                  toggleImagePicker();
                }}
              >
               <ButtonText>
                  {checkInOutStatusDetails.value === "Checked In"
                    ? t('checkOut')
                    : t('checkIn')}
                </ButtonText>
              </Button>
            </View>
          )}
        </View>
        {isLoading ? (
          <Text className="mt-6 text-center text-gray-500">Loading...</Text>
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
                    <View>
                      <Text className="font-bold text-gray-900">
                        {inProgressTicketDetails.ticketNo ?? "-"}
                      </Text>
                      <Text className="mt-[1px] text-[13px] text-gray-500">
                        Issue in{" "}
                        {inProgressTicketDetails.issueTypeDetails?.name ?? "-"}
                      </Text>
                    </View>
                    <TicketStatusComponent
                      statusKey={
                        inProgressTicketDetails.statusDetails?.key ?? ""
                      }
                      statusValue={
                        inProgressTicketDetails.statusDetails?.value ?? ""
                      }
                    />
                  </View>
                  <View className="border-[1px] border-gray-300 mt-3 mb-3 border-dashed w-full h-[1px]" />
                  <View className="w-full">
                    <View className="flex-row justify-between items-center">
                      <View className="flex">
                        <Text className="text-gray-500 text-md">{t('raisedBy')}</Text>
                        <Text className="mt-[2px] font-semibold text-gray-900 text-md">
                          {inProgressTicketDetails.customerDetails?.firstName ??
                            ""}{" "}
                          {inProgressTicketDetails.customerDetails?.lastName ??
                            ""}
                        </Text>
                      </View>
                      <View className="flex items-end">
                        <Text className="text-gray-500 text-md">{('raisedAt')}</Text>
                        <Text className="mt-[2px] font-semibold text-gray-900 text-md">
                          {inProgressTicketDetails.createdAt
                            ? moment(
                                Number.parseInt(
                                  inProgressTicketDetails.createdAt
                                )
                              ).fromNow()
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
// Register background task for location updates
// TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
//     if (error) {
//       console.error('Background location error:', error);
//       return;
//     }

//     if (data) {
//       const { locations } = data;
//       const { latitude, longitude } = locations[0].coords;
//       console.log('Background location updated:', { latitude, longitude });
//     }
//   });