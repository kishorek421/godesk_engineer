import { Pressable, ScrollView, Text, TouchableOpacity, View, Image, Alert, ActivityIndicator, SafeAreaView } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { TicketListItemModel } from "@/models/tickets";
import apiClient from "@/clients/apiClient";
import { GET_CONFIGURATIONS_BY_CATEGORY, GET_TICKET_DETAILS, UPDATE_TICKET_STATUS } from "@/constants/api_endpoints";
import LoadingBar from "@/components/LoadingBar";
import TicketStatusComponent from "@/components/tickets/TicketStatusComponent";
import { getTicketLists } from "@/services/api/tickets_api_service";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorText } from "@/components/ui/form-control";
import { isFormFieldInValid } from "@/utils/helper";
import { ConfigurationModel } from "@/models/configurations";
import { ASSIGNED, TICKET_ASSIGNED, TICKET_CLOSED, TICKET_IN_PROGRESS, TICKET_OPENED, TICKET_STATUS } from "@/constants/configuration_keys";
import moment from "moment";
import CustomDropdown from '../../components/DropDown';
import { ErrorModel } from "@/models/common";
import { error } from "ajv/dist/vocabularies/applicator/dependencies";
import useAuth from "@/hooks/useAuth";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";


const TicketDetails = () => {
  const ticketStatusOptions: ConfigurationModel[] = [
    { key: "SPARE_REQUIRED", value: "Spare Required" },
    { key: "CANNOT_RESOLVE", value: "Cannot Resolve" },
    { key: "TICKET_CLOSED", value: "Close" },
  ];
  const { ticketId } = useLocalSearchParams();
  const [ticketDetails, setTicketDetails] = useState<TicketListItemModel>({});
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const [errors, setErrors] = useState<ErrorModel[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [selectedTicketStatus, setSelectedTicketStatus] = useState<ConfigurationModel>({});

  const [ticketStatusOptionsState, setTicketStatusOptions] = useState<ConfigurationModel[]>(ticketStatusOptions);

  const { user } = useAuth();

  useEffect(() => {

    console.log("ticketId", ticketId);

    navigation.setOptions({
      headerLeftContainerStyle: {
        paddingStart: 10,
      },
    });

    fetchTicketDetails();

    loadTicketStatus();
  }, [ticketId, navigation]);

  const fetchTicketDetails = () => {
    setIsLoading(true);
    if (typeof ticketId === "string") {
      apiClient
        .get(GET_TICKET_DETAILS + `?ticketId=${ticketId}`)
        .then((response) => {
          const ticketData = response.data.data ?? {};
          console.log("ticketData ~~~~~~~~~~~~~~~~~~~~~~~~", response.data.data);

          setTicketDetails(ticketData);
        })
        .catch((e) => {
          console.error(e);
        }).finally(() => {
          setIsLoading(false);
        });
    }
  }

  const loadTicketStatus = () => {
    apiClient
      .get(GET_CONFIGURATIONS_BY_CATEGORY, {
        params: {
          category: TICKET_STATUS,
        },
      })
      .then((response) => {
        console.log("response.data?.data ", response.data?.data);
        setTicketStatusOptions(response.data?.data ?? []);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const handleSelectOption = (option: string) => {
    console.log("option", option);
    if (option === 'OPENED') {
      setSelectedTicketStatus({ key: "OPENED", value: "Open" });
    } else if (option === 'CUSTOMER_NOT_AVAILABLE') {
      setSelectedTicketStatus({ key: "CUSTOMER_NOT_AVAILABLE", value: "Customer Not Available" });
    } else if (option === 'IN_PROGRESS') {
      setSelectedTicketStatus({ key: "IN_PROGRESS", value: "InProgress" });
    } else {
      const selectedOption = ticketStatusOptions.find((item) => item.value === option);
      setSelectedTicketStatus(selectedOption || {});
    }
  };

  const updateTicketStatus = async () => {
    try {
      console.log("ticketDetails.assignedToDetails?.id", ticketDetails.lastAssignedToDetails?.assignedTo);

      setErrors([]);

      // Validate if ticketId exists
      if (!ticketId) {
        console.error("Ticket ID is missing");
        return;
      }

      if (!selectedTicketStatus?.key) {
        setErrors([{ param: "ticketStatus", message: "Status is required" }]);
      }

      // Ensure OTP and selected status are provided
      if (!otp && (selectedTicketStatus?.key === 'OPENED' || selectedTicketStatus?.key === 'TICKET_CLOSED')) {
        setErrors((prevState: any) => {
          return [...prevState, { param: "otp", message: "OTP is required" }]
        });
      }

      if ((!otp && (selectedTicketStatus?.key === 'OPENED' || selectedTicketStatus?.key === 'TICKET_CLOSED')) || !selectedTicketStatus?.key) {
        return;
      }

      // // Validate OTP
      // if (!/^\d{4,6}$/.test(otp)) {
      //   setErrors([{ param: "otp", message: "Invalid OTP. It should be a 6-digit number." }]);
      //   return;
      // }

      console.log("Selected Ticket Status:", selectedTicketStatus);

      const requestBody = {
        ticketId,
        assignedTo: ticketDetails.lastAssignedToDetails?.assignedTo,
        toStatus: selectedTicketStatus.key,
        location: ticketDetails.location || { "latitude": 19.4210814,"longitude": 72.9167569 },
        description: ticketDetails.description || "No description available",
        pin: null,
      };

      console.log("Request Body: ~~~~~~~~~~~~~~~~~~~~~~~~~>>>>>>>> ", JSON.stringify(requestBody));

      // Step 3: Send the PUT request to update ticket status
      const response = await apiClient.put(`${UPDATE_TICKET_STATUS}?ticketId=${ticketId}`, requestBody);

      if (response.status === 200) {
        console.log("Ticket status updated successfully!", response);
        fetchTicketDetails();
        Alert.alert('Success', 'Ticket status updated successfully!', [{ text: 'OK' }]);
      } else {
        console.error("Failed to update ticket status. Server responded with:", response.status);
        Alert.alert('Failed', 'failed to update ticket status', [{ text: 'OK' }]);
      }
    } catch (e ) {
      console.error("Failed to update ticket status.", e.response.data);
    }
  };

  return isLoading ? (
    <LoadingBar />
  ) : (
    <SafeAreaView>
      <View>
        <Pressable
          onPress={() => {
            router.push({
              pathname: "../home",
              params: {
                refresh: "true"
              }
            })
          }}
        >
          <View className="flex-row items-center">
            <View className=" flex-row ps-4 pe-2 items-center">
              <MaterialIcons name="arrow-back-ios" size={20} color="black" />
              {/* <Text className="text-primary-950 text-xl">Home</Text> */}
            </View>
            <View className=" text-center">
              <Text className="font-bold text-lg text-center">Ticket Details</Text>
            </View>
          </View>
        </Pressable>
        <ScrollView>

          <View className="flex-1 bg-gray-100">
            <View className="p-4">
              <View className="w-full bg-white px-3 py-3 rounded-lg">
                <View className="flex">
                  <View className="flex-row justify-between w-full">
                    <View>
                      <Text className="text-gray-900 font-bold">
                        {ticketDetails?.ticketNo ?? "-"}
                      </Text>
                      <Text className="text-gray-500 text-[13px] mt-[1px]">
                        Issue in {ticketDetails.issueTypeDetails?.name ?? "-"}
                      </Text>
                    </View>
                    <TicketStatusComponent
                      statusKey={ticketDetails.statusDetails?.key}
                      statusValue={ticketDetails.statusDetails?.value}
                    />
                  </View>
                  <View className="border-dashed border-[1px] border-gray-300 h-[1px] mt-3 mb-3 w-full" />
                  <View className="w-full">
                    <View className="flex-row items-center justify-between">
                      <View className="flex">
                        <Text className="text-gray-500 text-md ">Raised by</Text>
                        <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                          {ticketDetails?.customerDetails?.firstName ?? "-"}{" "}
                          {ticketDetails?.customerDetails?.lastName ?? ""}
                        </Text>
                      </View>
                      <View className="flex items-end">
                        <Text className="text-gray-500 text-md ">Raised At</Text>
                        <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                          {ticketDetails.createdAt
                            ? moment(ticketDetails.createdAt).fromNow()
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
                          {ticketDetails?.assetInUseDetails?.serialNo ?? "-"}
                        </Text>
                      </View>
                      <View className="flex items-end">
                        <Text className="text-gray-500 text-md ">Asset Type</Text>
                        <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                          {ticketDetails.assetInUseDetails?.assetMasterDetails
                            ?.assetTypeDetails?.name ?? "-"}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="w-full mt-3">
                    <Text className="text-gray-500 text-md ">Description</Text>
                    <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                      {ticketDetails?.description ?? "-"}
                    </Text>
                  </View>
                  <View className="w-full mt-3">
                    <Text className="text-gray-500 text-md ">Issue Images</Text>
                    <View className="flex-row flex-wrap gap-3">
                      {(ticketDetails.ticketImages ?? []).length > 0 ? (
                        ticketDetails.ticketImages?.map((uri: any, index: any) => (
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
                  </View>

                  <View className="w-full mt-4">
                    <View>
                      <Text className="text-gray-500 text-md ">Assinged At</Text>
                      <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                        {ticketDetails.lastAssignedToDetails?.assignedAt
                          ? moment(ticketDetails.lastAssignedToDetails?.assignedAt).fromNow()
                          : "-"}
                      </Text>
                    </View>
                  </View>

                  {/* Conditionally render Update Ticket Status section */}
                  {(ticketDetails.statusDetails?.value === "Opened" || ticketDetails.statusDetails?.value === "Assigned" || ticketDetails.statusDetails?.value === "InProgress") && (
                    <View className='my-4'>
                      <Text className="font-bold text-lg text-primary-950">Update Ticket Status</Text>
                      <FormControl
                        isInvalid={isFormFieldInValid("ticketStatus", errors).length > 0}
                        className="mt-4"
                      >
                        <FormControlLabel className="mb-1">
                          <FormControlLabelText>Status to</FormControlLabelText>
                        </FormControlLabel>
                        <CustomDropdown
                          options={ticketStatusOptions.length > 0 ? (
                            ticketDetails.statusDetails?.key === TICKET_IN_PROGRESS ?
                              ticketStatusOptions.map((option: ConfigurationModel) => option.value || "")
                              : ticketDetails.statusDetails?.key === ASSIGNED ? [{ value: "OPENED", label: "Open" },
                              { value: "CUSTOMER_NOT_AVAILABLE", label: "Customer not available" },] :
                                ticketDetails.statusDetails?.key === "OPENED" ? [{ value: "IN_PROGRESS", label: "InProgress" }] :
                                []
                          )
                            : []}
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
                            onChangeText={(e: any) => setOtp(e)}  // Ensure the OTP is set correctly
                          />
                        </Input>
                        <FormControlError>
                          <FormControlErrorText>{isFormFieldInValid("otp", errors)}</FormControlErrorText>
                        </FormControlError>
                      </FormControl>
                      <Button className="bg-primary-950 rounded-md mt-6 h-12"
                        onPress={() => {
                          if (isLoading) return;
                          updateTicketStatus();
                        }}
                      >
                        <ButtonText className="text-white">Update Status</ButtonText>
                        {isLoading && <ActivityIndicator />}
                      </Button>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default TicketDetails;