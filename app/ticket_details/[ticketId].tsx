import {  Pressable, ScrollView, Text, TouchableOpacity, View, Image } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { TicketListItemModel } from "@/models/tickets";
import api from "@/services/api/base_api_service";
import { GET_CONFIGURATIONS_BY_CATEGORY, GET_TICKET_DETAILS } from "@/constants/api_endpoints";
import LoadingBar from "@/components/LoadingBar";
import { VStack } from "@/components/ui/vstack";
import { Card } from "@/components/ui/card";
import TicketStatusComponent from "@/components/tickets/TicketStatusComponent";
import { getTicketDetails } from "@/services/api/tickets_api_service";
import { Button, ButtonText } from "@/components/ui/button";
import BottomSheet from "@/components/BottomSheet";
import { Input, InputField } from "@/components/ui/input";
import { FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorText } from "@/components/ui/form-control";
import { isFormFieldInValid } from "@/utils/helper";
import { ConfigurationModel } from "@/models/configurations";
import ConfigurationSelect from "@/components/ConfigurationSelect";
import { TICKET_STATUS } from "@/constants/configuration_keys";
import moment from "moment";

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
      getTicketDetails((ticketId ?? "") as string).then((response) => {
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
                  <Pressable
                    onPress={() => {
                      router.push({
                        pathname: "/image_viewer/[uri]",
                        params: {
                          uri: uri,
                        },
                      });
                    }}
                  >
                    <Image
                      source={{ uri: uri }}
                      className="w-24 h-24 rounded-xl mt-2"
                    />
                  </Pressable>
                ))
              ) : (
                <Text>-</Text>
              )}
            </View>
            <View className="w-full mt-3">
              <View>
                <Text className="text-gray-500 text-md ">Assinged To</Text>
                <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                  {ticketModel?.lastAssignedToDetails?.firstName ??
                    "-" + (ticketModel?.lastAssignedToDetails?.lastName ?? "")}
                </Text>
              </View>
            </View>
            <View className="w-full mt-3">
              <View>
                <Text className="text-gray-500 text-md ">Assinged At</Text>
                <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                  {ticketModel.lastAssignedToDetails?.assignedAt
                    ? moment(
                        ticketModel.lastAssignedToDetails?.assignedAt,
                      ).fromNow()
                    : "-"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
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
