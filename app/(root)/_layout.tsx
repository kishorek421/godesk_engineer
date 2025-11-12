import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import {
  TouchableOpacity,
  View,
  Text,
  Platform,
} from "react-native";
import { DeviceEventEmitter } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useNavigation } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import CustomDrawerContent from "@/components/home/CustomDrawerContent";
import PrimaryText from "@/components/PrimaryText";
import { useTranslation } from "react-i18next";
import { primaryColor } from "@/constants/colors";
import { getGreetingMessage } from "@/utils/helper";
import useAuth from "@/hooks/useAuth";
import api from "@/clients/apiClient";
import {
  GET_ALL_NOTIFICATIONS,
  GET_USER_DETAILS,
} from "@/constants/api_endpoints";
import { NotificationItemModel } from "@/models/notifications";
import { useFocusEffect } from "@react-navigation/native";
import { UserDetailsModel } from "@/models/users";

export const Layout = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [customerDetails, setCustomerDetails] = useState<UserDetailsModel>();
  const [allNotifications, setAllNotifications] = useState<NotificationItemModel[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    api
      .get(GET_USER_DETAILS, {})
      .then((response) => {
        const details = response.data?.data ?? {};
        setCustomerDetails(details);
      })
      .catch(console.error);
  }, []);

  const fetchAllNotifications = async () => {
    try {
      let page = 1;
      let totalUnread = 0;
      let isLastPage = false;
      let allNotifications: NotificationItemModel[] = [];

      while (!isLastPage) {
        const response = await api.get(GET_ALL_NOTIFICATIONS, {
          params: { pageNo: page, pageSize: 10 },
        });

        const content = response.data?.data?.content ?? [];
        const paginator = response.data?.data?.paginator;

        if (content.length === 0) break;

        allNotifications = [...allNotifications, ...content];
        totalUnread += content.filter((item : any) => !item.isRead).length;
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

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("NEW_NOTIFICATION_RECEIVED", () => {
      setUnreadCount((prev) => prev + 1);
    });
    return () => sub.remove();
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
            <SafeAreaView className="bg-primary-950" edges={["top"]}>
              <View>
                <View
                  className={`flex-1 flex-col justify-center items-center absolute w-full`}
                >
                  <PrimaryText
                    className="text-[11px] font-medium text-gray-100"
                    translate="none"
                  >
                    {t(getGreetingMessage())} 👋
                  </PrimaryText>
                  <Text className="flex-1 text-white font-semibold text-sm">
                    {customerDetails?.firstName ?? ""} {customerDetails?.lastName ?? ""}
                  </Text>
                </View>
                <View>
                  <View className={`flex-row justify-between items-center px-3 mb-4`}>
                    <TouchableOpacity
                      onPress={() => props.navigation?.openDrawer()}
                    >
                      <AntDesign name="bars" size={24} color="white" />
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
                              color="white"
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
                     
                    </View>
                  </View>
                  <View className="h-0.5 bg-gray-50" />
                </View>
              </View>
            </SafeAreaView>
          ),
        })}
      >
        {/* <Drawer.Screen
          name="home"
          options={{ title: t("home"), headerTitle: "" }}
        />
        <Drawer.Screen
          name="contact_us"
          options={{
            title: t("contactUs"),
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
        />
        <Drawer.Screen
          name="FAQ"
          options={{
            title: t("faqs"),
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
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: t("settings"),
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
