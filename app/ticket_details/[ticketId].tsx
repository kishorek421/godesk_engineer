import { Pressable, ScrollView, Text, View, Image, ActivityIndicator, SafeAreaView } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { TicketListItemModel } from "@/models/tickets";
import apiClient from "@/clients/apiClient";
import {
  GET_CONFIGURATIONS_BY_CATEGORY,
  GET_TICKET_DETAILS,
  TICKET_UPLOADS,
  UPDATE_TICKET_STATUS,
} from "@/constants/api_endpoints";
import LoadingBar from "@/components/LoadingBar";
import TicketStatusComponent from "@/components/tickets/TicketStatusComponent";
import { Button, ButtonText } from "@/components/ui/button";
import Toast from "react-native-toast-message";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import SubmitButton from "@/components/SubmitButton";
import {
  bytesToMB,
  getFileName,
  isFormFieldInValid,
} from "@/utils/helper";
import ImagePickerComponent from "@/components/ImagePickerComponent";
import { ConfigurationModel } from "@/models/configurations";
import {
  ASSIGNED,
  TICKET_IN_PROGRESS,
  TICKET_STATUS,
} from "@/constants/configuration_keys";
import moment from "moment";
import { ErrorModel, DropdownModel } from "@/models/common";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import PrimaryDropdownFormField from "@/components/PrimaryDropdownFormField";
import PrimaryTextFormField from "@/components/PrimaryTextFormField";
import * as Location from "expo-location";
import FeatherIcon from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { HStack } from "@/components/ui/hstack";
import PrimaryTextareaFormField from "@/components/PrimaryTextareaFormField";
import { useTranslation } from "react-i18next";
import { Axios, AxiosError } from "axios";

const TicketDetails = () => {
  const { t, i18n } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const [errors, setErrors] = useState<ErrorModel[]>([]);
  const [otp, setOtp] = useState("");
  const [currentTime, setCurrentTime] = useState(moment().format("DD/MM/YYYY hh:mm:ss A"));

  const { ticketId } = useLocalSearchParams();
  const [ticketDetails, setTicketDetails] = useState<TicketListItemModel>({});
  const [selectedTicketStatus, setSelectedTicketStatus] = useState<ConfigurationModel>({});
  const [selectTicketStatusOptions, setSelectTicketStatusOptions] = useState<DropdownModel>({});
  const [assetImages, setAssetImages] = useState<string[]>([]);
  const bottomSheetRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [ticketStatusOptionsState, setTicketStatusOptions] = useState<ConfigurationModel[]>([]);
  const [description, setDescription] = useState<string | null>(null);

  const [pincode, setPincode] = useState<string | undefined>(undefined);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [canValidateField, setCanValidateField] = useState(false);
  const [fieldValidationStatus, setFieldValidationStatus] = useState<any>({});


  const setFieldValidationStatusFunc = (
    fieldName: string,
    isValid: boolean
  ) => {
    if (fieldValidationStatus[fieldName]) {
      fieldValidationStatus[fieldName](isValid);
    }
  };

  const fetchTicketDetails = async () => {
    setIsLoading(true);
    if (typeof ticketId === "string") {
      try {
        const response = await apiClient.get(
          GET_TICKET_DETAILS + `?ticketId=${ticketId}`
        );
        const ticketData = response.data.data ?? {};
        console.log("ticketData ~~~~~~~~~~~~~~~~~~~~~~~~", response.data.data);
        setTicketDetails(ticketData);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const loadTicketStatus = async () => {
    try {
      const response = await apiClient.get(GET_CONFIGURATIONS_BY_CATEGORY, {
        params: { category: TICKET_STATUS },
      });
      console.log("response.data?.data --- ticket status ----->>>> ", response.data?.data);
      setTicketStatusOptions(response.data?.data ?? []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPincode = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      let { latitude, longitude } = location.coords;
      latitude = Math.abs(latitude);
      longitude = Math.abs(longitude);

      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      setLatitude(latitude);
      setLongitude(longitude);
      setPincode(address?.postalCode ?? "");

      console.log("Fetched Location:", latitude, longitude);
    } catch (error) {
      console.error("Error fetching pincode:", error);
    }
  };

  useEffect(() => {
    console.log("ticketId", ticketId);

    navigation.setOptions({
      headerLeftContainerStyle: {
        paddingStart: 10,
      },
    });

    fetchTicketDetails();
    loadTicketStatus();
    fetchPincode();

    const timer = setInterval(() => {
      setCurrentTime(moment().format("DD/MM/YYYY hh:mm:ss A"));
    }, 1000);

    return () => clearInterval(timer);
  }, [ticketId, navigation]);

  // const predefinedStatuses: { [key: string]: ConfigurationModel } = {
  //   OPENED: { key: "OPENED", value: "Open" },
  //   CUSTOMER_NOT_AVAILABLE: {
  //     key: "CUSTOMER_NOT_AVAILABLE",
  //     value: "Customer Not Available",
  //   },
  //   IN_PROGRESS: { key: "IN_PROGRESS", value: "InProgress" },
  //   TICKET_CLOSED: { key: "TICKET_CLOSED", value: "Close" },
  // };

  const handleSelectOption = async (option: string) => {
    console.log("Selected option:", option);
    const selectedTicketStatus = ticketStatusOptionsState.find((item) => item.key === option) ?? {};
    console.log("selectedTicketStatus", selectedTicketStatus);
    setSelectedTicketStatus(selectedTicketStatus);
  };

  const toggleImagePicker = () => {
    setIsModalVisible(!isModalVisible);
    if (!isModalVisible) {
      bottomSheetRef.current?.show();
    } else {
      bottomSheetRef.current?.hide();
    }
  };

  const validateInputs = (): { param: string; message: string }[] => {
    const errors: { param: string; message: string }[] = [];
    if (!selectedTicketStatus?.key) {
      errors.push({ param: "ticketStatus", message: "Status is required" });
    }
    if (!description) {
      errors.push({
        param: "description",
        message: "Please enter a description",
      });
    }
    if (
      (selectedTicketStatus?.key === "IN_PROGRESS" ||
        selectedTicketStatus?.key === "SPARE_REQUIRED" ||
        selectedTicketStatus?.key === "CANNOT_RESOLVE" ||
        selectedTicketStatus?.key === "TICKET_CLOSED") &&
      !otp
    ) {
      errors.push({
        param: "otp",
        message: "Pin is required for the selected status",
      });
    }
    if (assetImages.length === 0) {
      (selectedTicketStatus?.key === "IN_PROGRESS" ||
       selectedTicketStatus?.key === "SPARE_REQUIRED" ||
       selectedTicketStatus?.key === "CANNOT_RESOLVE" ||
       selectedTicketStatus?.key === "TICKET_CLOSED") &&
      errors.push({
        param: "assetImages",
        message: "At least one asset image is required",
      });
    }
    if (!latitude || !longitude) {
      if (!latitude || !longitude) {
        errors.push({
          param: "location",
          message: "Location is required but couldn't be fetched.",
        });
      }
      if (!pincode) {
        errors.push({
          param: "pincode",
          message: "Pincode is required but couldn't be fetched.",
        });
      }
    }
    return errors;
  };

  const updateTicketStatus = async () => {
    try {
      const formErrors = validateInputs();
      if (formErrors.length > 0) {
        setErrors(formErrors);
        return; 
      }
  
     // setIsLoading(true);
  
      let uploadedAssetImages: string[] = [];
  
      if (assetImages.length > 0) {
        console.log("Uploading asset images:", assetImages);
  
        const formData = new FormData();
        for (let i = 0; i < assetImages.length; i++) {
          const assetImage = assetImages[i];
          formData.append("assetImages", {
            uri: assetImage,
            type: "image/jpeg",
            name: getFileName(assetImage, true),
          } as unknown as Blob);
        }
        const uploadResponse = await apiClient.post(TICKET_UPLOADS, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
  
        if (uploadResponse.status !== 200) {
          throw new Error("Image upload failed");
        }
  
        uploadedAssetImages = uploadResponse.data.data || [];
        console.log("Uploaded asset images:", uploadedAssetImages);
      }
      const requestBody = {
        ticketId,
        assignedTo: ticketDetails.lastAssignedToDetails?.assignedTo,
        toStatus: selectedTicketStatus.key,
        location: {
          latitude,
          longitude,
        },
        pincode,
        description,
        pin: ["IN_PROGRESS", "SPARE_REQUIRED", "CANNOT_RESOLVE", "TICKET_CLOSED"].includes(
          selectedTicketStatus.key ?? ""
        )
          ? otp ?? null
          : null,
        assetImages: uploadedAssetImages, 
      };
  
      console.log("Request body:", requestBody);
      const updateResponse = await apiClient.put(
        `${UPDATE_TICKET_STATUS}?ticketId=${ticketId}`,
        requestBody
      );
  
      if (updateResponse.status === 200) {
        console.log("Ticket status updated successfully");
        Toast.show({
          type: "success",
          text1: "Ticket status updated successfully!",
        });
  
        await fetchTicketDetails();
        router.push({
          pathname: "../home",
          params: { refresh: "true" },
        });
      } else {
        throw new Error(`Failed to update status: ${updateResponse.status}`);
      }
    } catch (error: any) {
      console.error("Failed to update ticket status.", error?.response?.data);
  
      if (error?.response?.data?.errors) {
        setErrors(error.response.data.errors.filter((err: any) => err.param !== null));
  
        const errorMessages = error.response.data.errors
          .filter((err: any) => err.param === null)
          .map((err: any) => err.message)
          .join("\n");
  
        if (errorMessages) {
          Toast.show({
            type: "error",
            text1: errorMessages,
          });
        }
      } else {
        Toast.show({
          type: "error",
          text1: error.response?.data?.message || "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  
  const getTicketStatusOptions = (statusKey?: string, customerTypeKey?: string): (string | { label: any; value: any })[] => {
    if (ticketDetails.statusDetails?.key === ASSIGNED) {
      return [
        { value: "OPENED", label: "Open" },
        {
          value: "CUSTOMER_NOT_AVAILABLE",
          label: "Customer not available",
        },
      ]
    }
    if (ticketDetails.statusDetails?.key === "OPENED") {
      return [
        {
          value: "IN_PROGRESS",
          label: "InProgress",
        },
        {
          value: "CUSTOMER_NOT_AVAILABLE",
          label: "Customer not available",
        },
      ]
    }
    if (ticketDetails.statusDetails?.key === "IN_PROGRESS") {
      if (customerTypeKey === "B2C_USER") {
        return [
          {
            value: "WORK_COMPLETED",
            label: "Work Completed",
          },
          { value: "SPARE_REQUIRED", label: "Spare Required" },
          { value: "CANNOT_RESOLVE", label: "Cannot Resolve" },
        ]
      } else {
        return [
          {
            value: "TICKET_CLOSED",
            label: "Close",
          },
          { value: "SPARE_REQUIRED", label: "Spare Required" },
          { value: "CANNOT_RESOLVE", label: "Cannot Resolve" },
        ]
      }
    }
    if (ticketDetails.statusDetails?.key === "PAID") {
      if (customerTypeKey === "B2C_USER") {
        return [
          {
            value: "TICKET_CLOSED",
            label: "Close",
          },
        ]
      }
    }
    return [];
  }

  return isLoading ? (
    <LoadingBar />
  ) : (
    <SafeAreaView className="flex-1">
      <View>
        <Pressable
          onPress={() => {
            router.push({
              pathname: "../home",
              params: {
                refresh: "true",
              },
            });
          }}
        >
          <View className="flex-row items-center bg-white h-14 shadow-md px-4">
            <View className="flex-row items-center flex-1">
              <MaterialIcons name="arrow-back-ios" size={20} color="black" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-lg text-center">
                {t("ticketDetails")}
              </Text>
            </View>
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
                        issue In {ticketDetails.issueTypeDetails?.name ?? "-"}
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
                        <Text className="text-gray-500 text-md ">
                          {t("raisedBy")}
                        </Text>
                        <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                          {ticketDetails?.customerDetails?.firstName ?? "-"}{" "}
                          {ticketDetails?.customerDetails?.lastName ?? ""}
                        </Text>
                      </View>
                      <View className="flex items-end">
                        <Text className="text-gray-500 text-md ">
                          {t("raisedAt")}
                        </Text>
                        <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                          {ticketDetails.createdAt
                            ? moment(ticketDetails.createdAt).format(
                              "DD-MM-YYYY"
                            )
                            : "-"}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="w-full mt-3">
                    <View className="flex-row items-center justify-between">
                      <View className="flex">
                        <Text className="text-gray-500 text-md ">
                          {t("serialNo")}
                        </Text>
                        <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                          {ticketDetails?.assetInUseDetails?.serialNo ?? "-"}
                        </Text>
                      </View>
                      <View className="flex items-end">
                        <Text className="text-gray-500 text-md ">
                          {t("Asset Type")}
                        </Text>
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
                        <Text className="text-gray-500 text-md ">
                          {t("description")}
                        </Text>
                        <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                          {ticketDetails?.description ?? "-"}
                        </Text>
                      </View>
                      <View className="flex items-end">
                        <Text className="text-gray-500 text-md ">
                          {t("assignedAt")}
                        </Text>
                        <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                          {ticketDetails.lastAssignedToDetails?.assignedAt
                            ? moment(
                              ticketDetails.lastAssignedToDetails?.assignedAt
                            ).format("DD-MM-YYYY hh:mm A")
                            : "-"}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="w-full mt-3">
                    <Text className="text-gray-500 text-md ">
                      {t("issueImages")}
                    </Text>
                    <View className="flex-row flex-wrap gap-3">
                      {(ticketDetails.ticketImages ?? []).length > 0 ? (
                        ticketDetails.ticketImages?.map(
                          (uri: any, index: any) => (
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
                          )
                        )
                      ) : (
                        <Text>-</Text>
                      )}
                    </View>
                  </View>
                  <View className="flex mt-3">
                    <Text className="text-gray-500 text-md ">
                      {t("User Type")}
                    </Text>
                    <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                      {ticketDetails.userTypeDetails?.value ?? "-"}
                    </Text>
                  </View>
                  <View className="flex mt-3">
                    <Text className="text-gray-500 text-md ">
                      {t("Customer mobileNo ")}
                    </Text>
                    <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                      {ticketDetails.assetInUseDetails?.customerDetails
                        ?.mobileNumber ?? "-"}
                    </Text>
                  </View>
                  <View className="flex mt-3">
                    <Text className="text-gray-500 text-md ">
                      {t("Customer address")}
                    </Text>

                    <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                      {ticketDetails.assetInUseDetails?.customerDetails
                        ?.address ?? "-"}
                      ,{" "}
                      {ticketDetails.assetInUseDetails?.customerDetails
                        ?.areaDetails?.areaName ?? "-"}
                      ,{" "}
                      {ticketDetails.assetInUseDetails?.customerDetails
                        ?.areaDetails?.cityName ?? "-"}
                      ,{" "}
                      {ticketDetails.assetInUseDetails?.customerDetails
                        ?.areaDetails?.stateName ?? "-"}
                      ,{" "}
                      {ticketDetails.assetInUseDetails?.customerDetails
                        ?.areaDetails?.pincode ?? "-"}
                    </Text>
                  </View>
                  {/* Conditionally render Update Ticket Status section */}
                  {(ticketDetails.statusDetails?.value === "Opened" ||
                    ticketDetails.statusDetails?.value === "Assigned" ||
                    ticketDetails.statusDetails?.value === "InProgress" ||
                    ticketDetails.statusDetails?.value ==="Paid") && (
                      <View className="my-4">
                        <Text className="font-bold text-lg text-primary-950">
                          {t("updateTicketStatus")}
                        </Text>
                        <FormControl
                          isInvalid={
                            isFormFieldInValid("ticketStatus", errors).length > 0
                          }
                          className={`mt-4 `}
                        >
                          <PrimaryDropdownFormField
                            options={
                              getTicketStatusOptions(ticketDetails.statusDetails?.key, ticketDetails.userTypeDetails?.key)
                            }
                            selectedValue={selectTicketStatusOptions.value}
                            setSelectedValue={setSelectTicketStatusOptions}
                            type="ticketStatusOptionsState"
                            placeholder={t("selectStatus")}
                            fieldName="selectTicketStatusOptions"
                            label={t("status")}
                            canValidateField={canValidateField}
                            setCanValidateField={setCanValidateField}
                            setFieldValidationStatus={setFieldValidationStatus}
                            validateFieldFunc={setFieldValidationStatusFunc}
                            errors={errors}
                            setErrors={setErrors}
                            onSelect={handleSelectOption}
                          />
                          <FormControlError>
                            <FormControlErrorText>
                              {isFormFieldInValid("ticketStatus", errors)}
                            </FormControlErrorText>
                          </FormControlError>
                        </FormControl>

                        <FormControl
                          isInvalid={isFormFieldInValid("description", errors).length > 0}
                          className="mt-4">
                          <PrimaryTextareaFormField
                            fieldName="description"
                            label={t("description")}
                            placeholder={t("writeShortDescription")}
                            errors={errors}
                            setErrors={setErrors}
                            min={10}
                            max={200}
                            filterExp={/^[a-zA-Z0-9,.-/'#$& ]*$/}
                            canValidateField={canValidateField}
                            setCanValidateField={setCanValidateField}
                            setFieldValidationStatus={setFieldValidationStatus}
                            validateFieldFunc={setFieldValidationStatusFunc}
                            onChangeText={(e: any) => setDescription(e)}
                          />
                        </FormControl>
                        <FormControl
                          isInvalid={
                            isFormFieldInValid("assetImages", errors).length > 0}>
                          <HStack className="justify-between mt-2 mb-1">
                            <Text className="font-medium">
                              {t("assetImages")}{" "}
                            </Text>
                            <Text className="text-gray-500">
                              {assetImages.length}/3
                            </Text>
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
                                        setAssetImages((prev) => {
                                          prev.splice(index, 1);
                                          return [...prev];
                                        });
                                      }}
                                    >
                                      <AntDesign
                                        name="closecircle"
                                        size={16}
                                        color="white"
                                      />
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
                              <ButtonText className="text-black">
                                {t("addImage")}
                              </ButtonText>
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
                          <Text className="mt-1 mb-2 text-gray-500 text-sm">
                            {" "}
                            {t("enterOtpForOpenClose")}
                          </Text>
                          <PrimaryTextFormField
                            fieldName="customerOTP"
                            label={t("customerOtp")}
                            placeholder={t("enterCustomerOtp")}
                            errors={errors}
                            setErrors={setErrors}
                            min={4}
                            max={4}
                            isRequired={false}
                            keyboardType="phone-pad"
                            filterExp={/^[0-9]*$/}
                            canValidateField={canValidateField}
                            setCanValidateField={setCanValidateField}
                            setFieldValidationStatus={setFieldValidationStatus}
                            validateFieldFunc={setFieldValidationStatusFunc}
                            onChangeText={(e: string) => setOtp(e)}
                          />
                          <FormControlError>
                            <FormControlErrorText>
                              {isFormFieldInValid("otp", errors)}
                            </FormControlErrorText>
                          </FormControlError>
                        </FormControl>
                        <Button
                          className="bg-primary-950 rounded-md mt-6 h-12 mb-8"
                          onPress={() => {
                            if (isLoading) return;
                            updateTicketStatus();
                          }}>
                          <ButtonText >
                            {t("updateStatus")}
                          </ButtonText>
                          {isLoading && <ActivityIndicator color="white" className="ms-1" />}
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
