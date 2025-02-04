import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { TicketListItemModel } from "@/models/tickets";
import TicketStatusComponent from "./TicketStatusComponent";
import { router } from "expo-router";
import moment from "moment";
import Entypo from "@expo/vector-icons/Entypo";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
const TicketListItemLayout = ({
  ticketModel,
  cn = "",
}: {
  ticketModel: TicketListItemModel;
  cn?: string;
}) => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  //  const { refreshFlag, setRefreshFlag } = useRefresh();
  const [refreshing, setRefreshing] = useState(true);
  const getHelpText = (statusKey?: string): string => {
    switch (statusKey) {
      case "WORK_COMPLETED":
        return "Once payment is done, you’ll close the ticket.";
      default:
        return "";
    }
  };

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
          <View className="flex-row justify-between w-full items-center">
            <View>
              <Text className="text-tertiary-950 font-bold-1 leading-5">
                {ticketModel?.ticketNo ?? "-"}
              </Text>
              <Text className="text-gray-800 font-bold text-[13px]">
                Issue In {ticketModel.issueTypeDetails?.name ?? "-"}
              </Text>
            </View>
            <View>
              <TicketStatusComponent
                statusKey={ticketModel.statusDetails?.key}
                statusValue={ticketModel.statusDetails?.value}
              />
            </View>
          </View>
          <View className="border-dashed border-[1px] border-gray-300 h-[1px] mt-3 mb-3 w-full" />
          <View className="w-full">
            <View className="flex-row items-center justify-between">
              <View className="flex">
                <Text className="text-gray-500 text-md font-regular">
                  {t("raisedBy")}
                </Text>
                <Text className="text-md text-gray-900 font-semibold mt-[2px] leading-5">
                  {ticketModel?.customerDetails?.firstName ?? ""}{" "}
                  {ticketModel?.customerDetails?.lastName ?? ""}
                </Text>
              </View>
              <View className="flex items-end">
                <Text className="text-gray-500 text-md font-regular ">
                  {t("raisedAt")}
                </Text>
                <Text className="text-md text-gray-900 font-semibold mt-[2px] leading-5">
                  {ticketModel.createdAt
                    ? moment(Number.parseInt(ticketModel.createdAt)).format(
                        "DD-MM-YYYY hh:mm a"
                      )
                    : "-"}
                </Text>
              </View>
            </View>
          </View>
        </View>
        {["Work Completed"].includes(
          ticketModel.statusDetails?.value ?? ""
        ) && (
          <>
            <View className="border-dashed border-[1px] border-gray-300 h-[1px] mt-3 mb-3 w-full" />
            <View className=" py-1 flex-row justify-start items-center ">
              <Entypo name="bell" size={16} color="#eab308" />
              <Text className="text-yellow-500 text-sm font-regular ms-1">
                {getHelpText(ticketModel.statusDetails?.key)}
              </Text>
            </View>
          </>
        )}
      </View>
    </Pressable>
  );
};

export default TicketListItemLayout;
