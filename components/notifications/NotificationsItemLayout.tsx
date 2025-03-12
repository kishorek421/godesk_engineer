import { View, Text, Pressable } from "react-native";
import React from "react";
import { NotificationItemModel } from "@/models/notifications";
import { primaryColor } from "@/constants/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import moment from "moment";
import Fontisto from "@expo/vector-icons/Fontisto";
import { handleNotificationNavigation } from "@/utils/helper";

interface NotificationsItemLayoutProps {
  item: NotificationItemModel;

}

const NotificationsItemLayout = ({ item }: NotificationsItemLayoutProps) => {
  const getIcon = (type?: string) => {
    switch (type) {
      case "TICKET":
        return (
          <Ionicons name="ticket-outline" size={20} color={primaryColor} />
        );
      case "LEAVE_REQUEST":
        return (
          <Fontisto name="holiday-village" size={24} color={primaryColor} />
        );
      default:
        return (
          <Ionicons
            name="notifications-outline"
            size={20}
            color={primaryColor}
          />
        );
    }
  };

  return (
    <Pressable
      onPress={() => {
        console.log("item -> ", item);
        handleNotificationNavigation({ data: item });
      }}
    >
      <View className="mb-4 bg-white w-full rounded-lg p-3 flex justify-evenly items-start gap">
        <View className="flex-row gap-3">
          <View className=" w-10 h-10 p-1 bg-primary-100 rounded-full flex justify-center items-center ">
            {getIcon(item.type)}
          </View>
          <View className="flex flex-1">
            <Text className="font-semibold h-6">{item.title ?? "-"}</Text>
            <Text className="text-gray-500 text-sm font-regular">
              {item.createdAt ? moment(item.createdAt).fromNow() : ""}
            </Text>
          </View>
        </View>
        <View className="px-4 py-2 mt-2 border-gray-200 border-[1px] rounded-md w-full">
          <Text className="text-gray-900 font-medium text-md">{item.message ?? "-"}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export default NotificationsItemLayout;
