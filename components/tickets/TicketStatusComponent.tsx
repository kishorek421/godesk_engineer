import { View, Text } from "react-native";
import React,{ useEffect ,useState} from "react";
import {
ESCALATED,
  RAISED,
  IN_PROGRESS,
  TICKET_OPENED,
  TICKET_CLOSED,
  TICKET_ASSIGNED,
  TICKET_WORK_COMPLETED,
  OPENED,
  TICKET_PAID,
  TICKET_CUSTOMER_NOT_AVAILABLE,
} from "@/constants/configuration_keys";
import PrimaryText from "../PrimaryText";
import AsyncStorage from '@react-native-async-storage/async-storage';
import BasePage from "../base/base_page";
const TicketStatusComponent = ({
  statusKey,
  statusValue,
}: {
  statusKey?: string;
  statusValue?: string;
}) => {
 
const [selectedLanguage, setSelectedLanguage] = useState('en');

 const getStatusColor = (statusKey?: string): string => {
    switch (statusKey) {
      case ESCALATED:
        return "text-red-500 bg-red-100";
      case RAISED:
        // console.log("statusKey", statusKey);
        return "text-blue-500 bg-blue-100";
      case IN_PROGRESS:
        return "text-secondary-950 bg-secondary-100";
      case TICKET_CLOSED:
        return "text-primary-950 bg-primary-100";
      case TICKET_WORK_COMPLETED:
        return "text-blue-950 bg-[#c8d4ff]";
      case TICKET_ASSIGNED:
        return "text-[#040042] bg-[#d2cfff]";
      case "Assigned":
        return "text-[#040042] bg-[#d2cfff]";
      case TICKET_PAID:
        return "text-green-750 bg-[#DCE4C9]";
      case TICKET_CUSTOMER_NOT_AVAILABLE:
        return "text-[#C63C51] bg-[#EFB6C8]";
      case TICKET_OPENED:
        return "text-[#FF9D3D] bg-[#FFECC8]";
      case OPENED:
        return "text-[#FF9D3D] bg-[#FFECC8]";
      default:
        return "text-gray-600 bg-gray-200";
    }
  };
  return (
    <BasePage>
    <View className={`py-2 px-4 rounded-lg ${getStatusColor(statusKey)}`}>
      <PrimaryText className={`${getStatusColor(statusKey)} font-regular text-md`}>
        {statusValue ?? "-"}
      </PrimaryText>
    </View>
    </BasePage>
  );
};
export default TicketStatusComponent;
