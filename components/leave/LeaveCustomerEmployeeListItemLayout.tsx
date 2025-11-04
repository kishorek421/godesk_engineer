import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { router } from "expo-router";
import { LeaveRequestModel } from "@/models/leave";
import moment from "moment";
import Feather from "@expo/vector-icons/Feather";

import LeaveStatusComponent from "./LeaveStatusComponent";
import PrimaryText from "@/components/PrimaryText";
import BasePage from "../base/base_page";

interface LeaveListItemLayoutProps {
  data: LeaveRequestModel;
  userId: string;
  roleCode: string;
}

const LeaveCustomerEmployeeListItemLayout = ({
  data,
  userId,
  roleCode,
}: LeaveListItemLayoutProps) => {

  return (
    <BasePage>
      <View className="px-4 py-2">
        <View className="bg-white shadow-sm px-3 py-3 rounded-lg w-full">
          <Pressable
            onPress={() =>
              router.push({
                pathname:
                  "/leave/leave_history/details/[leaveId]/[userId]/[roleCode]",
                params: {
                  leaveId: data.id ?? "",
                  userId: userId,
                  roleCode: roleCode,
                },
              })
            }
          >
            <View className="flex gap-4">
              <View className="w-full">
                <View className="flex-row justify-between items-start">
                  <View className="flex-col">
                    <Text className="text-gray-900 text-md font-semibold">
                      {data.employeeDetails?.firstName ?? "-"}{" "}
                      {data.employeeDetails?.lastName ?? "-"}
                    </Text>

                    <View className="mt-1">
                      <Text className="text-gray-500 text-md">Applied For</Text>
                      <Text className="font-regular text-secondary-900 text-md">
                        {data.leaveTypeDetails?.value ?? "-"}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <LeaveStatusComponent
                      statusKey={data.statusDetails?.key}
                      statusValue={data.statusDetails?.value}
                    />
                  </View>

                </View>
              </View>


              <View className="w-full my-2">
                <View className="flex w-full">
                  <View className="flex-row justify-between items-center gap-1">
                    <Text className="text-gray-500 text-md">From</Text>
                    <Text className="text-gray-500 text-md">To</Text>
                  </View>
                  <View className="flex-row justify-between items-center gap-1">
                    <Text className="font-semibold text-primary-950 text-lg">
                      {data.startDate
                        ? moment(data.startDate).format("ddd DD MMM")
                        : "-"}
                    </Text>
                    <View className="flex-1 justify-center items-center px-6 gap-1">
                      <Text className="text-sm text-gray-500">
                        {data.daysCount ?? 0} days
                      </Text>
                      <View className="w-full bg-gray-400 bg-opacity-10 h-[1px]"></View>
                    </View>
                    <Text className="font-semibold text-primary-950 text-lg">
                      {data.endDate
                        ? moment(data.endDate).format("ddd DD MMM")
                        : "-"}
                    </Text>
                  </View>
                </View>
              </View>
              {/* <View className="border-[.5px] border-gray-300 mt-1 mb-3 w-full h-[1px]" /> */}
              {/* <View className="w-full">
              <View className="flex-row justify-between items-center">
                <View className="flex">
                  <Text className="text-gray-500 text-md">From Date</Text>
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
            </View> */}
              <View className="flex gap-1 w-full">
                <Text className="text-gray-500 text-md">Reason</Text>
                {/* <Text className="text-gray-500 text-md">Applied For</Text> */}

                <Text className="font-semibold text-gray-900 text-md">
                  {data.reason ?? ""}
                </Text>
              </View>
              {/* <View className="border-[.5px] border-gray-300  w-full h-[1px]" />
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
                    {data.approvedBy?.name ?? "-"}
                  </Text>
                </View>
              </View>
            </View> */}
            </View>
          </Pressable>
        </View>
      </View>
    </BasePage>
  );
};

export default LeaveCustomerEmployeeListItemLayout;
