import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { TicketListItemModel } from "@/models/tickets";
import TicketStatusComponent from "./TicketStatusComponent";
import { router } from "expo-router";
import moment from "moment";
import React from "react";

const TicketListItemLayout = ({
  ticketModel,
  cn = "",
}: {
  ticketModel: TicketListItemModel;
  cn?: string;
}) => {
  return (
    <Pressable
      onPress={() => {
        router.push({
          pathname: "/ticket_details/[ticketId]",
          params: {
            ticketId: ticketModel.id ?? "",
          },
        });
      }}
      className={`${cn} px-4`}
    >
      <View className="w-full bg-white px-3 py-3 rounded-lg">
        <View className="flex">
          <View className="flex-row justify-between w-full">
            <View>
              <Text className="text-gray-900 font-bold">
                {ticketModel?.ticketNo ?? "-"}
              </Text>
              <Text className="text-gray-500 text-[13px] mt-[1px]">
                Issue in {ticketModel.issueTypeDetails?.name ?? "-"}
              </Text>
            </View>
            <TicketStatusComponent
              statusKey={ticketModel.statusDetails?.key}
              statusValue={ticketModel.statusDetails?.value}
            />
          </View>
          <View className="border-dashed border-[1px] border-gray-300 h-[1px] mt-3 mb-3 w-full" />
          <View className="w-full">
            <View className="flex-row items-center justify-between">
              <View className="flex">
                <Text className="text-gray-500 text-md ">Raised by</Text>
                <Text className="text-md text-gray-900 font-semibold mt-[2px]">
                  {ticketModel?.customerDetails?.firstName ?? ""}{" "}
                  {ticketModel?.customerDetails?.lastName ?? ""}
                </Text>
              </View>
              <View className="flex items-end">
                <Text className="text-gray-500 text-md ">Raised At</Text>
                <Text className="text-md text-gray-900 font-semibold mt-[2px]">
                  {ticketModel.createdAt
                    ? moment(Number.parseInt(ticketModel.createdAt)).fromNow()
                    : "-"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default TicketListItemLayout;
