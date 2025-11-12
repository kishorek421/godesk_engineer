import {
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  Modal,
  ActivityIndicator,
  ScrollView,
  Platform,
  Alert,
  Linking,
  ToastAndroid,
  BackHandler,
} from "react-native";
import { primaryColor } from "@/constants/colors";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import React, { useEffect, useRef, useState } from "react";
import { Button, ButtonText } from "@/components/ui/button";
import RecentTicketHistoryLayout from "@/components/common/RecentTicketHistoryLayout";
import { Link, router, useFocusEffect } from "expo-router";
import { ServiceItemModel } from "@/models/ui/service_item_model";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RoleModel, RoleModulePermissionsModel } from "@/models/rbac";
import { CheckInOutStatusDetailsModel, UserDetailsModel } from "@/models/users";
import AntDesign from "@expo/vector-icons/AntDesign";
import { getGreetingMessage } from "@/utils/helper";
import api from "@/clients/apiClient";
import {
  GET_CHECK_IN_OUT_STATUS,
  GET_TICKETS_BY_STATUS_KEY,
} from "@/constants/api_endpoints";
import CheckInOutModal from "./CheckInOutModal";

import { SafeAreaView } from "react-native";
import useLocation from "@/hooks/useLocation";

import Fontisto from "@expo/vector-icons/Fontisto";
import BasePage from "../base/base_page";
import PrimaryText from "@/components/PrimaryText";

import { useSegments } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import LoadingBar from "../LoadingBar";
import { useTranslation } from "react-i18next";

const ContentLayout = ({
  customerDetails,
  authorizedModules,
  roleDetails,
}: {
  customerDetails: UserDetailsModel;
  authorizedModules: RoleModulePermissionsModel[];
  roleDetails: RoleModel;
}) => {

  const [serviceTabs, setServiceTabs] = useState<ServiceItemModel[]>([]);
  const width = Dimensions.get("window").width;
  const bottomSheetRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
 const { t } = useTranslation();
  const [checkInOutStatusDetails, setCheckInOutStatusDetails] =
    useState<CheckInOutStatusDetailsModel>({} as CheckInOutStatusDetailsModel);
  const [ticketsTabAdded, setTicketsTabAdded] = useState(false);
  const [leaveTabAdded, setLeaveTabAdded] = useState(false);
  const [customerTabsAdded, setCustomerTabsAdded] = useState(false);
  const [carouselIndex, setCarouselIndex] = React.useState<number>(0);
  const [exitApp, setExitApp] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const segments = useSegments();
  const [refreshFlag, setRefreshFlag] = useState(false);
  const { isForegroundLocationPermissionAllowed } = useLocation();
  const toggleCheckInCheckOut = () => {
    setIsModalVisible(!isModalVisible);
    if (!isModalVisible) {
      bottomSheetRef.current?.show();
    } else {
      bottomSheetRef.current?.hide();
    }
  };
  const handleDoubleClick = () => {
    if (exitApp) {
      BackHandler.exitApp();
    } else {
      setExitApp(true);
      ToastAndroid.show("Press again to exit", ToastAndroid.SHORT);
      timeoutRef.current = setTimeout(() => {
        setExitApp(false);
      }, 2000) as any;
    }
  };

  useEffect(() => {
    const backAction = () => {
      const currentPath = segments.join("/");

      // Adjust this to match your actual login route
      const isHomeScreen =
        currentPath === "home" ||
        currentPath === "(root)/home" ||
        currentPath === "" ||
        currentPath === "home";

      if (isHomeScreen) {
        handleDoubleClick();
        return true;
      } else if (router.canGoBack()) {
        router.back();
        return true;
      } else {
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

  useEffect(() => {
    if (customerDetails.id) {
      if (!ticketsTabAdded) {
        setServiceTabs((prev) => {
          const updatedTabs = [...prev];
          updatedTabs.push({
            label: "Tickets",
            icon: (
              <Ionicons name="ticket-outline" size={20} color={primaryColor} />
            ),
            path: "/(auth)/home",
            params: {
              customerId: customerDetails.id ?? "",
            },
            code: "TICKETS",
          });
          updatedTabs.push({
            label: "Attendance",
            icon: (
              <Ionicons
                name="calendar-outline"
                size={20}
                color={primaryColor}
              />
            ),
            path: "/checkIn_out/checkIn_out_list",
            params: {
              customerId: customerDetails.id ?? "",
            },
            code: "CHECKIN",
          });
            updatedTabs.push({
             label: "Leave",
            icon: (
              <Fontisto name="holiday-village" size={24} color={primaryColor} />
            ),
            path: "/leave/leave_history/list/leave_request_list",
            params: {
              customerId: customerDetails.id ?? "",
            },
            code: "LEAVE",
          });

          return updatedTabs;
        });

        setTicketsTabAdded(true);
      }

  
    }
  }, [customerDetails, roleDetails]);

  const fetchCheckInOutStatus = async () => {
    api
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

  return (
    <BasePage>
      <SafeAreaView className="h-full  ">
        <ScrollView className="h-full ">
          <View className="bg-gray-100 h-full">
            <View className="mt-2">
              <View className="">
                <View
                  className={`${Platform.OS === "ios" ? "px-4" : "px-4"} w-full`}
                >
                  <View className="flex-row justify-end items-end">
                    
                    {checkInOutStatusDetails.value !== "Checked Out" && (
                      <View className="">
                        <Button
                          className="bg-primary-950 rounded-lg"
                          onPress={async () => {
                            // Use location context instead of requesting permissions
                            if (isForegroundLocationPermissionAllowed) {
                              toggleCheckInCheckOut();
                            } else {
                              // Toast.show({
                              //   type: "error",
                              //   text1:translatedStrings['$1']
                              //     "Allow app location permission to Check In/Check Out",
                              //   visibilityTime: 5000,
                              // });
                              Alert.alert(
                                "Location Permission Required",
                                `Please allow location access in settings to access your ${checkInOutStatusDetails.value === "Checked In" ? "check out" : "check in"} location`,
                                [
                                  {
                                    text: "Allow Location",
                                    onPress: () => Linking.openSettings(), // Opens app settings
                                  },
                                ]
                                // { cancelable: false }
                              );
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
                </View>
                <ScrollView
                  className="p-0 m-0"
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                >
                  <View>

                    <View className={`w-full mt-4`}>
                      {serviceTabs && (
                        <VStack className={`w-full `}>
                          <Text
                            className={`${Platform.OS === "ios" ? "px-4" : "px-6"} text-[16px] font-semibold`}
                          >
                            Quick Actions
                          </Text>
                          <FlatList
                            // showsHorizontalScrollIndicator={false}
                            // scrollEnabled={false}
                            className="mt-2"
                            data={serviceTabs}
                            numColumns={3}
                            // horizontal
                            renderItem={(item) => {
                              const icon: any = item.item.icon;
                              return (
                                <BasePage>
                                  <Pressable
                                    onPress={() => {
                                      const path: any = item.item.path;
                                      if (path) {
                                        router.push({
                                          pathname: path,
                                          params: item.item.params ?? {},
                                        });
                                      }
                                    }}
                                  >
                                    <View
                                      className={`px-2 py-3 bg-white my-2  rounded-lg flex justify-center items-center gap-2 w-28 ${Platform.OS === "ios" ? "ms-4" : "ms-6"} ${item.index === serviceTabs.length - 1 && (Platform.OS === "ios" ? "me-4" : "me-6")}`}
                                      style={{
                                        backgroundColor: "#fff",
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 1.0,
                                        elevation: Platform.OS === "ios" ? 0 : 2, // Android
                                        padding: 16,
                                      }}
                                    >
                                      <View className=" w-10 h-10 p-1 bg-primary-100 rounded-full flex justify-center items-center ">
                                        {icon}
                                      </View>
                                      <Text className="text-primary-950 font-semibold text-sm">
                                        {item.item.label}
                                      </Text>
                                    </View>
                                  </Pressable>
                                </BasePage>
                              );
                            }}
                          />
                        </VStack>
                      )}
                    
            
                      <HStack
                        className={`${Platform.OS === "ios" ? "px-4" : "px-6"} justify-between mt-4`}
                      >
                        <View className="flex-row items-center">
                          <Text className="text-[16px] font-semibold">
                            Recent Tickets
                          </Text>
                          <Pressable
                            onPress={() => {
                              setRefreshFlag(true);
                            }}
                          >
                            <Feather
                              name="refresh-cw"
                              size={16}
                              color="black"
                              className="ms-2"
                            />
                          </Pressable>
                        </View>
                        <Pressable
                          onPress={() =>
                          router.push({
                            pathname: "/(auth)/home",
                          })
                          }
                        >
                          <Text className="text-sm underline color-primary-950 font-medium">
                            Show All
                          </Text>
                        </Pressable>
                      </HStack>
                      <View className="mt-2">
                        <RecentTicketHistoryLayout
                          placing="home"
                          refreshFlag={refreshFlag}
                          setRefreshFlag={setRefreshFlag}
                        />
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
            <CheckInOutModal
              setIsModalVisible={setIsModalVisible}
              bottomSheetRef={bottomSheetRef}
              status={checkInOutStatusDetails.value}
              checkedInId={checkInOutStatusDetails.id}
              onClose={() => {
                setIsModalVisible(false);
                toggleCheckInCheckOut();
                fetchCheckInOutStatus();
              }}
            />
          </View>
        </ScrollView>
      
      </SafeAreaView>

    </BasePage>
  );
};

export default ContentLayout;
