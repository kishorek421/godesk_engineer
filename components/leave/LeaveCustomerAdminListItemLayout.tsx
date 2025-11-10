import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { router } from "expo-router";
import { LeaveRequestModel } from "@/models/leave";
import moment from "moment";
import Feather from "@expo/vector-icons/Feather";

import LeaveStatusComponent from "./LeaveStatusComponent";
import PrimaryText from "@/components/PrimaryText";

interface LeaveListItemLayoutProps {
  data: LeaveRequestModel;
}

const LeaveCustomerAdminListItemLayout = ({ data }: LeaveListItemLayoutProps) => {

  return (
    
    <View className="px-4 py-2">
      <View className="bg-white shadow-sm px-3 py-3 rounded-lg w-full">
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/leave/leave_history/details/[leaveId]/[userId]/[roleCode]",
              params: {
                leaveId: data.id ?? "",
                
              },
            })
          }
        >
          <View className="flex">
            <View className="w-full">
              <View className="flex-row justify-between items-center">
                <View className="flex">
  <Text className="text-gray-500 text-md">Employee Name</Text>
  <Text className="font-semibold text-gray-900 text-md">
                    {(data.employeeDetails?.firstName?? "-") +
                    (data.employeeDetails?.lastName?? "")}
                  </Text>
                </View>
                <View className="flex items-end">
                  <LeaveStatusComponent
                    statusKey={data.statusDetails?.key}
                    statusValue={data.statusDetails?.value}
                  />
                </View>
              </View>
            </View>
            <View className="w-full">
              <View className="flex-row justify-between items-center">
                <View className="flex">
  <Text className="text-gray-500 text-md">Leave Type</Text>
  <Text className="font-semibold text-gray-900 text-md">
                  {data.leaveTypeDetails?.value ?? "-"}
                  </Text>
                </View>
                
              </View>
            </View>
            <View className="border-[.5px] border-gray-300 mt-1 mb-3 w-full h-[1px]" />
            <View className="w-full mt-1">
              <View className="flex-row justify-between items-center">
                <View className="flex">
  <Text className="text-gray-500 text-md">Start Date</Text>
  <Text className="font-semibold text-gray-900 text-md">
                    {data.startDate ?? "-"}
                  </Text>
                </View>
                <View className="flex items-end">
  <Text className="text-gray-500 text-md">End Date</Text>
  <Text className="font-semibold text-gray-900 text-md">
                    {data.endDate ?? "-"}
                  </Text>
                </View>
              </View>
            </View>
            <View className="border-[.5px] border-gray-300 mt-1 mb-3 w-full h-[1px]" />
            <View className="w-full">
              <View className="flex-row justify-between items-center">
                <View className="flex">
  <Text className="text-gray-500 text-md">Days Count</Text>
  <Text className="font-semibold text-gray-900 text-md">
                    {data.daysCount ?? "-"}
                  </Text>
                </View>
                <View className="flex  items-end">
  <Text className="text-gray-500 text-md">Approved By</Text>
  <Text className="mt-[2px] font-semibold text-gray-900 text-md">
                    {(data.approvedBy?.name ?? "- ") }
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </View>
    </View>
   
  );
};

export default LeaveCustomerAdminListItemLayout;
