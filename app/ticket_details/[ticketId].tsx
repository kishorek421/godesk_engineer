import { Pressable, ScrollView, Text, TouchableOpacity, View, Image, Alert, ActivityIndicator, SafeAreaView } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { TicketListItemModel } from "@/models/tickets";
import apiClient from "@/clients/apiClient";
import { GET_CONFIGURATIONS_BY_CATEGORY, GET_TICKET_DETAILS, UPDATE_TICKET_STATUS, TICKET_UPLOADS } from "@/constants/api_endpoints";
import LoadingBar from "@/components/LoadingBar";
import TicketStatusComponent from "@/components/tickets/TicketStatusComponent";
import { getTicketLists } from "@/services/api/tickets_api_service";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorText } from "@/components/ui/form-control";
import {
  bytesToMB,
  getFileName,
  isFormFieldInValid,
  setErrorValue,
} from "@/utils/helper";
import ImagePickerComponent from "@/components/ImagePickerComponent";
import { ConfigurationModel } from "@/models/configurations";
import { ASSIGNED, TICKET_ASSIGNED, TICKET_CLOSED, TICKET_IN_PROGRESS, TICKET_OPENED, TICKET_STATUS } from "@/constants/configuration_keys";
import moment from "moment";
import CustomDropdown from '../../components/DropDown';
import { ErrorModel, DropdownModel } from "@/models/common";
import { error } from "ajv/dist/vocabularies/applicator/dependencies";
import useAuth from "@/hooks/useAuth";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import PrimaryDropdownFormField from "@/components/PrimaryDropdownFormField";
import PrimaryTextFormField from "@/components/PrimaryTextFormField";
import * as Location from "expo-location";
import FeatherIcon from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { HStack } from "@/components/ui/hstack";
import PrimaryTextareaFormField from "@/components/PrimaryTextareaFormField";

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
  const [selectTicketStatusOptions, setSelectTicketStatusOptions] = useState<DropdownModel>(
    {},
  ); const [currentTime, setCurrentTime] = useState(
    moment().format("DD/MM/YYYY hh:mm:ss A"),
  ); const [assetImages, setAssetImages] = useState<string[]>([]);
  const bottomSheetRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [ticketStatusOptionsState, setTicketStatusOptions] = useState<ConfigurationModel[]>(ticketStatusOptions);
  const [pincode, setPincode] = useState<string | undefined>(undefined);
  const { user } = useAuth();
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [description, setDescription] = useState<TicketListItemModel>({})
  const [canClearForm, setCanClearForm] = useState(false);
  const [canValidateField, setCanValidateField] = useState(false);
  const [fieldValidationStatus, setFieldValidationStatus] = useState<any>({});

  const setFieldValidationStatusFunc = (
    fieldName: string,
    isValid: boolean,
  ) => {
    if (fieldValidationStatus[fieldName]) {
      fieldValidationStatus[fieldName](isValid);
    }
  };
  
  const fetchTicketDetails = async () => {
    setIsLoading(true);
    if (typeof ticketId === 'string') {
      try {
        const response = await apiClient.get(GET_TICKET_DETAILS + `?ticketId=${ticketId}`);
        const ticketData = response.data.data ?? {};
        console.log('ticketData ~~~~~~~~~~~~~~~~~~~~~~~~', response.data.data);
        setTicketDetails(ticketData);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Fetch ticket status options
  const loadTicketStatus = async () => {
    try {
      const response = await apiClient.get(GET_CONFIGURATIONS_BY_CATEGORY, {
        params: { category: TICKET_STATUS },
      });
      console.log('response.data?.data ', response.data?.data);
      setTicketStatusOptions(response.data?.data ?? []);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch pincode based on current location
  const fetchPincode = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      // Set latitude and longitude
      setLatitude(latitude);
      setLongitude(longitude);
      setPincode(address.postalCode ?? '');
      console.log('Fetched Location:', latitude, longitude);
    } catch (error) {
      console.error('Error fetching pincode:', error);
    }
  };

  // Update current time every second
  useEffect(() => {
    console.log('ticketId', ticketId);

    // Set navigation options
    navigation.setOptions({
      headerLeftContainerStyle: {
        paddingStart: 10,
      },
    });

    // Call necessary functions
    fetchTicketDetails();
    loadTicketStatus();
    fetchPincode();

    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(moment().format('DD/MM/YYYY hh:mm:ss A'));
    }, 1000);

    // Cleanup timer on component unmount
    return () => clearInterval(timer);
  }, [ticketId, navigation]);

  // Handle ticket status selection
  const handleSelectOption = async (option: string) => {
    console.log('Selected option:', option);
    if (option === 'OPENED') {
      setSelectedTicketStatus({ key: 'OPENED', value: 'Open' });
    } else if (option === 'CUSTOMER_NOT_AVAILABLE') {
      setSelectedTicketStatus({ key: 'CUSTOMER_NOT_AVAILABLE', value: 'Customer Not Available' });
    } else if (option === 'IN_PROGRESS') {
      setSelectedTicketStatus({ key: 'IN_PROGRESS', value: 'InProgress' });
    } else {
      const selectedOption = ticketStatusOptions.find((item) => item.value === option);
      setSelectedTicketStatus(selectedOption || {});
    }
  };
  const toggleImagePicker = () => {
    setIsModalVisible(!isModalVisible);
    if (!isModalVisible) {
      bottomSheetRef.current?.show();
    } else {
      bottomSheetRef.current?.hide();
    }
  };
  // Update ticket status function
  const updateTicketStatus = async () => {
    try {
      console.log('ticketDetails.assignedToDetails?.id', ticketDetails.lastAssignedToDetails?.assignedTo);

      setErrors([]);

      // Validate if ticketId exists
      if (!ticketId) {
        console.error('Ticket ID is missing');
        return;
      }

      if (!selectedTicketStatus?.key) {
        setErrors([{ param: 'ticketStatus', message: 'Status is required' }]);
      }
     
      if (assetImages.length === 0) {
        setErrorValue(
          "assetImages",
          "",
          "Atleast one asset image is required",
          setErrors,
        );
      } else {
        setErrorValue("assetImages", "", "", setErrors);
      }
     

      // Ensure OTP and selected status are provided
      if (!otp && (selectedTicketStatus?.key === 'OPENED' || selectedTicketStatus?.key === 'TICKET_CLOSED')) {
        setErrors((prevState: any) => {
          return [...prevState, { param: 'otp', message: 'OTP is required' }];
        });
      }

      if ((!otp && (selectedTicketStatus?.key === 'OPENED' || selectedTicketStatus?.key === 'TICKET_CLOSED')) || !selectedTicketStatus?.key) {
        return;
      }
          console.log('Selected Ticket Status:', selectedTicketStatus);

    
    

      const validationPromises = Object.keys(fieldValidationStatus).map(
        (key) =>
          new Promise((resolve) => {
            // Resolve each validation status based on field key
            setFieldValidationStatus((prev: any) => ({
              ...prev,
              [key]: resolve,
            }));
          }),
      );

      setCanValidateField(true);

      // Wait for all validations to complete
      await Promise.all(validationPromises);

      const allValid = errors
        .map((error) => error.message?.length === 0)
        .every((status) => status === true);

      if (allValid) {
        setIsLoading(true);

        const formData = new FormData();

        setIsLoading(true);

        if (assetImages.length > 0) {
          console.log(assetImages);
          for (let i = 0; i < assetImages.length; i++) {
            const assetImage = assetImages[i];

            formData.append("assetImages", {
              uri: assetImage,
              type: "image/jpeg",
              name: getFileName(assetImage, true),
            } as any);
          }
        }

        setErrors([]);

        apiClient
          .post(TICKET_UPLOADS, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((response) => {
            const uploadedAssetImages = response.data.data;
            console.log("uploadedAssetImages", uploadedAssetImages);

            if (uploadedAssetImages) {
              let ticketData = {
                selectTicketStatusOptions  : selectTicketStatusOptions?.value,
                description: ticketDetails.description,
                assetImages: uploadedAssetImages,
              };
              // You can continue using ticketData here
              console.log("Ticket data:", ticketData);
            }
          })
          .catch((e) => {
            let errors = e.response?.data?.errors;
            console.log(errors);
            setIsLoading(false);
          });
      }
      const requestBody = {
        ticketId,
        assignedTo: ticketDetails.lastAssignedToDetails?.assignedTo,
        toStatus: selectedTicketStatus.key,
        location: {
          latitude: latitude || 19.4210814, // Use fetched latitude, fallback to default
          longitude: longitude || 72.9167569, // Use fetched longitude, fallback to default
        },
        description: ticketDetails.description,
        pin: null,
      };

      console.log('Request Body: ~~~~~~~~~~~~~~~~~~~~~~~~~>>>>>>>> ', JSON.stringify(requestBody));

      // Step 3: Send the PUT request to update ticket status
      const response = await apiClient.put(`${UPDATE_TICKET_STATUS}?ticketId=${ticketId}`, requestBody);

      if (response.status === 200) {
        console.log('Ticket status updated successfully!', response);
        fetchTicketDetails(); // Call the fetchTicketDetails function after updating
        Alert.alert('Success', 'Ticket status updated successfully!', [{ text: 'OK' }]);
      } else {
        console.error('Failed to update ticket status. Server responded with:', response.status);
        Alert.alert('Failed', 'Failed to update ticket status', [{ text: 'OK' }]);
      }
    } catch (e) {
      console.error('Failed to update ticket status.', e.response?.data || e);
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

          <View className="flex-row items-center bg-white h-14 shadow-md px-4">
            {/* Back Button */}
            <View className="flex-row items-center flex-1">
              <MaterialIcons name="arrow-back-ios" size={20} color="black" />
            </View>

            {/* Title */}
            <View className="flex-1">
              <Text className="font-bold text-lg text-center">Ticket Details</Text>
            </View>

            {/* Optional Right Side Placeholder */}
            <View className="flex-1"></View>
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
                    <View className="flex-row items-center justify-between">
                      <View className="flex">
                        <Text className="text-gray-500 text-md ">Description</Text>
                        <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                          {ticketDetails?.description ?? "-"}
                        </Text>
                      </View>
                      <View className="flex items-end">
                        <Text className="text-gray-500 text-md ">Assinged At</Text>
                        <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                          {ticketDetails.lastAssignedToDetails?.assignedAt
                            ? moment(ticketDetails.lastAssignedToDetails?.assignedAt).fromNow()
                            : "-"}
                        </Text>
                      </View>
                    </View>
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
                  {/* Conditionally render Update Ticket Status section */}
                  {(ticketDetails.statusDetails?.value === "Opened" || ticketDetails.statusDetails?.value === "Assigned" || ticketDetails.statusDetails?.value === "InProgress") && (
                    <View className='my-4'>
                      <Text className="font-bold text-lg text-primary-950">Update Ticket Status</Text>
                      <FormControl
                        isInvalid={isFormFieldInValid("ticketStatus", errors).length > 0}
                        className={`mt-4 `}
                      >
                        <PrimaryDropdownFormField
                          options={ticketStatusOptions.length > 0 ? (
                            ticketDetails.statusDetails?.key === TICKET_IN_PROGRESS ?
                              ticketStatusOptions.map((option: ConfigurationModel) => option.value || "")
                              : ticketDetails.statusDetails?.key === ASSIGNED ? [{ value: "OPENED", label: "Open" },
                              { value: "CUSTOMER_NOT_AVAILABLE", label: "Customer not available" },] :
                                ticketDetails.statusDetails?.key === "OPENED" ? [{ value: "IN_PROGRESS", label: "InProgress" }] :
                                  []
                          )
                            : []}
                          selectedValue={selectTicketStatusOptions}
                          setSelectedValue={setSelectTicketStatusOptions}
                          type="ticketStatusOptionsState"
                          placeholder="Select Status"
                          fieldName="selectTicketStatusOptions"
                          label="Status to"
                          canValidateField={canValidateField}
                          setCanValidateField={setCanValidateField}
                          setFieldValidationStatus={setFieldValidationStatus}
                          validateFieldFunc={setFieldValidationStatusFunc}
                          errors={errors}
                          setErrors={setErrors}
                          onSelect={handleSelectOption}
                        />
                        <FormControlError>
                          <FormControlErrorText>{isFormFieldInValid("ticketStatus", errors)}</FormControlErrorText>
                        </FormControlError>
                      </FormControl>
                      <FormControl
                        isInvalid={isFormFieldInValid("description", errors).length > 0}
                        className="mt-4 "
                      >
                        <PrimaryTextFormField
                          fieldName="description"
                          label=" Description"
                          placeholder="Write a short description about your issue"
                          errors={errors}
                          setErrors={setErrors}
                          min={10}
                          max={200}

                          filterExp={/^[a-zA-Z0-9,.-/'#$& ]*$/}
                          onChangeText={(e: any) => setDescription(e)}
                          canValidateField={canValidateField}
                          setCanValidateField={setCanValidateField}
                          setFieldValidationStatus={setFieldValidationStatus}
                          validateFieldFunc={setFieldValidationStatusFunc}

                        />
                        <FormControlError>
                          <FormControlErrorText>{isFormFieldInValid("description", errors)}</FormControlErrorText>
                        </FormControlError>
                      </FormControl>
                      <FormControl
                        isInvalid={isFormFieldInValid("assetImages", errors).length > 0}
                      >
                        <HStack className="justify-between mt-2 mb-1">
                          <Text className="font-medium">
                            Asset Images <Text className="text-red-400">*</Text>
                          </Text>
                          <Text className="text-gray-500">{assetImages.length}/3</Text>
                        </HStack>
                        <View className="flex-row flex-wrap">
                          {assetImages.map((uri, index) => (
                            <Pressable
                              onPress={() => {
                                router.push({
                                  pathname: "/image_viewer/[uri]",
                                  params: {
                                    uri: uri,
                                  },
                                });
                              }}
                              className="me-3 mt-2"
                              key={index}
                            >
                              <View>
                                <Image
                                  source={{ uri: uri }}
                                  className="w-24 h-24 rounded-xl absolute"
                                />
                                <View className="w-24 flex items-end gap-4 h-24 rounded-xl">
                                  <Pressable
                                    className="mt-2 me-2"
                                    onPress={() => {
                                      // setImagePath("");
                                      setAssetImages((prev) => {
                                        prev.splice(index, 1);
                                        return [...prev];
                                      });
                                    }}
                                  >
                                    <AntDesign name="closecircle" size={16} color="white" />
                                  </Pressable>
                                </View>
                              </View>
                             
                            </Pressable>
                          ))}
                        </View>
                        {assetImages.length < 3 && (
                          <Button
                            className="bg-gray-200 mt-4"
                            onPress={() => toggleImagePicker()}
                          >
                            <FeatherIcon
                              name="plus-circle"
                              className="me-1"
                              color="black"
                              size={18}
                            />
                            <ButtonText className="text-black">Add Image</ButtonText>
                          </Button>
                        )}
                        <FormControlError className="mt-2">
                          <FormControlErrorText>
                            {isFormFieldInValid("assetImages", errors)}
                          </FormControlErrorText>
                        </FormControlError>
                      </FormControl>
                      <FormControl
                        isInvalid={isFormFieldInValid("otp", errors).length > 0}
                        className="mt-4 "
                      >
                        <PrimaryTextFormField
                          fieldName="Customer OTP"
                          label="Customer OTP"
                          placeholder="Enter customer otp"
                          // defaultValue={.orgMobile}
                          errors={errors}
                          setErrors={setErrors}
                          min={6}
                          max={6}
                          keyboardType="phone-pad"
                          filterExp={/^[0-9]*$/}
                          canValidateField={canValidateField}
                          setCanValidateField={setCanValidateField}
                          setFieldValidationStatus={setFieldValidationStatus}
                          validateFieldFunc={setFieldValidationStatusFunc}
                          onChangeText={(e: any) => setOtp(e)}
                        />
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
          <ImagePickerComponent
        onImagePicked={(uri, fileSizeBytes) => {
          console.log("uri", uri);
          const fileSizeMB = bytesToMB(fileSizeBytes);
          if (fileSizeMB > 15) {
            Toast.show({
              type: "error",
              text1: "Image larger than 15mb are not accepted.",
            });
            return;
          }
          setAssetImages((prevState) => [...prevState, uri]);
        }}
        setIsModalVisible={setIsModalVisible}
        bottomSheetRef={bottomSheetRef}
      />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default TicketDetails;
