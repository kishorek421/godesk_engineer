import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { TicketListItemModel } from "@/models/tickets";
import api from "@/services/api/base_api_service";
import { GET_CONFIGURATIONS_BY_CATEGORY, GET_TICKET_DETAILS } from "@/constants/api_endpoints";
import LoadingBar from "@/components/LoadingBar";
import { VStack } from "@/components/ui/vstack";
import { Card } from "@/components/ui/card";
import TicketStatusComponent from "@/components/tickets/TicketStatusComponent";
import { getAssignedTicketDetails } from "@/services/api/tickets_api_service";
import { Button, ButtonText } from "@/components/ui/button";
import BottomSheet from "@/components/BottomSheet";
import { Input, InputField } from "@/components/ui/input";
import { FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorText } from "@/components/ui/form-control";
import { isFormFieldInValid } from "@/utils/helper";
import { ConfigurationModel } from "@/models/configurations";
import ConfigurationSelect from "@/components/ConfigurationSelect";
import { TICKET_STATUS } from "@/constants/configuration_keys";

const TicketDetails = () => {
  const { ticketId } = useLocalSearchParams();

  const [ticketModel, setTicketModel] = useState<TicketListItemModel>({});

  const [isLoading, setIsLoading] = useState(true);

  const navigation = useNavigation();

  const bottomSheetRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [errors, setErrors] = useState([]);

  const [selectedTicketStatus, setSelectedTicketStatus] = useState<ConfigurationModel>({});

  const [ticketStatusOptions, setTicketStatusOptions] = useState<ConfigurationModel[]>([]);

  useEffect(() => {
    navigation.setOptions({
      headerLeftContainerStyle: {
        paddingStart: 10,
      },
    });


    if (ticketId) {
      getAssignedTicketDetails((ticketId ?? "") as string).then((response) => {
        setIsLoading(false);
        setTicketModel(response.data.data ?? {});
      })
        .catch((e) => {
          console.error(e);
          setIsLoading(false);
        });
    }

    loadTicketStatus();

  }, [ticketId, navigation]);

  const loadTicketStatus = () => {
    api
      .get(GET_CONFIGURATIONS_BY_CATEGORY, {
        params: {
          category: TICKET_STATUS,
        },
      })
      .then((response) => {
        setTicketStatusOptions(response.data?.data ?? []);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const toggleImagePicker = () => {
    setIsModalVisible(!isModalVisible);
    if (!isModalVisible) {
      bottomSheetRef.current?.show();
    } else {
      bottomSheetRef.current?.hide();
    }
  };

  return isLoading ? (
    <LoadingBar />
  ) : (
    <View>
      <ScrollView>
        <Card className="px-3 py-4 bg-white m-4 mb-8">
          <VStack className="gap-6">
            <View className="flex-row justify-between items-center">
              <VStack>
                <Text>Ticket Id</Text>
                <Text className="color-secondary-950 underline font-bold mt-1">
                  {ticketModel.ticketNo ?? "-"}
                </Text>
              </VStack>
              <Button className="bg-primary-950 rounded-md"
                onPress={toggleImagePicker}
              >
                <ButtonText className="text-white text-sm">Update Status</ButtonText>
              </Button>
            </View>
            <VStack>
              <Text className="mb-1">Ticket Status</Text>
              <TicketStatusComponent
                statusKey={ticketModel.statusDetails?.key}
                statusValue={ticketModel.statusDetails?.value}
              />
            </VStack>
            <VStack>
              <Text>Asset Id</Text>
              <Text className=" font-medium color-gray-600 mt-1">
                {ticketModel.assetInUseDetails?.assetMasterDetails?.serialNo ??
                  "-"}
              </Text>
            </VStack>
            <VStack>
              <Text>Asset Type</Text>
              <Text className=" font-medium color-gray-600 mt-1">
                {ticketModel.assetInUseDetails?.assetMasterDetails
                  ?.assetTypeDetails?.name ?? "-"}
              </Text>
            </VStack>
            <VStack>
              <Text>Issue Type</Text>
              <Text className=" font-medium color-gray-600 mt-1">
                {ticketModel.issueTypeDetails?.value ?? "-"}
              </Text>
            </VStack>
            <VStack>
              <Text>Description</Text>
              <Text className=" font-medium color-gray-600 mt-1">
                {ticketModel.description ?? "-"}
              </Text>
            </VStack>
          </VStack>
        </Card>
      </ScrollView>
      <BottomSheet initialHeight={300} ref={bottomSheetRef}>
        <View className="p-4">
          <Text className="font-bold text-xl">Update Ticket Status</Text>
          <FormControl
                  isInvalid={isFormFieldInValid("ticketStatus", errors).length > 0}
                  className="mt-4"
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>
                      Status to
                    </FormControlLabelText>
                  </FormControlLabel>
                  <ConfigurationSelect
                    options={ticketStatusOptions}
                    selectedConfig={selectedTicketStatus}
                    setSelectedConfig={setSelectedTicketStatus}
                    placeholder="Select status"
                  />
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("ticketStatus", errors)}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
          <FormControl
            isInvalid={isFormFieldInValid("otp", errors).length > 0}
            className="mt-4"
          >
            <FormControlLabel className="mb-1">
              <FormControlLabelText>Customer OTP</FormControlLabelText>
            </FormControlLabel>
            <Input
              variant="outline"
              size="md"
              isDisabled={false}
              isInvalid={false}
              isReadOnly={false}

            >
              <InputField
                placeholder="Enter customer otp"
                className='py-2'
                onChangeText={(e) => {
                  // setEmail(e);
                }}
              />
            </Input>
            <FormControlError>
              <FormControlErrorText>
                {isFormFieldInValid("otp", errors)}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
          <Button className="bg-primary-950 rounded-md mt-4"
                onPress={toggleImagePicker}
              >
                <ButtonText className="text-white text-sm">Update Status</ButtonText>
              </Button>
        </View>
      </BottomSheet>
    </View>
  );
};

export default TicketDetails;
