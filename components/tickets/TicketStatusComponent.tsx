import { View, Text } from "react-native";
import React from "react";
import {
  ESCALATED,
  RAISED,
  IN_PROGRESS,
  TICKET_CLOSED,
  ASSIGNED,
} from "@/constants/configuration_keys";

const TicketStatusComponent = ({
  statusKey,
  statusValue,
}: {
  statusKey?: string;
  statusValue?: string;
}) => {
  const getStatusColor = (statusKey?: string): string => {
    switch (statusKey) {
      case ESCALATED:
        return "text-red-500 bg-red-100";
      case RAISED:
        console.log("statusKey", statusKey);
        return "text-blue-500 bg-blue-100";
      case IN_PROGRESS:
        return "text-secondary-950 bg-secondary-100";
      case TICKET_CLOSED:
        return "text-primary-950 bg-primary-100";
      case ASSIGNED:
        return "text-[#040042] bg-[#d2cfff]";
      default:
        return "text-gray-600 bg-gray-200";
    }
  };
  return (
    <View className={`py-2 px-4 rounded-lg ${getStatusColor(statusKey)}`}>
      <Text className={`${getStatusColor(statusKey)}`}>
        {statusValue ?? "-"}
      </Text>
    </View>
  );
};
export default TicketStatusComponent;
