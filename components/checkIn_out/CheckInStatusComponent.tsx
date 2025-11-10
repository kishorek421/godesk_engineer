import { View, Text } from "react-native";
import React from "react";

const CheckInStatusComponent = ({
  statusKey,
  statusValue,
}: {
  statusKey?: string;
  statusValue?: string;
}) => {
  const getStatusColor = (statusKey?: string): string => {
    switch (statusKey) {
      case  "System Checked Out":
        return "text-red-500 bg-red-100";
      case "Checked In":
        return "text-blue-500 bg-blue-100";
      case  "Checked Out":
        return "text-primary-950 bg-primary-100";
      default:
        return "text-gray-600 bg-gray-200";
    }
  };
 
  return (
    
    <View className={`py-2 px-4 rounded-lg ${getStatusColor(statusValue)}`}>
      <Text className={`${getStatusColor(statusValue)} font-regular`}>
        {statusValue ?? "-"}
      </Text>
    </View>
   
  );
};

export default CheckInStatusComponent;