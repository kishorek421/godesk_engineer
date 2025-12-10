import { clearStorage, removeItem } from "@/utils/secure_store";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { router } from "expo-router";
import React from "react";
import { View, Image, Alert, Platform, Pressable } from "react-native";
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
import { SafeAreaView } from "react-native-safe-area-context";
 
const CustomDrawerContent = (props: any) => {
  const { logout } = useAuth();
  const { clearAllData } = useLocation();
  const { showToast } = useToast();
 
  const handleLogout = async () => {
    if (logout) {
      clearAllData();
      logout();
    } else {
      await removeItem(AUTH_TOKEN_KEY);
      await removeItem(REFRESH_TOKEN_KEY);
      await removeItem(IS_WELCOMED);
      await removeItem(USER_DETAILS);
      clearAllData();
      router.replace("/(auth)/login");
    }
  };
 
  return (
    <SafeAreaView
      style={{
        flex: 1,
        zIndex: 99999,
        elevation: 99999,
        backgroundColor: "#fff",
      }}
      edges={["bottom"]}
    >
      <DrawerContentScrollView {...props} scrollEnabled={false}>
        <BasePage>
          <View className="px-3 py-1">
            <Image
              source={require("../../assets/images/splash.png")}
              className="w-full h-32"
            />
          </View>
 
          <DrawerItemList {...props} />
 
          <DrawerItem
            label={t("My Orders")}
            onPress={() => router.push("/settings/my_orders")}
          />
 
          <DrawerItem
            label={t("contactUs")}
            onPress={() => router.push("/settings/contact_us")}
          />
 
          <DrawerItem
            label={t("faqs")}
            onPress={() => router.push("/settings/faq")}
          />
 
          <DrawerItem
            label={t("settings")}
            onPress={() => router.push("/settings/settings")}
          />
        </BasePage>
      </DrawerContentScrollView>
 
      {/* LOGOUT & DELETE SECTION */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          backgroundColor: "#fff",
          zIndex: 99999,
          elevation: 99999,
 
          paddingTop: 14,
          paddingBottom: 34, // <-- FIX: ensures visibility over nav bar
        }}
      >
        {/* Logout Button */}
        <View className="p-6 bg-slate-50">
          <Pressable onPress={handleLogout}>
            <View className="flex flex-row items-center">
              <PrimaryText className="text-primary-950 font-bold-1 text-md ">
                logout
              </PrimaryText>
              <AntDesign
                name="logout"
                size={16}
                color={primaryColor}
                style={{ marginLeft: 6 }}
              />
            </View>
          </Pressable>
        </View>
 
        {/* Delete Account – iOS Only */}
        {Platform.OS === "ios" && (
          <View className="px-6 mt-2">
            <Pressable
              onPress={() => {
                Alert.alert(
                  "Delete Account",
                  "Are you sure you want to delete your account?",
                  [
                    { text: "Cancel" },
                    {
                      text: "OK",
                      onPress: () => {
                        api
                          .delete(DELETE_CUSTOMER)
                          .then(async () => {
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
                          .catch(() => {
                            showToast({
                              position: "top",
                              type: "error",
                              message:
                                "failedToDeleteYourAccountPleaseTryAgain",
                            });
                          });
                      },
                    },
                  ]
                );
              }}
            >
              <View className="flex flex-row mb-4">
                <PrimaryText className="text-red-400 text-md ">
                  deleteAccount
                </PrimaryText>
                <AntDesign
                  name="delete"
                  size={16}
                  color="#f87171"
                  style={{ marginLeft: 6 }}
                />
              </View>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};
 
export default CustomDrawerContent;