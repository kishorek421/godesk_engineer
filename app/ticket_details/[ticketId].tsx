import { Pressable, ScrollView, Text, TouchableOpacity, View, Image } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { TicketListItemModel } from "@/models/tickets";
import api from "@/services/api/base_api_service";
import { GET_CONFIGURATIONS_BY_CATEGORY, GET_TICKET_DETAILS, UPDATE_TICKET_STATUS } from "@/constants/api_endpoints";
import LoadingBar from "@/components/LoadingBar";
import { VStack } from "@/components/ui/vstack";
import { Card } from "@/components/ui/card";
import TicketStatusComponent from "@/components/tickets/TicketStatusComponent";
import { getTicketLists } from "@/services/api/tickets_api_service";
import { Button, ButtonText } from "@/components/ui/button";
import BottomSheet from "@/components/BottomSheet";
import { Input, InputField } from "@/components/ui/input";
import { FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorText } from "@/components/ui/form-control";
import { isFormFieldInValid } from "@/utils/helper";
import { ConfigurationModel } from "@/models/configurations";
import ConfigurationSelect from "@/components/ConfigurationSelect";
import { TICKET_STATUS } from "@/constants/configuration_keys";
import moment from "moment";
import CustomDropdown from '../../components/DropDown';
import { ErrorModel } from "@/models/common";
interface BottomSheetRef {
  show: () => void;
  hide: () => void;
}

const TicketDetails = () => {
  const { ticketId } = useLocalSearchParams();
  const [ticketModel, setTicketModel] = useState<TicketListItemModel>({});
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  const [errors, setErrors] = useState<ErrorModel[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedTicketStatus, setSelectedTicketStatus] = useState<ConfigurationModel>({});
  const [ticketStatusOptionsState, setTicketStatusOptions] = useState<ConfigurationModel[]>(ticketStatusOptions);
  useEffect(() => {
    navigation.setOptions({
      headerLeftContainerStyle: {
        paddingStart: 10,
      },
    });

    if (typeof ticketId === "string") {

      api
        .get(GET_TICKET_DETAILS + `?ticketId=${ticketId}`)
        .then((response) => {
          setIsLoading(false);
          const ticketData = response.data.data ?? {};
          setTicketModel(ticketData);

          // Generate OTP if ticket is assigned
          if (ticketData.statusDetails?.value === "Assigned") {
            generateOtp(ticketId);
          }
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

  const generateOtp = (ticketId: string) => {
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // Generates a random 6-digit OTP
    console.log(`OTP generated for ticket ${ticketId}: ${otp}`);

    // Store the OTP in the state
    setGeneratedOtp(otp.toString());
  };
  const ticketStatusOptions: ConfigurationModel[] = [
    { key: "CUSTOMER_NOT_AVAILABLE", value: "Customer not available" },
    { key: "SPARE_REQUIRED", value: "Spare Required" },
    { key: "OPENED", value: "Opened" },
  ];

  const handleUpdateStatus = () => {
    // Check if OTP or selected status is missing
    if (!otp || !selectedTicketStatus?.value) {
      setErrors([{ field: "otp", message: "OTP is required" }]);
      console.log("ticket updated");
      return;

    }

    // Ensure OTP is a valid number
    const otpNumber = parseInt(otp);
    if (isNaN(otpNumber)) {
      setErrors([{ field: "otp", message: "Invalid OTP" }]);
      return;
    }

    // Call the API to update the ticket status

  };
  const handleSelectOption = (option: string) => {
    const selectedOption = ticketStatusOptions.find((item) => item.value === option);
    setSelectedTicketStatus(selectedOption || {});
  };
  
  const updateTicketStatus = () => {
    if (!ticketId) {
      console.error("Ticket ID is missing");
      return;
    }
  
    // Ensure OTP and selected status are provided
    if (!otp || !selectedTicketStatus?.key) {
      setErrors([{ field: "otp", message: "OTP and status are required" }]);
      return;
    }
  
    // Validate OTP
    if (!/^\d{6}$/.test(otp)) {
      setErrors([{ field: "otp", message: "Invalid OTP. It should be a 6-digit number." }]);
      return;
    }
  
    console.log("selectedTicketStatus", selectedTicketStatus);

    // Build the request body
    const requestBody = {
      ticketId: String(ticketId), // Ensure ticketId is a string
      dueBy: new Date().toISOString(),
      toStatus: selectedTicketStatus.key,
      location: {}, // Replace with actual location data if needed
      description: ticketModel.description || "",
      pin: "",
    };
  
    console.log("Request Body: ", JSON.stringify(requestBody));
  
    api
    .put(`${UPDATE_TICKET_STATUS}?ticketId=${ticketId}`, requestBody)
    .then((response) => {
      console.log('Request Body:', requestBody); 
     
      if (response.data) {
      console.log('Response Status:', response.data.status);  // Check for 'status' in data
    }
      console.log('Ticket ID:', ticketId); 
      console.log("Ticket status updated successfully!", response)
    })
    .catch((e) => {
      console.error("Failed to update ticket status.", e.message);
      setFeedbackMessage("Failed to update ticket status. Please try again.");
    });
  
  };
  // const options = ticketStatusOptions.map((option: ConfigurationModel) => option.value || "");
  const options = ticketStatusOptions.length > 0
    ? ticketStatusOptions.map((option: ConfigurationModel) => option.value || "")
    : [];
  return isLoading ? (
    <LoadingBar />
  ) : (
    <View>
      <ScrollView>
        <View className="flex-1 bg-gray-100">
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
                        key={index}
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
                    <Text className="text-gray-500 text-md ">Assinged At</Text>
                    <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                      {ticketModel.lastAssignedToDetails?.assignedAt
                        ? moment(ticketModel.lastAssignedToDetails?.assignedAt).fromNow()
                        : "-"}
                    </Text>
                  </View>
                </View>


                {/* Conditionally render Update Ticket Status section */}
                {ticketModel.statusDetails?.value === "Assigned" && (
                  <View>
                    <Text className="font-bold text-xl mt-2">Update Ticket Status</Text>

                    <FormControl
                      isInvalid={isFormFieldInValid("ticketStatus", errors).length > 0}
                      className="mt-4"
                    >
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText>Status to</FormControlLabelText>
                      </FormControlLabel>
                      <CustomDropdown
                        options={options}
                        placeholder="Select status"
                        onSelect={handleSelectOption}
                      />
                      <FormControlError>
                        <FormControlErrorText>{isFormFieldInValid("ticketStatus", errors)}</FormControlErrorText>
                      </FormControlError>
                    </FormControl>

                    <FormControl
                      isInvalid={isFormFieldInValid("otp", errors).length > 0}
                      className="mt-4"
                    >
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText>Customer OTP</FormControlLabelText>
                      </FormControlLabel>
                      <Input variant="outline" size="md" isDisabled={false} isReadOnly={false}>
                        <InputField
                          placeholder="Enter customer otp"
                          className="py-2"
                          onChangeText={(e) => setOtp(e)}  // Ensure the OTP is set correctly
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorText>{isFormFieldInValid("otp", errors)}</FormControlErrorText>
                      </FormControlError>
                    </FormControl>

                    <Button className="bg-primary-950 rounded-md mt-4"
                      onPress={updateTicketStatus}
                    >
                      <ButtonText className="text-white text-sm">Update Status</ButtonText>
                    </Button>
                  </View>
                )}

              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};


export default TicketDetails;
