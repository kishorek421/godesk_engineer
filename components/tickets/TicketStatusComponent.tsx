import { ESCALATED, RAISED, IN_PROGRESS, TICKET_CLOSED } from "@/constants/configuration_keys";
import { View, Text } from "react-native";


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
        return "color-red-500 bg-red-100";
      case RAISED:
        return "color-blue-500 bg-blue-100";
      case IN_PROGRESS:
        return "color-secondary-950 bg-secondary-100";
      case TICKET_CLOSED:
        return "color-primary-950 bg-primary-100";
      default:
        console.log("statusKey ->", statusKey);
        return "bg-color-white color-gray-900";
    }
  };

  return (
    <View className={`py-2 px-4 rounded ${getStatusColor(statusKey)}`}>
      <Text className={`${getStatusColor(statusKey)}`}>
        {statusValue ?? "-"}
      </Text>
    </View>
  );
};

export default TicketStatusComponent;
