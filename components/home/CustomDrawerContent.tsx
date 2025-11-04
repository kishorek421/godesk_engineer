import { clearStorage, removeItem } from "@/utils/secure_store";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, Image, Alert, Platform, Pressable } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import AntDesign from "@expo/vector-icons/AntDesign";
import useAuth from "@/hooks/useAuth";
import api from "@/clients/apiClient";
import { DELETE_CUSTOMER } from "@/constants/api_endpoints";

import { primaryColor } from "@/constants/colors";
import useLocation from "@/hooks/useLocation";
import {
  AUTH_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  IS_WELCOMED,
  USER_DETAILS,
} from "@/constants/storage_keys";
import BasePage from "../base/base_page";
import PrimaryText from "../PrimaryText";
import { t } from "i18next";
import { useToast } from "@/context/ToastContext";
import { Fontisto } from "@expo/vector-icons";

const CustomDrawerContent = (props: any) => {
  const { logout } = useAuth();
  const { clearAllData } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} scrollEnabled={false}>
        <BasePage>
          <View className="px-3 py-1">
            <Image
              source={require("../../assets/images/splash.png")}
              className="w-full h-32"
            />
          </View>
          {/* <DrawerItemList {...props} /> */}
          <DrawerItem
            label={t("Home")}
            icon={({ color, size }) => (
              <AntDesign name="home" size={size} color={primaryColor} />
            )}
            onPress={() => {
              router.back();
            }}
          />
          <DrawerItem
            label={t("change PIN")}
            icon={({ color, size }) => (
              <AntDesign name="lock1" size={size} color={primaryColor} />
            )}
            onPress={() => router.push("/change_password")}
          />

          <DrawerItem
            label={t("Attendance")}
            icon={({ color, size }) => (
              <AntDesign name="clockcircleo" size={size} color={primaryColor} />
            )}
            onPress={() => router.push("/checkIn_out/checkIn_out_list")}
          />

          <DrawerItem
            label={t("Leave")}
            icon={({ color, size }) => (
              <Fontisto name="holiday-village" size={24} color={primaryColor} />
            )}
            onPress={() => router.push("/leave/leave_history/list/[userRole]")}
          />



          {/* <DrawerItem
          label={t("Rate Us")}
          onPress={() => {
            router.push("/settings/rate_us/[ticketId]");
          }}
        /> */}
        </BasePage>
      </DrawerContentScrollView>
      <View className="mb-2">
        <View className="p-6">
          <Pressable
            onPress={async () => {
              if (logout) {
                // await clearStorage();
                clearAllData();
                logout();
              } else {
                // await clearStorage();
                await removeItem(AUTH_TOKEN_KEY);
                await removeItem(REFRESH_TOKEN_KEY);
                await removeItem(IS_WELCOMED);
                await removeItem(USER_DETAILS);
                clearAllData();
               router.push('/(auth)/login');
              }
            }}
          >
            {/* <View className="flex flex-row">
              <Text className="text-primary-950 font-bold-1 text-md ">
                Logout
              </Text>
              <AntDesign
                name="logout"
                size={16}
                color={primaryColor}
                className="ms-2"
              />
            </View> */}
          </Pressable>
        </View>

        <View className="p-6 bg-slate-50">
          <Pressable
            onPress={async () => {
              if (logout) {
                // await clearStorage();
                clearAllData();
                logout();
              } else {
                // await clearStorage();
                await removeItem(AUTH_TOKEN_KEY);
                await removeItem(REFRESH_TOKEN_KEY);
                await removeItem(IS_WELCOMED);
                await removeItem(USER_DETAILS);
                clearAllData();
                router.replace("/login");
              }
            }}
          >
            <View className="flex flex-row">
              <PrimaryText className="text-primary-950 font-bold-1 text-md ">
                Logout
              </PrimaryText>
              <AntDesign
                name="logout"
                size={16}
                color={primaryColor}
                className="ms-2"
              />
            </View>
          </Pressable>
        </View>
        {/* {Platform.OS === "ios" && (
          <View className="px-6 mb-4 mt-4">
            <Pressable
              onPress={async () => {
                Alert.alert(
                  "Delete Account",
                  "Are you sure you want to delete your account?",
                  [
                    {
                      text: "Cancel",
                      onPress: () => console.log("Cancel Pressed"),
                    },
                    {
                      text: "OK",
                      onPress: () => {
                        api
                          .delete(DELETE_CUSTOMER)
                          .then(async (response) => {
                            showToast({
                              position: "top",
                              type: "success",
                              message: "accountDeletedSuccessfully",
                            });

                            if (logout) {
                              await clearStorage();
                              logout();
                            } else {
                              await clearStorage();
                              router.replace("/(auth)/login");
                            }
                          })
                          .catch((e) => {
                            console.error(e.response.data);

                            router.back();

                            showToast({
                              position: "top",
                              type: "error",
                              message:
                                "failedToDeleteYourAccountPleaseTryAgain",
                            });
                          });
                      },
                    },
                  ],
                  { cancelable: true }
                );
              }}
            >
              <View className="flex flex-row mb-4">
                <PrimaryText className="text-red-400  text-md ">
                  deleteAccount
                </PrimaryText>
                <AntDesign
                  name="delete"
                  size={16}
                  color="#f87171"
                  className="ms-2"
                />
              </View>
            </Pressable>
          </View>
        )} */}
        {/* <View className="pb-6 pt-4 px-6">
          <TouchableOpacity
            onPress={async () => {
              await removeItem(AUTH_TOKEN_KEY);
              await removeItem(REFRESH_TOKEN_KEY);
              router.replace("/(auth)/login");
            }}
          >
            <View className="flex flex-row">
              <Text className="text-red-600 text-md  font-regular">Delete Accout</Text>
              <Icon name="delete" size={16} color="#dc2626" className="ms-2" />
            </View>
          </TouchableOpacity>
        </View> */}
      </View>
    </View>
  );
};

export default CustomDrawerContent;
