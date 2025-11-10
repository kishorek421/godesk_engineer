import React, { useContext, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import {
  Platform,
  SafeAreaView,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { DeviceEventEmitter } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useNavigation } from "expo-router";
import CustomDrawerContent from "@/components/home/CustomDrawerContent";
import PrimaryText from "@/components/PrimaryText";
import { useTranslation } from "react-i18next";
import { primaryColor } from "@/constants/colors";
import { generateLogo, getGreetingMessage } from "@/utils/helper";
import useAuth from "@/hooks/useAuth";
import { LocationContext } from "@/context/LocationContext";
import { GET_ALL_NOTIFICATIONS } from "@/constants/api_endpoints";
import api from "@/clients/apiClient";
import { NotificationItemModel } from "@/models/notifications";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "react-native";

export const Layout = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [allNotifications, setAllNotifications] = useState<
    NotificationItemModel[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigation = useNavigation();
  const getMarginStart = (): number => {
    return Platform.OS === "ios" ? 0 : 15;
  };

  const fetchAllNotifications = async () => {
    try {
      let page = 1;
      let totalUnread = 0;
      let isLastPage = false;
      let allNotifications: NotificationItemModel[] = [];

      while (!isLastPage) {
        const response = await api.get(GET_ALL_NOTIFICATIONS, {
          params: {
            pageNo: page,
            pageSize: 10,
          },
        });

        const content = response.data?.data?.content ?? [];
        const paginator = response.data?.data?.paginator;

        if (content.length === 0) break;

        allNotifications = [...allNotifications, ...content];

        // Count unread items
        totalUnread += content.filter(
          (item: NotificationItemModel) => !item.isRead
        ).length;

        isLastPage = paginator?.lastPage === true;
        page++;
      }

      setAllNotifications(allNotifications);
      setUnreadCount(totalUnread);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchAllNotifications();
    }, [])
  );

  // Listen for foreground notification events to update the badge instantly
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      "NEW_NOTIFICATION_RECEIVED",
      () => {
        setUnreadCount((prev) => prev + 1);
      }
    );

    return () => {
      sub.remove();
    };
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={(props) => ({
          headerStyle: {
            backgroundColor: "#f2f2f2",
            shadowColor: "#f2f2f2",
          },
          header: () => (
            <SafeAreaView className="">
              <View>
                <View
                  className={`flex-1 flex-col justify-center items-center absolute w-full ${Platform.OS === "android" && "mt-4"}`}
                >
                 
                </View>
                <View>
                  <View
                    className={`flex-row justify-between items-center px-5 ${Platform.OS === "android" ? "mt-8 mb-8" : "mb-4"}`}
                  >
                    <TouchableOpacity
                      onPress={() => props.navigation?.openDrawer()}
                    >
                      <AntDesign name="bars" size={24} color="black" />
                    </TouchableOpacity>
                    <View className="flex-row justify-center items-center gap-3">
                      <TouchableOpacity
                        onPress={() =>
                          router.push("/notifications/all_notifications")
                        }
                      >
                        <View className="items-center justify-center">
                          <View className="relative">
                            <Ionicons
                              name="notifications-outline"
                              size={22}
                              color="black"
                            />
                            {unreadCount > 0 && (
                              <View className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full min-w-[16px] h-[16px] px-[3px] items-center justify-center z-10">
                                <PrimaryText className="text-white text-[10px] font-bold">
                                  {unreadCount > 99 ? "99+" : unreadCount}
                                </PrimaryText>
                              </View>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                      
                        {/* <View className="bg-primary-200 flex-col justify-center items-center w-8 h-8 rounded-full">
                          {
                            <PrimaryText className="text-primary-950 text-sm font-semibold">
                              {generateLogo(
                                user?.firstName ?? "",
                                user?.lastName
                              )}
                            </PrimaryText>
                          }
                        </View> */}
                     
                    </View>
                  </View>

                </View>
              </View>
            </SafeAreaView>
          ),
        })}
      >
        <Drawer.Screen
          name="home"
          options={{ title: ("Home"), headerTitle: "" }}
        />
               
        {/* <Drawer.Screen
          name="attendance"
          options={{
            title: t("Attendance"),
            headerTitleStyle: {
              fontWeight: "bold",
              marginLeft: getMarginStart(),
            },
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                {Platform.OS === "ios" ? (
                  <View className="flex-row justify-center items-center gap-1">
                    <Ionicons
                      name="chevron-back"
                      size={28}
                      color={primaryColor}
                    />
                    <PrimaryText className="text-primary-950 font-regular text-xl">
                      home
                    </PrimaryText>
                  </View>
                ) : (
                  <Ionicons
                    name="arrow-back-sharp"
                    size={24}
                    color="black"
                    className="ms-4"
                  />
                )}
              </TouchableOpacity>
            ),
            headerRight: undefined,
          }}
        /> */}
        {/* <Drawer.Screen
          name="Leave"
          options={{
            title: t("Leave"),
            headerTitleStyle: {
              fontWeight: "bold",
              marginLeft: getMarginStart(),
            },
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                {Platform.OS === "ios" ? (
                  <View className="flex-row justify-center items-center gap-1">
                    <Ionicons
                      name="chevron-back"
                      size={28}
                      color={primaryColor}
                    />
                    <Text className="text-primary-950 font-regular text-xl">
                      Home
                    </Text>
                  </View>
                ) : (
                  <Ionicons
                    name="arrow-back-sharp"
                    size={24}
                    color="black"
                    className="ms-4"
                  />
                )}
              </TouchableOpacity>
            ),
            headerRight: undefined,
          }}
        /> */}
        {/* <Drawer.Screen
          name="change_password"
          options={{
            title: "",
            headerTitleStyle: {
              fontWeight: "bold",
              marginLeft: getMarginStart(),
            },
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                {Platform.OS === "ios" ? (
                  <View className="flex-row justify-center items-center gap-1">
                    <Ionicons
                      name="chevron-back"
                      size={28}
                      color={primaryColor}
                    />
                    <Text className="text-primary-950 font-regular text-xl">
                      Home
                    </Text>
                  </View>
                ) : (
                  <Ionicons
                    name="arrow-back-sharp"
                    size={24}
                    color="black"
                    className="ms-4"
                  />
                )}
              </TouchableOpacity>
            ),
            headerRight: undefined,
          }}
        /> */}
      </Drawer>
    </GestureHandlerRootView>
  );
};

export default Layout;
