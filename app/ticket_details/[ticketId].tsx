import { Pressable, ScrollView, Text, TouchableOpacity, View, Image,Alert } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { TicketListItemModel } from "@/models/tickets";
import api from "@/services/api/base_api_service";
import { GET_CONFIGURATIONS_BY_CATEGORY, GET_TICKET_DETAILS, UPDATE_TICKET_STATUS } from "@/constants/api_endpoints";
import LoadingBar from "@/components/LoadingBar";
import TicketStatusComponent from "@/components/tickets/TicketStatusComponent";
import { getTicketLists } from "@/services/api/tickets_api_service";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorText } from "@/components/ui/form-control";
import { isFormFieldInValid } from "@/utils/helper";
import { ConfigurationModel } from "@/models/configurations";
import { TICKET_STATUS } from "@/constants/configuration_keys";
import moment from "moment";
import CustomDropdown from '../../components/DropDown';
import { ErrorModel } from "@/models/common";
import { error } from "ajv/dist/vocabularies/applicator/dependencies";


const TicketDetails = () => {
  const ticketStatusOptions: ConfigurationModel[] = [
    { key: "CUSTOMER_NOT_AVAILABLE", value: "Customer not available" },
    { key: "SPARE_REQUIRED", value: "Spare Required" },
    { key: "OPENED", value: "Opened" },
  ];
  const { ticketId } = useLocalSearchParams();
  const [ticketModel, setTicketModel] = useState<TicketListItemModel>({});
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  const [errors, setErrors] = useState<ErrorModel[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedTicketStatus, setSelectedTicketStatus] = useState<ConfigurationModel>({});
  const [statusMessage, setStatusMessage] = useState("");
 
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

          
          if (ticketData.statusDetails?.value === "Assigned") {
            (ticketId);
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
  
  const updateTicketStatus = async () => {
    try {
      // Validate if ticketId exists
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
  
      console.log("Selected Ticket Status:", selectedTicketStatus);
  
      // Step 1: Fetch existing ticket details to get location
      let ticketDetails;
      try {
        const ticketResponse = await api.get(`${GET_TICKET_DETAILS}?ticketId=${ticketId}`);
        if (ticketResponse.status === 200 && ticketResponse.data) {
          ticketDetails = ticketResponse.data;
          console.log("Fetched Ticket Details:", ticketDetails);
        } else {
          throw new Error("Unable to fetch ticket details.");
        }
      } catch (e) {
        console.error("Failed to fetch ticket details.", error.message);
        setFeedbackMessage("Failed to fetch ticket details. Please try again.");
        return;
      }//"9ba049d1-1b51-4ce1-9392-5ba52f155f49"
      const requestBody = {
        ticketId,
        assignedTo: ticketModel.assignedToDetails?.id , 
        toStatus: selectedTicketStatus.key,
        location: ticketDetails.location || { longitude: "0.0", latitude: "0.0" },
        description: ticketModel.description || "No description available",
        pin: ticketDetails.pin || "", 
      };
      
      console.log("Request Body: ", JSON.stringify(requestBody));
  
      // Step 3: Send the PUT request to update ticket status
      const response = await api.put(`${UPDATE_TICKET_STATUS}?ticketId=${ticketId}`, requestBody);
  
      if (response.status === 200) {
        console.log("Ticket status updated successfully!", response);
        Alert.alert('Success', 'Ticket status updated successfully!', [{ text: 'OK' }]);

      } else {
        console.error("Failed to update ticket status. Server responded with:", response.status);
        Alert.alert('Failed','failed to update ticket status', [{ text: 'OK' }]);
      }
    } catch (e) {
      console.error("Failed to update ticket status.", error.message);
     
    }
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
                {(ticketModel.statusDetails?.value === "Assigned" || ticketModel.statusDetails?.value === "InProgress") && (
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
