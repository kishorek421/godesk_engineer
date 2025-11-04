import { View, Text, Pressable, Platform, Modal } from "react-native";
import React, { useEffect, useState } from "react";
import BasePage from "../base/base_page";
import { CheckInOutStatusDetailsModel } from "@/models/users";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import CheckInStatusComponent from "./CheckInStatusComponent";

interface CheckInListItemLayoutProps {
  data: CheckInOutStatusDetailsModel;
}
const CheckInListItemLayout = ({ data }: CheckInListItemLayoutProps) => {
  const formatTime = (time?: string) => {
    if (!time) return "-";
    return time.split(".")[0];
  };
  return (
    <BasePage>
      <View className=" bg-white py-1 p-4 rounded-sm mt-2">
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/checkIn_out/checkIn/[checkIn]",
              params: { checkInId: data.id as string },
            })
          }
        >
        <View className="flex px-4 py-2">
          <View className="w-full">
            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-2">
                <Text className="text-gray-500 text-md">Name</Text>
                <Text className="mt-[2px] font-semibold text-gray-900 text-md">
                  {data.employeeDetails?.employeeName ?? "-"}
                </Text>
              </View>
              <View className="flex-1 items-end pl-2">
                <Text className="text-gray-500 text-md">Date</Text>
                <Text className="mt-[2px] font-semibold text-gray-900 text-md">
                  {data.date ?? "-"}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center mt-3">
              <View className="flex-1">
                <Text className="text-gray-500 text-md">Checked In</Text>
                <Text className="mt-[2px] font-semibold text-gray-900 text-md">
                  {formatTime(data.check_in)}
                </Text>
              </View>

              {data.check_out && (
                <View className="items-center ml-3">
                  <View className="w-full border-t border-gray-500 my-1 -mx-2" />
                  <View className="flex-row items-center my-1">

                    <Text className="font-semibold text-gray-900 text-md">
                      {formatTime(data.total_hours)} hrs
                    </Text>
                  </View>
                  <View className="w-full border-t border-gray-500 my-1 -mx-2" />
                </View>
              )}
              <View className="flex-1 items-end">
                <Text className="text-gray-500 text-md">Checked Out</Text>
                <Text className="mt-[2px] font-semibold text-gray-900 text-md">
                  {formatTime(data.check_out)}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between mt-3 mb-2">
              <View className="flex-1">
                <Text className="text-gray-500 text-md">Checked In Pincode</Text>
                <Text className="mt-[2px] font-semibold text-gray-900 text-md">
                  {data.checkInPincodeDetail?.pincode ?? "-"}
                </Text>
              </View>
              <View className="flex-1 items-end">
                <Text className="text-gray-500 text-md">Checked Out Pincode</Text>
                <Text className="mt-[2px] font-semibold text-gray-900 text-md">
                  {data.checkOutPincodeDetail?.pincode ?? "-"}
                </Text>
              </View>
            </View>        
            <CheckInStatusComponent
              statusKey={data.configurationDetails?.key}
              statusValue={data.configurationDetails?.value}
            />
          </View>
        </View>
        </Pressable>
      </View>
    </BasePage>
  );
};

export default CheckInListItemLayout;
