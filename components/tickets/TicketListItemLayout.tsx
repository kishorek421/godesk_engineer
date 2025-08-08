import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { TicketListItemModel } from "@/models/tickets";
import TicketStatusComponent from "./TicketStatusComponent";
import { router } from "expo-router";
import moment from "moment";
import Entypo from "@expo/vector-icons/Entypo";
import React, { useEffect, useState } from "react";
import PrimaryText from "../PrimaryText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BasePage from "../base/base_page";
import { t } from "i18next";
import { TouchableWithoutFeedback } from "react-native";
const TicketListItemLayout = ({
  ticketModel,
  cn = "",
}: {
  ticketModel: TicketListItemModel;
  cn?: string;
}) => {

  //  const { refreshFlag, setRefreshFlag } = useRefresh();

  const [refreshing, setRefreshing] = useState(true);
    const [expanded, setExpanded] = useState(false);
  const getHelpText = (statusKey?: string): string => {
    switch (statusKey) {
      case "WORK_COMPLETED":
        return "workcompletedmessage";
      default:
        return "";
    }
  };

  return (
    <BasePage>
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
              <View className="flex-1">
                <PrimaryText className="text-tertiary-950 font-bold-1 leading-5">
                  {ticketModel?.ticketNo ?? "-"}
                </PrimaryText>
                  <TouchableWithoutFeedback onPress={() => setExpanded(!expanded)}>
                    <PrimaryText
                      className="mt-[1px] text-[13px] text-gray-900 font-regular"
                      translate="api"
                      numberOfLines={expanded ? undefined : 4}
                      ellipsizeMode="tail"
                    >
                      {`${t('issueIn')}: ${Array.isArray(ticketModel.issueTypeDetails) && ticketModel.issueTypeDetails.length > 0
                        ? ticketModel.issueTypeDetails.map((item) => item?.name).filter(Boolean).join(', ')
                        : "-"
                        }`}
                    </PrimaryText>
                  </TouchableWithoutFeedback>
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
                  <PrimaryText className="text-gray-500 text-md font-regular">
                    raisedBy
                  </PrimaryText>
                  <PrimaryText className="text-md text-gray-900 font-semibold mt-[2px] leading-5">
                    {ticketModel?.customerDetails?.firstName ?? ""}{" "}
                    {ticketModel?.customerDetails?.lastName ?? ""}
                  </PrimaryText>
                </View>
                <View className="flex items-end">
                  <PrimaryText className="text-gray-500 text-md font-regular ">
                    raisedAt
                  </PrimaryText>
                  <PrimaryText className="text-md text-gray-900 font-semibold mt-[2px] leading-5">
                    {ticketModel.createdAt
                      ? moment(Number.parseInt(ticketModel.createdAt)).format(
                        "DD-MM-YYYY hh:mm a"
                      )
                      : "-"}
                  </PrimaryText>
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
                  <PrimaryText className="text-secondary-950 text-sm font-regular ms-1">
                    {getHelpText(ticketModel.statusDetails?.key)}
                  </PrimaryText>
                </View>
              </>
            )}
        </View>
      </Pressable>
    </BasePage>
  );
};

export default TicketListItemLayout;
