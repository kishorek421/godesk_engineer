import {
  Pressable,
  ScrollView,
  View,
  Image,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  FlatList,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import PrimaryText from "@/components/PrimaryText";
import React, { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { RatingModel, TicketListItemModel } from "@/models/tickets";
import apiClient from "@/clients/apiClient";
import {
  GET_CONFIGURATIONS_BY_CATEGORY,
  GET_TICKET_DETAILS,
  TICKET_UPLOADS,
  UPDATE_TICKET_STATUS,
  GET_ORDER_PRODUCTS_OF_TICKET,
} from "@/constants/api_endpoints";
import LoadingBar from "@/components/LoadingBar";
import TicketStatusComponent from "@/components/tickets/TicketStatusComponent";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";

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
  makeExotelCall,
  setErrorValue,
} from "@/utils/helper";
import ImagePickerComponent from "@/components/ImagePickerComponent";
import { ConfigurationModel } from "@/models/configurations";
import {
  ASSIGNED,
  PAYMENT_MODE,
  TICKET_IN_PROGRESS,
  TICKET_STATUS,
} from "@/constants/configuration_keys";
import moment from "moment";
import { ErrorModel, DropdownModel } from "@/models/common";
import PrimaryDropdownFormFieldWithCustomDropdown from "@/components/PrimaryDropdownFormField";
import PrimaryTextFormField from "@/components/PrimaryTextFormField";
import * as Location from "expo-location";
import FeatherIcon from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { HStack } from "@/components/ui/hstack";
import PrimaryTextareaFormField from "@/components/PrimaryTextareaFormField";

import { Axios, AxiosError } from "axios";
import { Icon } from "@/components/ui/icon";
import {
  OrderProductsForTicketModel,
  RazorPayOrderForTicket,
} from "@/models/payments";
import BasePage from "@/components/base/base_page";
import { primaryColor } from "@/constants/colors";
import ConfigurationDropdownFormField from "@/components/fields/ConfigurationDropdownFormField";
import { t } from "i18next";
import PrimaryButton from "@/components/PrimaryButton";
import { useToast } from "@/context/ToastContext";
import { TouchableWithoutFeedback } from "react-native";
import i18n from "@/i18n";

const TicketDetails = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const [errors, setErrors] = useState<ErrorModel[]>([]);
  const [otp, setOtp] = useState("");
  const [currentTime, setCurrentTime] = useState(
    moment().format("DD/MM/YYYY hh:mm:ss A")
  );

  const { ticketId } = useLocalSearchParams();
  const [ticketDetails, setTicketDetails] = useState<TicketListItemModel>({});
  const [selectedTicketStatus, setSelectedTicketStatus] =
    useState<ConfigurationModel>({});
  const [selectTicketStatusOptions, setSelectTicketStatusOptions] =
    useState<DropdownModel>({});
  const [assetImages, setAssetImages] = useState<string[]>([]);
  const bottomSheetRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [ticketStatusOptionsState, setTicketStatusOptions] = useState<
    ConfigurationModel[]
  >([]);
  const [description, setDescription] = useState<string>();
  const [expanded, setExpanded] = useState(false);
  const [pincode, setPincode] = useState<string | undefined>(undefined);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [canValidateField, setCanValidateField] = useState(false);
  const [fieldValidationStatus, setFieldValidationStatus] = useState<any>({});
  const [refreshing, setRefreshing] = React.useState(false);
  const [paymentProducts, setPaymentProducts] = useState<
    OrderProductsForTicketModel[]
  >([]);
  const [ratingDetailsMap, setRatingDetailsMap] = useState<RatingModel>({});
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const lng = i18n.language;
  const [selectedPaymentMode, setSelectedPaymentMode] =
    useState<ConfigurationModel>();
  const { showToast } = useToast();
  const setFieldValidationStatusFunc = (
    fieldName: string,
    isValid: boolean
  ) => {
    if (fieldValidationStatus[fieldName]) {
      fieldValidationStatus[fieldName](isValid);
    }
  };
  const fetchTicketDetails = async () => {
    console.log("ticketId ----------------------->", ticketId);

    setIsLoading(true);
    if (ticketId) {
      try {
        const response = await apiClient.get(
          GET_TICKET_DETAILS + `?ticketId=${ticketId}`
        );
        const ticketData = response.data.data ?? {};
        console.log("ticketData ~~~~~~~~~~~~~~~~~~~~~~~~", response.data.data);
        setTicketDetails(ticketData);
        getPaymentProducts();
        setPaymentProducts(ticketData.paymentProducts ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fetchRatingDetails = async () => {
    if (!ticketId) {
      console.warn("ticketId is not provided");
      setIsLoading(false);
      return;
    }

    console.log("Fetching rating for ticketId:", ticketId);
    setIsLoading(true);

    try {
      const response = await apiClient.get(
        `/rating/getByTicketId?ticketId=${ticketId}`
      );
      const ticketData: RatingModel[] = response.data.data ?? [];
      console.log("Rating data received:", ticketData);
      const map: Record<string, RatingModel> = {};
      ticketData.forEach((rating) => {
        if (rating.id) {
          map[rating.id] = rating;
        }
      });

      console.log("Rating details map:", map);
      setRatingDetailsMap(map);
      getPaymentProducts();
    } catch (e) {
      console.error("Error fetching rating details:", e);
      setRatingDetailsMap({});
    } finally {
      setIsLoading(false);
    }
  };

  const loadTicketStatus = async () => {
    try {
      const response = await apiClient.get(GET_CONFIGURATIONS_BY_CATEGORY, {
        params: { category: TICKET_STATUS },
      });
      console.log(
        "response.data?.data --- ticket status ----->>>> ",
        response.data?.data
      );
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
      let location: Location.LocationObject | null =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      if (!location) {
        location = await Location.getLastKnownPositionAsync({});
      }

      if (!location) {
        console.error("Could not fetch location coordinates");
        return;
      }
      const { latitude, longitude } = location.coords;

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
    fetchRatingDetails();
    loadTicketStatus();
    fetchPincode();

    const timer = setInterval(() => {
      setCurrentTime(moment().format("DD/MM/YYYY hh:mm:ss A"));
    }, 1000);

    return () => clearInterval(timer);
  }, [ticketId, navigation]);

  const handleSelectOption = async (option: string) => {
    console.log("Selected option:", option);
    const selectedTicketStatus =
      ticketStatusOptionsState.find((item) => item.key === option) ?? {};

    // Dynamically translate the label if available
    if (
      selectedTicketStatus &&
      selectedTicketStatus.value &&
      selectedTicketStatus.value
    ) {
      selectedTicketStatus.value = selectedTicketStatus.value;
    }
    console.log("selectedTicketStatus", selectedTicketStatus);
    setSelectedTicketStatus(selectedTicketStatus);
  };

  const toggleImagePicker = () => {
    setIsModalVisible(!isModalVisible);
    if (!isModalVisible) {
      (bottomSheetRef.current as any)?.show();
    } else {
      (bottomSheetRef.current as any)?.hide();
    }
  };
  const getPaymentProducts = () => {
    apiClient
      .get(GET_ORDER_PRODUCTS_OF_TICKET + `?ticketId=${ticketId}`)
      .then((response) => {
        const products = response.data?.data ?? [];
        setPaymentProducts(products);
        setIsLoading(false);
        console.log("paymentProducts state:", products); // Log to verify
      })
      .catch((e) => {
        console.error(e);
        setIsLoading(false);
      });
  };

  const updateTicketStatus = async () => {
    setErrors([]);
    setFieldValidationStatus({});
    setCanValidateField(true);
    const validationPromises = Object.keys(fieldValidationStatus).map(
      (key) =>
        new Promise((resolve) => {
          setFieldValidationStatus((prev: any) => ({
            ...prev,
            [key]: resolve,
          }));
        })
    );

    setCanValidateField(true);
    await Promise.all(validationPromises);

    const allValid = errors
      .map((error) => error.message?.length === 0)
      .every((status) => status === true);

    const currentErrors: any[] = [];

    const requiresImageOrOTP = [
      "IN_PROGRESS",
      "SPARE_REQUIRED",
      "CANNOT_RESOLVE",
      "WORK_COMPLETED",
      "TICKET_CLOSED",
    ];

    const requiresOtp = [
      "IN_PROGRESS",
      "SPARE_REQUIRED",
      "CANNOT_RESOLVE",
      "TICKET_CLOSED",
    ];

    const statusKey = selectedTicketStatus?.key ?? "";

    // Image validation
    if (assetImages.length === 0 && requiresImageOrOTP.includes(statusKey)) {
      currentErrors.push({
        param: "assetImages",
        message: "At least one asset image is required",
      });
    }

    if (requiresOtp.includes(statusKey) && !otp) {
      currentErrors.push({
        param: "customerOTP",
        message: "Pin is required for the selected status",
      });
    }
    if (!description) {
      currentErrors.push({
        param: "description",
        message: "Please enter a description",
      });
    }
    if (!selectedTicketStatus.key) {
      currentErrors.push({
        param: "selectTicketStatusOptions",
        message: "Please select a status",
      });
    }

    // Location
    if (!latitude || !longitude) {
      // Alert.alert("Location is required but couldn't be fetched. Please try again!");
    }

    // Pincode (optional error message based on your needs)
    if (!pincode) {
      // Alert.alert("Location is required but couldn't be fetched. Please try again!");
    }

    // Set all accumulated errors
    if (currentErrors.length > 0) {
      setErrors(currentErrors);
      return;
    }

    setIsLoading(true);

    try {
      let uploadedAssetImages: string[] = [];

      // Upload images
      if (assetImages.length > 0) {
        const formData = new FormData();
        assetImages.forEach((image) => {
          formData.append("assetImages", {
            uri: image,
            type: "image/jpeg",
            name: getFileName(image, true),
          } as unknown as Blob);
        });

        const uploadResponse = await apiClient.post(TICKET_UPLOADS, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        uploadedAssetImages = uploadResponse.data.data || [];
      }

      const requestBody = {
        ticketId,
        assignedTo: ticketDetails.lastAssignedToDetails?.assignedTo,
        toStatus: statusKey,
        location: { latitude, longitude },
        pincode,
        description,
        pin: requiresOtp.includes(statusKey) ? (otp ?? null) : null,
        assetImages: uploadedAssetImages,
        paymentMode:
          paymentMethod === "offline"
            ? "079d38fc-93a6-482d-8a99-ee600196cea8"
            : "cce2e5f5-340d-410a-9074-1ec72ace1e18",
      };
      console.log("Request Body for updating ticket status:", requestBody);
      const updateResponse = await apiClient.put(
        `${UPDATE_TICKET_STATUS}?ticketId=${ticketId}`,
        requestBody
      );

      if (updateResponse.status === 200) {
        showToast({
          position: "top",
          type: "success",
          message: "toast13",
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
      console.error("Failed to update ticket status.", error);

      if (error?.response?.data?.errors) {
        const responseErrors = error.response.data.errors;

        setErrors(responseErrors.filter((err: any) => err.param !== null));

        const genericMessages = responseErrors
          .filter((err: any) => err.param === null)
          .map((err: any) => err.message)
          .join("\n");

        if (genericMessages) {
          showToast({
            position: "top",
            type: "success",
            message: genericMessages,
          });
        }
      } else {
        showToast({
          position: "top",
          type: "error",
          message: error.response?.data?.message || "toast19",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getTicketStatusOptions = (
    statusKey?: string,
    customerTypeKey?: string,
    paymentModeKey?: string
  ): (string | { label: any; value: any })[] => {
    if (statusKey === ASSIGNED) {
      return [
        { value: "OPENED", label: "Open" },
        {
          value: "CUSTOMER_NOT_AVAILABLE",
          label: "Customer not available",
        },
      ];
    }
    if (statusKey === "OPENED") {
      return [
        {
          value: "IN_PROGRESS",
          label: "InProgress",
        },
        {
          value: "CUSTOMER_NOT_AVAILABLE",
          label: "Customer not available",
        },
      ];
    }
    if (statusKey === "IN_PROGRESS") {
      if (customerTypeKey === "B2C_USER") {
        return [
          {
            value: "WORK_COMPLETED",
            label: "Work Completed",
          },
          { value: "SPARE_REQUIRED", label: "Spare Required" },
          { value: "CANNOT_RESOLVE", label: "Cannot Resolve" },
        ];
      } else {
        return [
          {
            value: "TICKET_CLOSED",
            label: "Close",
          },
          { value: "SPARE_REQUIRED", label: "Spare Required" },
          { value: "CANNOT_RESOLVE", label: "Cannot Resolve" },
        ];
      }
    }
    if (statusKey === "PAID") {
      if (customerTypeKey === "B2C_USER") {
        return [
          {
            value: "TICKET_CLOSED",
            label: "Close",
          },
        ];
      }
    }
    if (statusKey === "WORK_COMPLETED") {
      if (customerTypeKey === "B2C_USER" && paymentModeKey === "CASH") {
        return [
          {
            value: "TICKET_CLOSED",
            label: "Close",
          },
        ];
      }
    }
    return [];
  };
  const onRefresh = () => {
    setRefreshing(true);
    fetchTicketDetails().finally(() => setRefreshing(false));
  };

  const getTicketSpares = (listOfProducts: OrderProductsForTicketModel[]) => {
    return listOfProducts
      .map((item) => ({
        ...item,
        itemDetails: item.itemDetails?.filter(
          (detail: any) => detail.productTypeDetails?.key === "TICKET_SPARES"
        ),
      }))
      .filter((item) => item.itemDetails.length > 0);
  };
  const getSparesComponent = (products: OrderProductsForTicketModel[]) => {
    if (products.length === 0) {
      return <PrimaryText className="text-gray-700">-</PrimaryText>;
    }
    return products.map((item) => {
      const productNames = item?.itemDetails
        .map((detail: any) => detail.productDetails?.name || "Unknown Product")
        .join(", ");
      return (
        <View
          key={item.id}
          className="flex-row justify-between w-full items-center"
        >
          <View className="flex-row flex-wrap">
            <PrimaryText className="text-gray-900 text-sm">
              {productNames}
            </PrimaryText>
            {item.modelName && (
              <>
                <PrimaryText className="text-primary-950 text-sm">
                  :- Model Name:{" "}
                </PrimaryText>
                <PrimaryText className="text-secondary-950 text-sm">
                  {item.modelName}
                </PrimaryText>
              </>
            )}
            {item.partNumber && (
              <>
                <PrimaryText className="text-primary-950 text-sm">
                  , Item Part-No:{" "}
                </PrimaryText>
                <PrimaryText className="text-secondary-950 text-sm">
                  {item.partNumber}
                </PrimaryText>
              </>
            )}
            <PrimaryText className="text-gray-900 text-sm">
              {" "}
              (x{item.quantity})
            </PrimaryText>
          </View>
        </View>
      );
    });
  };
  return isLoading ? (
    <LoadingBar />
  ) : (
    <BasePage>
      <View className="bg-white">
        {/* <Pressable
          onPress={() => {
            router.push({
              pathname: "../home",
              params: {
                refresh: "true",
              },
            });
          }}
        >
          <View className="flex-row items-center bg-white h-14 px-4">
            <View className="flex-row items-center flex-1">
              <MaterialIcons name="arrow-back-ios" size={20} color="black" />
            </View>
            <View className="flex-1">
              <PrimaryText className="font-semibold text-lg text-center">
              Ticket Details
              </PrimaryText>
            </View>
            <View className="flex-1"></View>
          </View>
        </Pressable> */}
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          className="bg-white h-full"
        >
          <View className="flex-1 bg-gray-100 mb-8 h-full">
            <View className="p-4">
              {/* <Button
                  onPress={() =>
                    showToast({
                      position: 'top',
                      backgroundColor: "#ff00ff",
                      message:
                        "Hello! This is a toast message.Hello! .",
                    })
                  }
                >
                  <ButtonText>Show Toast</ButtonText>
                </Button> */}
              <View className="w-full bg-white px-3 py-3 rounded-lg">
                <View className="flex">
                  <View className="flex-row justify-between w-full">
                    <View className="flex-1">
                      <PrimaryText className="text-tertiary-950 leading-5  font-bold-1">
                        {ticketDetails?.ticketNo ?? "-"}
                      </PrimaryText>
                      <TouchableWithoutFeedback
                        onPress={() => setExpanded(!expanded)}
                      >
                        <PrimaryText
                          className="mt-[1px] text-[13px] text-gray-900 font-regular"
                          translate={lng === "en" ? "local" : "api"}
                          numberOfLines={expanded ? undefined : 4}
                          ellipsizeMode="tail"
                        >
                          {`${t("issueIn")}: ${
                            Array.isArray(ticketDetails.issueTypeDetails) &&
                            ticketDetails.issueTypeDetails.length > 0
                              ? ticketDetails.issueTypeDetails
                                  .map((item) => item?.name)
                                  .filter(Boolean)
                                  .join(", ")
                              : "-"
                          }`}
                        </PrimaryText>
                      </TouchableWithoutFeedback>
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
                        <PrimaryText className="text-gray-500 font-regular text-md ">
                          raisedBy
                        </PrimaryText>
                        <PrimaryText className="text-md text-gray-900 leading-5 font-semibold  mt-[2px]">
                          {ticketDetails?.customerDetails?.firstName ?? "-"}{" "}
                          {ticketDetails?.customerDetails?.lastName ?? ""}
                        </PrimaryText>
                      </View>
                      <View className="flex items-end">
                        <PrimaryText className="text-gray-500 font-regular text-md ">
                          raisedAt
                        </PrimaryText>
                        <PrimaryText className="text-md text-gray-900 leading-5 font-semibold  mt-[2px]">
                          {ticketDetails.createdAt
                            ? moment(ticketDetails.createdAt).format(
                                "DD-MM-YYYY hh:mm a"
                              )
                            : "-"}
                        </PrimaryText>
                      </View>
                    </View>
                  </View>
                  <View className="w-full mt-3">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <PrimaryText className="text-gray-500 font-regular text-md ">
                          serialNo
                        </PrimaryText>
                        <PrimaryText className="text-md text-gray-900 font-semibold leading-5  mt-[2px]">
                          {ticketDetails?.assetInUseDetails?.serialNo ?? "-"}
                        </PrimaryText>
                      </View>
                      <View className="flex items-end">
                        <PrimaryText className="text-gray-500 text-md font-regular">
                          assetType
                        </PrimaryText>
                        <PrimaryText
                          className="text-md text-gray-900 font-semibold leading-5 mt-[2px]"
                          translate={lng === "en" ? "local" : "api"}
                        >
                          {ticketDetails.assetInUseDetails?.assetMasterDetails
                            ?.assetTypeDetails?.name ?? "-"}
                        </PrimaryText>
                      </View>
                    </View>
                  </View>
                  <View className="w-full mt-3">
                    <View className="flex-row items-center justify-between">
                      <View className="flex">
                        <PrimaryText className="text-gray-500 font-regular text-md ">
                          userType
                        </PrimaryText>
                        <PrimaryText className="text-md text-gray-900 font-semibold leading-5 mt-[2px]">
                          {ticketDetails.userTypeDetails?.value ?? "-"}
                        </PrimaryText>
                      </View>
                      <View className="flex items-end">
                        <PrimaryText className="text-gray-500 text-md font-regular ">
                          serviceType
                        </PrimaryText>
                        <PrimaryText
                          className="text-md text-gray-900 font-semibold leading-5 mt-[2px]"
                          translate={lng === "en" ? "local" : "api"}
                        >
                          {ticketDetails.serviceTypeDetails?.value ?? "-"}
                        </PrimaryText>
                      </View>
                    </View>
                  </View>
                  <View className="w-full mt-3">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <PrimaryText className="text-gray-500 font-regular text-md ">
                          assetModel
                        </PrimaryText>
                        <View className="flex-row">
                          <PrimaryText className="text-md text-gray-900 font-semibold leading-5  ">
                            {ticketDetails?.assetInUseDetails
                              ?.assetMasterDetails?.assetModelDetails
                              ?.modelName ?? "-"}{" "}
                          </PrimaryText>
                          <PrimaryText className="text-md text-gray-900 font-semibold leading-5 ">
                            (
                            {ticketDetails?.assetInUseDetails
                              ?.assetMasterDetails?.assetModelDetails
                              ?.modelNumber ?? "-"}
                            )
                          </PrimaryText>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="flex mt-3">
                    <PrimaryText className="text-gray-500 text-md font-regular ">
                      assignedAt
                    </PrimaryText>
                    <PrimaryText className="text-md text-gray-900 font-semibold leading-5 mt-[2px]">
                      {ticketDetails.lastAssignedToDetails?.assignedAt
                        ? moment(
                            ticketDetails.lastAssignedToDetails?.assignedAt
                          ).format("DD-MM-YYYY hh:mm A")
                        : "-"}
                    </PrimaryText>
                  </View>
                  <View className="flex mt-3">
                    <PrimaryText className="text-gray-500 font-regular text-md ">
                      Description
                    </PrimaryText>
                    <PrimaryText
                      className="text-md text-gray-900 font-semibold leading-5 mt-[2px]"
                      translate={lng === "en" ? "local" : "api"}
                    >
                      {ticketDetails?.description ?? "-"}
                    </PrimaryText>
                  </View>
                  <View className="flex mt-3">
                    <PrimaryText className="text-gray-500 font-regular text-md">
                      customerMobileNo
                    </PrimaryText>

                    <View className="flex-row text-center items-center">
                      <FeatherIcon
                        className="mt-[2px]"
                        name="phone"
                        size={16}
                        color={primaryColor}
                      />

                      <Pressable
                        onPress={() => {
                          const lastAssignedNumber =
                            ticketDetails.lastAssignedToDetails?.phoneNumber ??
                            "";
                          const customerMobile =
                            ticketDetails.assetInUseDetails?.customerDetails
                              ?.mobileNumber ?? "";

                          if (lastAssignedNumber && customerMobile) {
                            makeExotelCall(
                              // From
                              customerMobile,
                              lastAssignedNumber,
                              ({ position, type, message }) => {
                                showToast({
                                  position: position || "top",
                                  type: "success",
                                  message: "call Requested Successfully",
                                });
                                console.log("Toast shown:", {
                                  position,
                                  type,
                                  message,
                                });
                              }
                            );
                          } else {
                            showToast({
                              position: "top",
                              type: "error",
                              message: "mobile Number Not Found",
                            });
                          }
                        }}
                      >
                        <PrimaryText className="text-md text-primary-950 text-center font-semibold mt-[2px] ms-1">
                          08047096559
                        </PrimaryText>
                      </Pressable>
                    </View>
                  </View>

                  <View className="flex mt-3">
                    <PrimaryText className="text-gray-500 text-md font-regular">
                      customerAddress
                    </PrimaryText>
                    <PrimaryText className="text-md text-gray-900 font-semibold  mt-[2px] leading-5">
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
                    </PrimaryText>
                  </View>
                  <View className="w-full mt-3">
                    <PrimaryText className="text-gray-500 text-md font-regular">
                      issueImages
                    </PrimaryText>
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
                        <PrimaryText className="">-</PrimaryText>
                      )}
                    </View>
                  </View>
                  {paymentProducts?.length > 0 && (
                    <View className="flex mt-4">
                      <PrimaryText className="text-gray-500 text-md font-regular">
                        Spare Details
                      </PrimaryText>
                      <View className="">
                        {paymentProducts && paymentProducts.length > 0 ? (
                          getSparesComponent(getTicketSpares(paymentProducts))
                        ) : (
                          <PrimaryText className="text-gray-700">-</PrimaryText>
                        )}
                      </View>
                    </View>
                  )}

                  {ticketDetails?.statusDetails?.key === "TICKET_CLOSED" &&
                  ratingDetailsMap &&
                  Object.values(ratingDetailsMap).length > 0 ? (
                    <View className="flex mt-4">
                      <View className="border-dashed border-[1px] border-gray-300 h-[1px] mt-1 mb-3 w-full" />
                      <PrimaryText className=" text-lg font-semibold text-primary-950">
                        User Rating
                      </PrimaryText>

                      <View className="flex-row mt-2 items-center">
                        <PrimaryText className="text-gray-500 text-md font-regular">
                          Rating:{" "}
                        </PrimaryText>
                        {[...Array(5)].map((_, index) => (
                          <MaterialIcons
                            key={index}
                            name={
                              index <
                              (Object.values(ratingDetailsMap)[0]?.value || 0)
                                ? "star"
                                : "star-border"
                            }
                            size={24}
                            color={
                              index <
                              (Object.values(ratingDetailsMap)[0]?.value || 0)
                                ? "#FFD700"
                                : "#D3D3D3"
                            }
                            style={{ marginRight: 2 }}
                          />
                        ))}
                      </View>
                      <View className="flex-row mt-2 items-center">
                        <PrimaryText className="text-gray-500 text-md font-regular">
                          Description:{" "}
                        </PrimaryText>
                        <PrimaryText className="text-md text-gray-900 font-semibold leading-5">
                          {Object.values(ratingDetailsMap)[0]?.description ||
                            "-"}
                        </PrimaryText>
                      </View>
                      <View className="flex-row mt-2 items-center">
                        <PrimaryText className="text-gray-500 text-md font-regular">
                          Feedback:{" "}
                        </PrimaryText>
                        <PrimaryText className="text-md text-gray-900 font-semibold flex-1 flex-wrap">
                          {Object.values(ratingDetailsMap)[0]?.feedback || "-"}
                        </PrimaryText>
                      </View>
                    </View>
                  ) : null}

                  {/* {ticketDetails.userTypeDetails?.key === "B2C_USER" &&
                    <View className="flex mt-3">
                      <PrimaryText className="text-gray-500 font-regular text-md ">
                        paymentMode
                      </PrimaryText>
                      <PrimaryText className="text-md text-gray-900 font-semibold leading-5 mt-[2px]">
                        {ticketDetails?.paymentModeDetails?.value ?? "-"}
                      </PrimaryText>
                    </View>} */}
                  {/* Conditionally render Update Ticket Status section */}
                  {(ticketDetails.statusDetails?.value === "Opened" ||
                    ticketDetails.statusDetails?.value === "Assigned" ||
                    ticketDetails.statusDetails?.value === "InProgress" ||
                    // (ticketDetails.statusDetails?.key === "WORK_COMPLETED" && ticketDetails.paymentModeDetails?.key !== "CASH") ||
                    ticketDetails.statusDetails?.value === "Paid") && (
                    <View className="my-4">
                      <PrimaryText className="font-semibold text-lg text-primary-950">
                        updateTicketStatus
                      </PrimaryText>
                      {/* {ticketDetails.userTypeDetails?.key === "B2C_USER" &&
                        ticketDetails.statusDetails?.key === "IN_PROGRESS" && (
                          <View className="mt-4">
                            <PrimaryText className="font-medium text-md">
                              paymentMethod
                            </PrimaryText>
                            <View className="flex-row mt-2">
                              <Pressable
                                className="flex-row items-center mr-4"
                                onPress={() =>
                                  setPaymentMethod(
                                    paymentMethod === "offline" ? "" : "offline")}
                              >
                                <View
                                  className={`w-5 h-5 rounded-sm border-2 ${
                                    paymentMethod === "offline"
                                      ? "border-primary-950"
                                      : "border-gray-400"
                                  } flex items-center justify-center`}
                                >
                                  {paymentMethod === "offline" && (
                                    <View className="w-3 h-3 rounded-sm bg-primary-950" />
                                  )}
                                </View>
                                <PrimaryText className="ml-2 text-md text-gray-900">
                                payOnCash
                                </PrimaryText>
                              </Pressable>
                            </View>
                          </View>
                        )} */}

                      <PrimaryDropdownFormFieldWithCustomDropdown
                        className="my-3"
                        options={getTicketStatusOptions(
                          ticketDetails.statusDetails?.key,
                          ticketDetails.userTypeDetails?.key,
                          ticketDetails.paymentModeDetails?.key
                        )}
                        selectedValue={selectedTicketStatus?.key || ""}
                        setSelectedValue={(value: string) => {
                          const selectedOption =
                            ticketStatusOptionsState.find(
                              (item) => item.key === value
                            ) || {};
                          setSelectedTicketStatus(selectedOption);
                        }}
                        type="ticketStatusOptionsState"
                        placeholder="selectStatus"
                        fieldName="selectTicketStatusOptions"
                        label="status"
                        canValidateField={canValidateField}
                        setCanValidateField={setCanValidateField}
                        setFieldValidationStatus={setFieldValidationStatus}
                        validateFieldFunc={setFieldValidationStatusFunc}
                        errors={errors}
                        setErrors={setErrors}
                        onSelect={handleSelectOption}
                      />

                      <PrimaryTextareaFormField
                        className="my-3"
                        fieldName="description"
                        label="Description"
                        placeholder="writeShortDescription"
                        errors={errors}
                        setErrors={setErrors}
                        min={10}
                        max={200}
                        filterExp={/^[a-zA-Z0-9 \/#.,-/'&$]*$/}
                        defaultValue={description}
                        canValidateField={canValidateField}
                        setCanValidateField={setCanValidateField}
                        setFieldValidationStatus={setFieldValidationStatus}
                        validateFieldFunc={setFieldValidationStatusFunc}
                        onChangeText={(value: any) => setDescription(value)}
                      />

                      <FormControl
                        isInvalid={
                          isFormFieldInValid("assetImages", errors).length > 0
                        }
                        className="mb-2"
                      >
                        <HStack className="justify-between mt-2 mb-1">
                          <PrimaryText className="font-medium">
                            {t("assetImages")}{" "}
                            {[
                              "IN_PROGRESS",
                              "SPARE_REQUIRED",
                              "CANNOT_RESOLVE",
                              "TICKET_CLOSED",
                              "WORK_COMPLETED",
                            ].includes(selectedTicketStatus.key ?? "") && (
                              <PrimaryText className="text-red-500 font-regular">
                                *
                              </PrimaryText>
                            )}
                          </PrimaryText>

                          <PrimaryText
                            className="text-gray-500 font-regular"
                            translate="none"
                          >
                            {assetImages.length}/3
                          </PrimaryText>
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
                                      name="close-circle"
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
                            className="bg-primary-200 mt-4 rounded-lg items-center justify-center"
                            onPress={() => toggleImagePicker()}
                          >
                            <FeatherIcon
                              name="plus-circle"
                              className="me-1"
                              color={primaryColor}
                              size={15}
                            />
                            <ButtonText className="text-primary-950 text-sm">
                              <PrimaryText>addImage</PrimaryText>
                            </ButtonText>
                          </Button>
                        )}
                        <FormControlError className="mt-2">
                          <FormControlErrorText>
                            {assetImages.length > 0
                              ? ""
                              : isFormFieldInValid("assetImages", errors)}
                          </FormControlErrorText>
                        </FormControlError>
                      </FormControl>

                      <PrimaryText className="mt-1 mb-2 text-gray-500 text-sm font-regular">
                        enterOtpForOpenClose
                      </PrimaryText>
                      {[
                        "IN_PROGRESS",
                        "SPARE_REQUIRED",
                        "CANNOT_RESOLVE",
                        "TICKET_CLOSED",
                      ].includes(selectedTicketStatus?.key ?? "") && (
                        <View>
                          <PrimaryTextFormField
                            fieldName="customerOTP"
                            label="customerOtp"
                            placeholder="enterCustomerOtp"
                            errors={errors}
                            setErrors={setErrors}
                            min={4}
                            max={4}
                            defaultValue={otp}
                            isRequired={[
                              "IN_PROGRESS",
                              "SPARE_REQUIRED",
                              "CANNOT_RESOLVE",
                              "TICKET_CLOSED",
                            ].includes(selectedTicketStatus?.key ?? "")}
                            keyboardType="phone-pad"
                            filterExp={/^[0-9]*$/}
                            canValidateField={canValidateField}
                            setCanValidateField={setCanValidateField}
                            setFieldValidationStatus={setFieldValidationStatus}
                            validateFieldFunc={setFieldValidationStatusFunc}
                            onChangeText={(value: string) => setOtp(value)}
                          />
                        </View>
                      )}
                      {/* /* {ticketDetails.userTypeDetails?.key === "B2C_USER" &&
                          <ConfigurationDropdownFormField
                            className="my-3"
                            configurationCategory={PAYMENT_MODE}
                            placeholder="Select payment mode"
                            label="paymentMode"
                            errors={errors}
                            setErrors={setErrors}
                            fieldName="paymentMode"
                            canValidateField={canValidateField}
                            setCanValidateField={setCanValidateField}
                            setFieldValidationStatus={setFieldValidationStatus}
                            validateFieldFunc={setFieldValidationStatusFunc}
                            defaultValue={selectedPaymentMode}
                            onItemSelect={(config) => {
                              console.log("config", config);
                              setSelectedPaymentMode(config);
                            }}
                            isRequired={false}
                            defaultKey={ticketDetails?.paymentModeDetails?.key ?? "ONLINE"}
                            isDisabled={
                              ticketDetails?.statusDetails?.key !== "IN_PROGRESS"
                            }
                          />
                        } */}
                      <PrimaryButton
                        isLoading={isLoading}
                        onPress={updateTicketStatus}
                        btnText="updateStatus"
                      />
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
                showToast({
                  type: "error",
                  // position:"top",
                  message: "toast14",
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
    </BasePage>
  );
};

export default TicketDetails;
