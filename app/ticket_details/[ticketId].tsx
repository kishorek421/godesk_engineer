import {
  Pressable,
  ScrollView,
  View,
  Image,
  SafeAreaView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Entypo,
  FontAwesome6,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import PrimaryText from "@/components/PrimaryText";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import {
  bytesToMB,
  getFileName,
  isFormFieldInValid,
  makeExotelCall,
  setErrorValue,
} from "@/utils/helper";
import ImagePickerComponent from "@/components/ImagePickerComponent";
import { ConfigurationModel } from "@/models/configurations";
import { ASSIGNED } from "@/constants/configuration_keys";
import moment from "moment";
import { ErrorModel } from "@/models/common";
import PrimaryDropdownFormFieldWithCustomDropdown from "@/components/PrimaryDropDownFormCustom";
import PrimaryTextFormField from "@/components/PrimaryTextFormField";
import * as Location from "expo-location";
import FeatherIcon from "@expo/vector-icons/Feather";
import { HStack } from "@/components/ui/hstack";
import PrimaryTextareaFormField from "@/components/PrimaryTextareaFormField";
import { OrderProductsForTicketModel } from "@/models/payments";
import { primaryColor } from "@/constants/colors";
import PrimaryButton from "@/components/PrimaryButton";
import { useToast } from "@/context/ToastContext";
import { TouchableWithoutFeedback } from "react-native";
import i18n from "@/i18n";
import { useHeaderHeight } from "@react-navigation/elements";
import useRefresh from "@/hooks/useRefresh";
import { t } from "i18next";
import { Button, ButtonText } from "@/components/ui/button";

const TicketDetails = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const [errors, setErrors] = useState<ErrorModel[]>([]);
  const [otp, setOtp] = useState("");
  const { ticketId } = useLocalSearchParams();
  const [ticketDetails, setTicketDetails] = useState<TicketListItemModel>({});
  const [assetImages, setAssetImages] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [expanded, setExpanded] = useState(false);
  const [pincode, setPincode] = useState<string | undefined>(undefined);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [canValidateField, setCanValidateField] = useState(false);
  const [fieldValidationStatus, setFieldValidationStatus] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);
  const [paymentProducts, setPaymentProducts] = useState<
    OrderProductsForTicketModel[]
  >([]);
  const [ratingDetailsMap, setRatingDetailsMap] = useState<RatingModel>({});
  const [acknowledged, setAcknowledged] = useState(false);
  const { showToast } = useToast();
  const { triggerRefresh } = useRefresh();

  // NEW: This is the selected status key used by the dropdown and API
  const [selectedStatusKey, setSelectedStatusKey] = useState<string>("");
  type BottomSheetRef = {
    show: () => void;
    hide: () => void;
  };
  const bottomSheetRef = useRef<BottomSheetRef | null>(null);
  const lng = i18n.language;
  const headerHeight = useHeaderHeight?.() ?? 0;
  const keyboardVerticalOffset = Platform.OS === "ios" ? headerHeight + 8 : 0;

  const setFieldValidationStatusFunc = useCallback(
    (fieldName: string, isValid: boolean) => {
      if (fieldValidationStatus[fieldName]) {
        fieldValidationStatus[fieldName](isValid);
      }
    },
    [fieldValidationStatus]
  );

  const formatTimeSlot = (slot: string) => {
    if (!slot) return "";
    if (slot.includes("-")) {
      const [start, end] = slot.split("-");
      const formattedStart = moment(start.trim(), "HH:mm").format("hh:mm A");
      const formattedEnd = moment(end.trim(), "HH:mm").format("hh:mm A");
      return `${formattedStart} - ${formattedEnd}`;
    }
    return moment(slot.trim(), "HH:mm").format("hh:mm A");
  };

  // Dynamic status options based on current ticket status
  const getTicketStatusOptions = (
    statusKey?: string,
    customerTypeKey?: string,
    paymentModeKey?: string
  ): { label: string; value: string; requiresAcknowledgment?: boolean }[] => {
    if (statusKey === ASSIGNED) {
      return [
        { value: "OPENED", label: "Open" },
        { value: "CUSTOMER_NOT_AVAILABLE", label: "Customer not available" },
      ];
    }
    if (statusKey === "OPENED") {
      return [
        { value: "IN_PROGRESS", label: "In Progress" },
        { value: "CUSTOMER_NOT_AVAILABLE", label: "Customer not available" },
        {
          value: "CUSTOMER_NOT_RESPONDING",
          label: "Customer not responding",
          requiresAcknowledgment: true,
        },
      ];
    }
    if (statusKey === "IN_PROGRESS") {
      if (customerTypeKey === "B2C_USER") {
        return [
          { value: "WORK_COMPLETED", label: "Work Completed" },
          { value: "SPARE_REQUIRED", label: "Spare Required" },
          { value: "CANNOT_RESOLVE", label: "Cannot Resolve & Close Ticket" },
          {
            value: "TRANSFER_TO_OTHER",
            label: "Transfer To Another Engineer",
            requiresAcknowledgment: true,
          },
        ];
      } else {
        return [
          { value: "TICKET_CLOSED", label: "Close" },
          { value: "SPARE_REQUIRED", label: "Spare Required" },
          { value: "CANNOT_RESOLVE", label: "Cannot Resolve" },
        ];
      }
    }
    if (statusKey === "PAID" && customerTypeKey === "B2C_USER") {
      return [{ value: "TICKET_CLOSED", label: "Close" }];
    }
    if (
      statusKey === "WORK_COMPLETED" &&
      customerTypeKey === "B2C_USER" &&
      paymentModeKey === "CASH"
    ) {
      return [{ value: "TICKET_CLOSED", label: "Close" }];
    }
    return [];
  };

  const statusOptions = useMemo(() => {
    return getTicketStatusOptions(
      ticketDetails.statusDetails?.key,
      ticketDetails.userTypeDetails?.key,
      ticketDetails.paymentModeDetails?.key
    );
  }, [
    ticketDetails.statusDetails?.key,
    ticketDetails.userTypeDetails?.key,
    ticketDetails.paymentModeDetails?.key,
  ]);

  const fetchTicketDetails = async () => {
    if (!ticketId) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get(
        GET_TICKET_DETAILS + `?ticketId=${ticketId}`
      );
      const ticketData = response.data?.data;
      if (ticketData) {
        setTicketDetails(ticketData);
        setPaymentProducts(ticketData.paymentProducts ?? []);
      }
    } catch (e) {
      console.error("Error fetching ticket details:", e);
      setTimeout(fetchTicketDetails, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRatingDetails = async () => {
    if (!ticketId) return;
    try {
      const response = await apiClient.get(
        `/rating/getByTicketId?ticketId=${ticketId}`
      );
      const ratings: RatingModel[] = response.data.data ?? [];
      const map: Record<string, RatingModel> = {};
      ratings.forEach((r) => r.id && (map[r.id] = r));
      setRatingDetailsMap(map);
    } catch (e) {
      console.error("Error fetching rating:", e);
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
    } catch (error) {
      console.error("Error fetching pincode:", error);
    }
  };

  useEffect(() => {
    navigation.setOptions({ headerLeftContainerStyle: { paddingStart: 10 } });
    fetchTicketDetails();
    fetchRatingDetails();
    fetchPincode();
  }, [ticketId]);
  const toggleImagePicker = () => {
    setIsModalVisible(!isModalVisible);
    if (!isModalVisible) {
      bottomSheetRef.current?.show();
    } else {
      bottomSheetRef.current?.hide();
    }
  };

  const updateTicketStatus = async () => {
    // Reset errors first
    setErrors([]);

    // Manually validate all required fields (simpler & more reliable)
    const currentErrors: ErrorModel[] = [];

    const requiresImage = [
      "IN_PROGRESS",
      "SPARE_REQUIRED",
      "CANNOT_RESOLVE",
      "WORK_COMPLETED",
      "TICKET_CLOSED",
    ].includes(selectedStatusKey);
    const requiresOtp = [
      "IN_PROGRESS",
      "SPARE_REQUIRED",
      "CANNOT_RESOLVE",
      "TICKET_CLOSED",
      "TRANSFER_TO_OTHER",
    ].includes(selectedStatusKey);
    const requiresAcknowledgment = [
      "CUSTOMER_NOT_RESPONDING",
      "TRANSFER_TO_OTHER",
    ].includes(selectedStatusKey);

    if (!selectedStatusKey) {
      currentErrors.push({
        param: "selectTicketStatusOptions",
        message: "Please select a status",
      });
    }

    if (!description?.trim()) {
      currentErrors.push({
        param: "description",
        message: "Comments are required",
      });
    }

    if (requiresImage && assetImages.length === 0) {
      currentErrors.push({
        param: "assetImages",
        message: "At least one asset image is required",
      });
    }

    if (requiresOtp && !otp.trim()) {
      currentErrors.push({
        param: "customerOTP",
        message: "Pin is required for the selected status",
      });
    }

    if (requiresAcknowledgment && !acknowledged) {
      currentErrors.push({
        param: "acknowledgmentId",
        message: "Please acknowledge this action by checking the box",
      });
    }

    // If any errors, show them and STOP
    if (currentErrors.length > 0) {
      setErrors(currentErrors);
      // showToast({
      //   position: "top",
      //   type: "error",
      //   message: "Please fix the errors above",
      // });
      return;
    }

    // If all good → proceed with API call
    setIsLoading(true);

    try {
      let uploadedAssetImages: string[] = [];

      if (assetImages.length > 0) {
        const formData = new FormData();
        assetImages.forEach((image) => {
          formData.append("assetImages", {
            uri: image,
            type: "image/jpeg",
            name: getFileName(image, true),
          } as any);
        });

        const uploadResponse = await apiClient.post(TICKET_UPLOADS, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedAssetImages = uploadResponse.data.data || [];
      }

      const requestBody = {
        ticketId,
        assignedTo: ticketDetails.lastAssignedToDetails?.assignedTo,
        toStatus: selectedStatusKey,
        location: { latitude, longitude },
        pincode,
        description: description?.trim(),
        pin: requiresOtp ? otp.trim() : null,
        assetImages: uploadedAssetImages,
        paymentMode: "cce2e5f5-340d-410a-9074-1ec72ace1e18", // or your logic
      };

      console.log("Updating ticket with:", requestBody);

      const updateResponse = await apiClient.put(
        `${UPDATE_TICKET_STATUS}?ticketId=${ticketId}`,
        requestBody
      );

      showToast({
        position: "top",
        type: "success",
        message: "Status updated successfully!",
      });

      await fetchTicketDetails();
      triggerRefresh();
      router.back();
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchTicketDetails().finally(() => setRefreshing(false));
  };

  const getTicketSpares = (list: OrderProductsForTicketModel[]) => {
    return list
      .map((item) => ({
        ...item,
        itemDetails: item.itemDetails?.filter(
          (d: any) => d.productTypeDetails?.key === "TICKET_SPARES"
        ),
      }))
      .filter((item) => item.itemDetails?.length);
  };

  const getSparesComponent = (products: OrderProductsForTicketModel[]) => {
    if (products.length === 0)
      return <PrimaryText className="text-gray-700">-</PrimaryText>;
    return products.map((item) => {
      const names = item?.itemDetails
        ?.map((d: any) => d.productDetails?.name || "Unknown")
        .join(", ");
      return (
        <View
          key={item.id}
          className="flex-row justify-between w-full items-center"
        >
          <View className="flex-row flex-wrap">
            <PrimaryText className="text-gray-900 text-sm">{names}</PrimaryText>
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
  useEffect(() => {
    if (selectedStatusKey) {
      setErrors((prevErrors) =>
        prevErrors.filter((e) => e.param !== "selectTicketStatusOptions")
      );
    }
  }, [selectedStatusKey]);
  return isLoading ? (
    <LoadingBar />
  ) : (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "position" : "height"} // try "position" on iOS if padding causes jumpiness
      style={{ flex: 1 }}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} // allows ScrollView to scroll to bottom
        keyboardShouldPersistTaps="handled" // very important so taps on inputs work
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-1 bg-gray-100 mb-8 h-full">
          <View className="p-4">
            <View className="w-full bg-white px-3 py-3 rounded-lg">
              {ticketDetails?.subStatusDetails?.description && (
                <View className="mt-2 rounded-xl border border-secondary-950 bg-secondary-100 p-3 mb-4">
                  <View className="flex-row items-start">
                    <Entypo name="info-with-circle" size={18} color="#FFAA00" />

                    <PrimaryText className="text-[#7A5600] text-sm ml-2 flex-1 leading-5">
                      {ticketDetails?.subStatusDetails?.description}
                    </PrimaryText>
                  </View>
                </View>
              )}

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

                <View className="border-dashed border-[1px] border-gray-300 h-[1px]  mb-1 w-full" />
                {ticketDetails?.timeSlot &&
                  ["ASSIGNED", "OPENED"].includes(
                    ticketDetails.statusDetails?.key ?? ""
                  ) && (
                    <View className="mt-3 w-full mb-2">
                      <View
                        className="rounded-xl p-3"
                        style={{ backgroundColor: "#FEF3C7" }}
                      >
                        <View className="flex-row items-center gap-2">
                          <FontAwesome6
                            name="clock"
                            size={16}
                            color="#92400E"
                          />
                          <PrimaryText
                            className="text-[#92400E] text-sm"
                            translate="none"
                          >
                            Scheduled on
                          </PrimaryText>
                        </View>
                        <View
                          className="mt-3 self-start rounded-full px-3 py-1"
                          style={{ backgroundColor: "#FDE68A" }}
                        >
                          <PrimaryText
                            className="text-[#78350F] text-xs"
                            translate="none"
                          >
                            {ticketDetails?.scheduledDate} at{" "}
                            {formatTimeSlot(ticketDetails?.timeSlot ?? "")}
                          </PrimaryText>
                        </View>
                      </View>
                    </View>
                  )}
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
                          {ticketDetails?.assetInUseDetails?.assetMasterDetails
                            ?.assetModelDetails?.modelName ?? "-"}{" "}
                        </PrimaryText>
                        <PrimaryText className="text-md text-gray-900 font-semibold leading-5 ">
                          (
                          {ticketDetails?.assetInUseDetails?.assetMasterDetails
                            ?.assetModelDetails?.modelNumber ?? "-"}
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
                                message: "Call Requested Successfully",
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
                        {Object.values(ratingDetailsMap)[0]?.description || "-"}
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

                {(ticketDetails.statusDetails?.value === "Opened" ||
                  ticketDetails.statusDetails?.value === "Assigned" ||
                  ticketDetails.statusDetails?.value === "InProgress" ||
                  ticketDetails.statusDetails?.value === "Paid") && (
                  <View className="my-4">
                    <PrimaryText className="font-semibold text-lg text-primary-950">
                      updateTicketStatus
                    </PrimaryText>

                    <View className="my-3">
                      <PrimaryDropdownFormFieldWithCustomDropdown
                        options={statusOptions}
                        selectedValue={selectedStatusKey}
                        setSelectedValue={setSelectedStatusKey}
                        placeholder="Select Status"
                        fieldName="selectTicketStatusOptions"
                        label="Status"
                        errors={errors}
                        setErrors={setErrors}
                        canValidateField={canValidateField}
                        setCanValidateField={setCanValidateField}
                        setFieldValidationStatus={setFieldValidationStatus}
                        validateFieldFunc={setFieldValidationStatusFunc}
                        isRequired={true}
                      />
                    </View>

                    {/* Warning for specific status */}
                    {selectedStatusKey === "CUSTOMER_NOT_RESPONDING" && (
                      <View className="rounded-xl border border-secondary-950 bg-secondary-100 p-3 mb-4">
                        <View className="flex-row items-start">
                          <Entypo
                            name="info-with-circle"
                            size={18}
                            color="#FFAA00"
                          />
                          <PrimaryText className="text-[#7A5600] text-sm ml-2 flex-1 leading-5">
                            This status can be updated only when you are at the
                            customer’s location.
                          </PrimaryText>
                        </View>
                      </View>
                    )}

                    <PrimaryTextareaFormField
                      className="my-3"
                      fieldName="description"
                      label="Comments"
                      placeholder="writeShortDescription"
                      errors={errors}
                      setErrors={setErrors}
                      min={10}
                      max={200}
                      filterExp={/^(?! )[a-zA-Z0-9,.\-?/'$#&@*+ ]*$/}
                      defaultValue={description}
                      canValidateField={canValidateField}
                      setCanValidateField={setCanValidateField}
                      setFieldValidationStatus={setFieldValidationStatus}
                      validateFieldFunc={setFieldValidationStatusFunc}
                      onChangeText={setDescription}
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
                          ].includes(selectedStatusKey ?? "") && (
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
                                  <Ionicons
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
                      "TRANSFER_TO_OTHER",
                    ].includes(selectedStatusKey ?? "") && (
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
                            "TRANSFER_TO_OTHER",
                          ].includes(selectedStatusKey ?? "")}
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
                    {["CUSTOMER_NOT_RESPONDING", "TRANSFER_TO_OTHER"].includes(
                      selectedStatusKey
                    ) ? (
                      <View className="mb-4">
                        <View className="border border-gray-300 rounded-md p-4 mb-4 mt-2">
                          <PrimaryText className="text-red-700 font-medium mb-1">
                            No Payout Alert
                          </PrimaryText>
                          <View className="flex-row items-start mt-2">
                            <Pressable
                              onPress={() => setAcknowledged(!acknowledged)}
                            >
                              <View
                                className={`w-7 h-7 rounded-md border-2 ${
                                  acknowledged
                                    ? "bg-primary-950 border-primary-600"
                                    : "border-gray-400"
                                } items-center justify-center mr-4 mt-0.5`}
                              >
                                {acknowledged && (
                                  <Ionicons
                                    name="checkmark"
                                    size={14}
                                    color="white"
                                  />
                                )}
                              </View>
                            </Pressable>
                            <PrimaryText className="flex-1">
                              I acknowledge and agree to transfer this ticket,
                              and understand that no payout will be issued for
                              my service.
                            </PrimaryText>
                          </View>
                        </View>

                        <PrimaryButton
                          isLoading={isLoading}
                          onPress={() => {
                            updateTicketStatus();
                          }}
                          btnText="updateStatus"
                          disabled={
                            [
                              "CUSTOMER_NOT_RESPONDING",
                              "TRANSFER_TO_OTHER",
                            ].includes(selectedStatusKey) && !acknowledged
                          }
                        />
                      </View>
                    ) : (
                      <PrimaryButton
                        isLoading={isLoading}
                        onPress={updateTicketStatus}
                        btnText="updateStatus"
                      />
                    )}
                  </View>
                )}
              </View>
            </View>

            <ImagePickerComponent
              onImagePicked={(uri, fileSizeBytes) => {
                if (bytesToMB(fileSizeBytes) > 15) {
                  showToast({ type: "error", message: "toast14" });
                  return;
                }
                setAssetImages((prev) => [...prev, uri]);
              }}
              setIsModalVisible={setIsModalVisible}
              bottomSheetRef={bottomSheetRef}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default TicketDetails;
