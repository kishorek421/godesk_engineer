import { View, Text } from "react-native";
import React from "react";
import {
  RAISED,
  REJECTED,
  APPROVED,
} from "@/constants/configuration_keys";
import PrimaryText from "@/components/PrimaryText";

const LeaveStatusComponent = ({
  statusKey,
  statusValue,
}: {
  statusKey?: string;
  statusValue?: string;
}) => {
  const getStatusColor = (statusKey?: string): string => {
    switch (statusKey) {
      case REJECTED:
        return "text-red-500 bg-red-100";
      case RAISED:
        // console.log("statusKey", statusKey);
        return "text-blue-500 bg-blue-100";
      case APPROVED:
        return "text-primary-950 bg-primary-100";
      default:
        return "text-gray-600 bg-gray-200";
    }
  };
  return (
    
    <View className={`py-2 px-4 rounded-lg ${getStatusColor(statusKey)}`}>
      <Text className={`${getStatusColor(statusKey)} font-regular`}>
        {statusValue ?? "-"}
      </Text>
    </View>
   
  );
};

export default LeaveStatusComponent;