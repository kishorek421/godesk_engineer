import { Text, TouchableOpacity, View } from "react-native";
import { Card } from "@/components/ui/card";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Divider } from "@/components/ui/divider";
import Icon from "@expo/vector-icons/AntDesign";
import moment from "moment";
import { router } from "expo-router";
import { TicketListItemModel } from "@/models/tickets";
import TicketStatusComponent from "./TicketStatusComponent";

const TicketListItemLayout = ({
  ticketModel,
  cn = "",
}: {
  ticketModel: TicketListItemModel;
  cn?: string;
}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "/ticket_details/[ticketId]",
          params: {
            ticketId: ticketModel.id ?? "",
          },
        });
      }}
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
                <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                  {ticketModel?.customerDetails?.firstName ?? "-"}{" "}
                  {ticketModel?.customerDetails?.lastName ?? ""}
                </Text>
              </View>
              {/* <Image
              source={{
                uri: "https://images.unsplash.com/photo-1445053023192-8d45cb66099d?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              }}
              width={30}
              height={30}
              className="rounded-full"
            /> */}
              {/* <View className="text-gray-500 bg-gray-200 p-1 rounded-full">
              <AntDesign name="arrowright" size={18} color="#6b7280" />
            </View> */}
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
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TicketListItemLayout;
