import { ESCALATED, RAISED, IN_PROGRESS, TICKET_CLOSED } from "@/constants/configuration_keys";
import { getStatusColor } from "@/utils/helper";
import { View, Text } from "react-native";


const TicketStatusComponent = ({
  statusKey,
  statusValue,
}: {
  statusKey?: string;
  statusValue?: string;
}) => {
  return (
    <View className={`py-2 px-4 rounded ${getStatusColor(statusKey)}`}>
      <Text className={`${getStatusColor(statusKey)}`}>
        {statusValue ?? "-"}
      </Text>
    </View>
  );
};

export default TicketStatusComponent;
