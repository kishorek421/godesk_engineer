import { ScrollView, Text, View, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { TicketListItemModel } from "@/models/tickets";
import api from "@/services/api/base_api_service";
import { GET_TICKET_DETAILS } from "@/constants/api_endpoints";
import LoadingBar from "@/components/LoadingBar";
import TicketStatusComponent from "@/components/tickets/TicketStatusComponent";
import moment from "moment";

const TicketDetails = () => {
  const { ticketId } = useLocalSearchParams();

  const [ticketModel, setTicketModel] = useState<TicketListItemModel>({});

  const [isLoading, setIsLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerLeftContainerStyle: {
        paddingStart: 10,
      },
    });
    console.log("ticketId", ticketId);

    api
      .get(GET_TICKET_DETAILS + `?ticketId=${ticketId}`)
      .then((response) => {
        setIsLoading(false);
        setTicketModel(response.data.data ?? {});
      })
      .catch((e) => {
        console.error(e);
        setIsLoading(false);
      });
  }, [ticketId, navigation]);

  return isLoading ? (
    <LoadingBar />
  ) : (
    <ScrollView>
      <View className="p-4">
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
                  <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                    {ticketModel?.customerDetails?.firstName ?? "-"}{" "}
                    {ticketModel?.customerDetails?.lastName ?? ""}
                  </Text>
                </View>
                <View className="flex items-end">
                  <Text className="text-gray-500 text-md ">Raised At</Text>
                  <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                    {ticketModel.createdAt
                      ? moment(ticketModel.createdAt).fromNow()
                      : "-"}
                  </Text>
                </View>
              </View>
            </View>
            <View className="w-full mt-3">
              <View className="flex-row items-center justify-between">
                <View className="flex">
                  <Text className="text-gray-500 text-md ">Serial No</Text>
                  <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                    {ticketModel?.assetInUseDetails?.serialNo ?? "-"}
                  </Text>
                </View>
                <View className="flex items-end">
                  <Text className="text-gray-500 text-md ">Asset Type</Text>
                  <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                    {ticketModel.assetInUseDetails?.assetMasterDetails
                      ?.assetTypeDetails?.name ?? "-"}
                  </Text>
                </View>
              </View>
            </View>
            <View className="w-full mt-3">
              <Text className="text-gray-500 text-md ">Description</Text>
              <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                {ticketModel?.description ?? "-"}
              </Text>
            </View>
            <View className="w-full mt-3">
              <Text className="text-gray-500 text-md ">Issue Images</Text>
              {(ticketModel.ticketImages ?? []).length > 0 ? (
                ticketModel.ticketImages?.map((uri, index) => (
                  <Image
                    source={{ uri: uri }}
                    className="w-24 h-24 rounded-xl mt-2"
                  />
                ))
              ) : (
                <Text>-</Text>
              )}
            </View>
            <View className="w-full mt-3">
              <View>
                <Text className="text-gray-500 text-md ">
                  Assinged Engineer
                </Text>
                <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                  {ticketModel?.assignedToDetails?.firstName ?? "-"}{" "}
                  {ticketModel?.assignedToDetails?.lastName}
                </Text>
              </View>
            </View>
            <View className="w-full mt-3">
              <View>
                <Text className="text-gray-500 text-md ">Assinged at</Text>
                <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                  {ticketModel?.assignedToDetails?.firstName ?? "-"}{" "}
                  {ticketModel?.assignedToDetails?.lastName}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default TicketDetails;
