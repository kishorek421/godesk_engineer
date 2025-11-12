import { View, ScrollView, Text, Pressable, StyleSheet } from "react-native";
import React, { useRef, useState, useEffect } from "react";
import { ErrorModel } from "@/models/common";

import {
  CreateLeaveRequestModel,
  LeaveRequestModel,
  LeaveRequestDetailsModel,
  LeaveTypeModel,
} from "@/models/leave";
import {
  CREATE_LEAVE_REQUEST,
  GET_LEAVE_REQUEST_DETAILS,
  GET_LEAVE_REQUEST_PREVIEW,
  GET_LEAVE_TYPES,
  UPDATE_LEAVE_REQUEST,
} from "@/constants/api_endpoints";
import api from "@/clients/apiClient";
import { router, useLocalSearchParams } from "expo-router";
import { useToast } from "@/context/ToastContext";
import PrimaryTextareaFormField from "@/components/PrimaryTextareaFormField";
import PrimaryDropdownFormField from "@/components/PrimaryDropdownFormField";
import SubmitButton from "@/components/SubmitButton";
import { Calendar } from "react-native-calendars";
import BottomSheet from "@/components/BottomSheet";
import { Button, ButtonText } from "@/components/ui/button";
import { primaryColor, secondaryColor } from "@/constants/colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import { isFormFieldInValid } from "@/utils/helper";
import { DropdownModel } from "@/models/common";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import LoadingBar from "@/components/LoadingBar";
import moment from "moment";
import { use } from "i18next";
import { setLogLevel } from "@react-native-firebase/app";
import useRefresh from "@/hooks/useRefresh";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import PrimaryText from "@/components/PrimaryText";
import BasePage from "@/components/base/base_page";

const CreateLeaveRequest = () => {
  const [errors, setErrors] = useState<ErrorModel[]>([]);
  const { showToast } = useToast();
  const { leaveId, leaveTypeId } = useLocalSearchParams();
  const [canValidateField, setCanValidateField] = useState(false);
  const [fieldValidationStatus, setFieldValidationStatus] = useState<any>({});
  const [createLeaveRequestModel, setCreateLeaveRequestModel] =
    useState<CreateLeaveRequestModel>({});
  const [selectedLeaveType, setSelectedLeaveType] =
    useState<DropdownModel>();
  const [leaveType, setLeaveType] = useState<LeaveTypeModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [leaveDetailsPreview, setLeaveDetailsPreview] =
    useState<LeaveRequestDetailsModel>();
  const bottomSheetRef = useRef(null);
  const [leaveDetails, setLeaveDetails] = useState<LeaveRequestModel>({});
  const [markedDates, setMarkedDates] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [rangeConfirmed, setRangeConfirmed] = useState<{
    start: null | string;
    end: null | string;
  }>({
    start: null,
    end: null,
  });
  const navigation = useNavigation();
  const { triggerRefresh } = useRefresh();
  useEffect(() => {
    navigation.setOptions({
      headerTitle: isLoading
        ? " "
        : leaveDetails?.id
          ? "Update Leave"
          : "Apply Leave",
      headerLeftContainerStyle: {
        paddingStart: 10,
      },
    });
  }, [navigation, isLoading, leaveDetails?.id]);

  const setFieldValidationStatusFunc = (
    fieldName: string,
    isValid: boolean,
  ) => {
    if (fieldValidationStatus[fieldName]) {
      fieldValidationStatus[fieldName](isValid);
      return;
      return;
    }
  };
  const fetchLeaveDetailsById = () => {
    if (isLoading) return;
    setIsLoading(true);
    console.log("leaveId", leaveId);
    const params = `?id=${leaveId}`;
    api
      .get(GET_LEAVE_REQUEST_DETAILS + params)
      .then((response) => {
        setIsLoading(false);
        setLeaveDetails(response.data.data ?? {});
        if (response.data.data.startDate && response.data.data.endDate) {
          setRangeConfirmed({
            start: response.data.data.startDate,
            end: response.data.data.endDate,
          });
        } else {
          setRangeConfirmed({ start: null, end: null });
        }
        if (
          response.data?.data.leaveTypeDetails?.id &&
          response.data?.data.leaveTypeDetails?.value
        ) {
          const leave = {
            value: response.data?.data.leaveTypeDetails?.id,
            label: response.data?.data.leaveTypeDetails?.value,
          };
          setSelectedLeaveType(leave);
        } else {
          setSelectedLeaveType(null);
        }
      })
      .catch((e) => {
        console.error(e);
        setIsLoading(false);
      });
  };
  const handleRangeConfirmed = () => {
    const dates = Object.keys(markedDates);
    if (dates.length === 0) {
      console.log("No dates selected");
      setRangeConfirmed({ start: null, end: null });
      return;
    }

    const start = dates[0];
    const end = dates[dates.length - 1];
    if (start && end) {
      setRangeConfirmed({ start, end });
    }
  };

  const createLeaveRequest = async () => {

    if (rangeConfirmed.start === null || rangeConfirmed.end === null) {
      setErrors((prevErrors) => [
        ...prevErrors.filter(
          (error) => error.param !== "startDate" && error.param !== "endDate",
        ),
        {
          param: "startDate",
          message: "Please select from and to date",
        },
        {
          param: "endDate",
          message: "Please select from and to date",
        },
      ]);
      setCanValidateField(true);
    } else {

      setErrors((prevErrors) =>
        prevErrors.filter(
          (error) => error.param !== "startDate" && error.param !== "endDate",
        ),
      );
    }


    setCanValidateField(true);


    const validationPromises = Object.keys(fieldValidationStatus).map(
      (key) =>
        new Promise((resolve) => {
          setFieldValidationStatus((prev: any) => ({
            ...prev,
            [key]: resolve,
          }));
        }),
    );

    await Promise.all(validationPromises);


    const hasErrors = errors.some((error) => error.message && error.message.length > 0);

    if (
      rangeConfirmed.start === null ||
      rangeConfirmed.end === null ||
      hasErrors
    ) {

      return;
    }

    setIsLoading(true);
    const createLeaveRequestObj = {
      leaveTypeId: selectedLeaveType?.value,
      reason: createLeaveRequestModel.reason || leaveDetails.reason,
      startDate: rangeConfirmed.start,
      endDate: rangeConfirmed.end,
    };
    setErrors([]);
    console.log("createLeaveRequest", createLeaveRequestObj);
    const apiMethod = leaveDetails.id ? "put" : "post";
    const url = leaveDetails?.id
      ? `${UPDATE_LEAVE_REQUEST}?id=${leaveId}`
      : CREATE_LEAVE_REQUEST;
    api[apiMethod](url, createLeaveRequestObj)
      .then((response) => {
        console.log("Response data", response.data.data);
        showToast({
          type: "success",
          position: "top",
          message: leaveDetails?.id
            ? "Leave updated successfully"
            : "Leave created successfully",

        });

        setIsLoading(false);
        triggerRefresh();
        setCreateLeaveRequestModel({});
        router.back();
      })
      .catch((error: any) => {
        console.error("Failed to update ticket status.", error);

        if (error?.response?.data?.errors) {
          setErrors(
            error.response.data.errors.filter(
              (err: any) => err.param !== null,
            ),
          );
          setIsLoading(false);
          const errorMessages = error.response.data.errors
            .filter((err: any) => err.param === null)
            .map((err: any) => err.message)
            .join("\n");

          if (errorMessages) {
            showToast({
              type: "error",
              position: "top",
              message: errorMessages,
            });
          }
        }
      });
  };

  useEffect(() => {
    fetchLeaveDetailsById();
    fetchLeaveTypes();
  }, []);
  // helper: normalize dates to same format/representation as leaveDetails.*
  // adjust if your dates are ISO strings, timestamps, or moment objects
  const normalize = (d) => (d ? String(d) : null);

  // whether the current selected range differs from original leave's range
  const isRangeDifferent = React.useMemo(() => {
    if (!leaveDetails?.id) return true; // new leave -> considered different
    const originalStart = normalize(leaveDetails.startDate); // change key names if needed
    const originalEnd = normalize(leaveDetails.endDate);
    const currentStart = normalize(rangeConfirmed.start);
    const currentEnd = normalize(rangeConfirmed.end);

    return currentStart !== originalStart || currentEnd !== originalEnd;
  }, [leaveDetails?.id, leaveDetails?.startDate, leaveDetails?.endDate, rangeConfirmed.start, rangeConfirmed.end]);

  useEffect(() => {
    if (!selectedLeaveType?.value) return;

    // If date range is provided and different from original -> always fetch
    if (rangeConfirmed.start && rangeConfirmed.end && isRangeDifferent) {
      fetchPreviewDetails();
      return;
    }

    // If it's a new leave (no id) -> fetch on type change even if no dates chosen
    if (!leaveDetails?.id) {
      fetchPreviewDetails();
    }
  }, [selectedLeaveType?.value, rangeConfirmed.start, rangeConfirmed.end, isRangeDifferent, leaveDetails?.id]);

  const fetchPreviewDetails = () => {
    if (!selectedLeaveType?.value) return;

    let url = `${GET_LEAVE_REQUEST_PREVIEW}?leaveTypeId=${selectedLeaveType?.value}`;

    if (rangeConfirmed.start && rangeConfirmed.end) {
      url += `&startDate=${rangeConfirmed.start}&endDate=${rangeConfirmed.end}`;
    }

    api
      .get(url)
      .then((response) => {
        console.log("PREVIEW", response.data.data ?? {});
        setLeaveDetailsPreview(response.data.data ?? {});
      })
      .catch((e) => console.error(e));
  };



  const onDayPress = (day: any) => {
    const { dateString } = day;
    console.log("Tapped:", dateString);

    if (!startDate) {
      const newMarked = {
        [dateString]: {
          startingDay: true,
          color: secondaryColor,
          textColor: "#ffffff",
        },
      };
      setStartDate(dateString);
      setMarkedDates(newMarked);
      console.log("Start Date Set:", newMarked);
    } else {
      const range = getDateRange(startDate, dateString);
      setMarkedDates(range);
      setStartDate(null);
      console.log("Range Set:", range);
    }
  };
  const fetchLeaveTypes = () => {
    api
      .get(GET_LEAVE_TYPES)
      .then((response) => {
        const leaveTypes = response.data?.data ?? [];

        if (leaveTypes.length > 0) {
          setLeaveType(leaveTypes);
          console.log("selected leave type", leaveTypes);
        } else {
          showToast({
            type: "success",
            position: "top",
            message: " Please contact the admin to add leave type.",
          });
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const onItemSelect = (type: any, e: any) => {
    switch (type) {
      case "LEAVE_TYPE":
        let selectedLeaveType = leaveType.find(
          (leaveType) => leaveType.id === e,
        );
        console.log("selectedLeaveType", selectedLeaveType);
        setSelectedLeaveType({
          label: selectedLeaveType?.value,
          value: selectedLeaveType?.id,
        });
        break;
    }
  };

  const getDateRange = (start: any, end: any) => {
    const dates: any = {};
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);

    if (startDateObj > endDateObj) {
      return getDateRange(end, start);
    }

    let currentDate = new Date(startDateObj);
    while (currentDate <= endDateObj) {
      const dateString = currentDate.toISOString().split("T")[0];
      dates[dateString] = {
        color: secondaryColor,
        textColor: "#ffffff",
        ...(dateString === start && { startingDay: true }),
        ...(dateString === end && { endingDay: true }),
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };
  // const [translatedLabel, setTranslatedLabel] = useState("Your Message");
  // const {language} = useTranslation();
  // useEffect(() => {
  //   const updateLabel = async () => {
  //     const label = await translateText("Your Message", language);
  //     setTranslatedLabel(label);
  //   };
  //   updateLabel();
  // }, [language]);

  return isLoading ? (
    <LoadingBar />
  ) : (
    <BasePage>
      <ScrollView
        automaticallyAdjustKeyboardInsets={true}
        className="h-full bg-white"
        keyboardShouldPersistTaps="handled"
      >
        <View className="h-full">
          {isLoading ? (
            <LoadingBar />
          ) : (
            <View className="px-4  p-4">
              {selectedLeaveType?.value && (
                // show preview for new leaves OR for existing leaves only when range changed
                ((!leaveDetails?.id) || isRangeDifferent) && (
                  <View className="mb-4">
                    <View className="rounded bg-primary-200 px-3 py-2">
                      <Text className="text-gray-800 font-medium text-sm">
                        {leaveDetailsPreview?.remainingDays === 0
                          ? `You have consumed all the leaves for this leave type. Also, the loss of pay for this is ${leaveDetailsPreview?.lossOfPay ?? "_"} .`
                          : `For the selected leave type, you have ${leaveDetailsPreview?.remainingDays ?? "_"} leave days remaining.`}
                      </Text>
                    </View>
                  </View>
                )
              )}



              <PrimaryDropdownFormField
                className="mb-3"
                options={leaveType.map((leaveType) => ({
                  label: leaveType.value,
                  value: leaveType.id,
                }))}
                selectedValue={selectedLeaveType}
                setSelectedValue={setSelectedLeaveType}
                type="LEAVE_TYPE"
                placeholder="Select Leave Type"
                fieldName="leaveTypeId"
                label="Leave Type"
                canValidateField={canValidateField}
                setCanValidateField={setCanValidateField}
                setFieldValidationStatus={setFieldValidationStatus}
                validateFieldFunc={setFieldValidationStatusFunc}
                errors={errors}
                setErrors={setErrors}
                onItemSelect={onItemSelect}
              />

              <View className="flex gap-1 mt-2 mb-5">
                <Text className="font-medium">
                  From And To Date
                  <Text className="text-red-400"> *</Text>
                </Text>
                <FormControl
                  isInvalid={
                    isFormFieldInValid("startDate", errors).length > 0 ||
                    isFormFieldInValid("endDate", errors).length > 0
                  }
                >
                  <Pressable
                    onPress={() => {
                      bottomSheetRef.current?.show();
                    }}
                  >
                    <View
                      className={`flex-row justify-between items-center border-[1px] px-3 py-2 rounded h-14 ${isFormFieldInValid("startDate", errors).length > 0 || isFormFieldInValid("endDate", errors).length > 0 ? "border-red-700 " : "border-gray-300"}`}
                    >
                      {rangeConfirmed.start === null ||
                        rangeConfirmed.end === null ? (
                        <Text className="flex-1 text-gray-400 font-regular">
                          Select From And To Date
                        </Text>
                      ) : (
                        <Text className="flex-1 text-gray-900 font-regular">
                          {rangeConfirmed.start} to {rangeConfirmed.end}
                        </Text>
                      )}
                      {rangeConfirmed.start !== null &&
                        rangeConfirmed.end !== null && (
                          <Pressable
                            onPress={() => {
                              setMarkedDates({});
                              setStartDate(null);
                              setRangeConfirmed({ start: null, end: null });
                            }}
                          >
                            <AntDesign
                              name="closecircle"
                              size={20}
                              color="#9ca3af"
                            />
                          </Pressable>
                        )}
                      <View className="flex-row items-center">
                        <AntDesign
                          name="calendar"
                          size={20}
                          color="#9ca3af"
                          style={{ marginLeft: 8 }}
                        />
                      </View>
                    </View>
                  </Pressable>
                  <FormControlError className="mt-2">
                    <FormControlErrorText>
                      {isFormFieldInValid("startDate", errors) ||
                        isFormFieldInValid("endDate", errors)}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              </View>
              <PrimaryTextareaFormField
                fieldName="reason"
                label="Reason"
                placeholder="Explain in a few words"
                errors={errors}
                setErrors={setErrors}
                min={10}
                max={200}
                defaultValue={createLeaveRequestModel.reason ?? leaveDetails.reason}
                filterExp={/^(|[a-zA-Z][a-zA-Z0-9,.-/'#$& ]*)$/}

                canValidateField={canValidateField}
                setCanValidateField={setCanValidateField}
                setFieldValidationStatus={setFieldValidationStatus}
                validateFieldFunc={setFieldValidationStatusFunc}

                onChangeText={(value) => {
                  setCreateLeaveRequestModel((prevState) => {
                    prevState.reason = value;
                    return prevState;
                  });
                }}
              />
              <SubmitButton
                isLoading={isLoading}
                onPress={createLeaveRequest}
                btnText={leaveDetails?.id ? ("Update") : ("Apply Leave")}
              />
            </View>
          )}

        </View>


        <BottomSheet initialHeight={600} ref={bottomSheetRef}>
          <View className="mt-6 ">
            <Text className="mx-6 font-bold text-xl">Select From And To Date</Text>

            <View className="mt-2">
              <Calendar
                theme={{
                  backgroundColor: "#FFFFFF",
                  calendarBackground: "#FFFFFF",
                  textSectionTitleColor: "#000000",
                  selectedDayBackgroundColor: primaryColor,
                  selectedDayTextColor: "#FFFFFF",
                  todayTextColor: secondaryColor,
                  dayTextColor: "#2E2E2E",
                  textDisabledColor: "#D3D3D3",
                  arrowColor: primaryColor,
                }}
                onDayPress={onDayPress}
                markingType={"period"}
                markedDates={markedDates}
                minDate={new Date().toISOString().split("T")[0]}
              />
            </View>
            <View className="flex-row justify-evenly px-6 my-6 gap-4 w-full">
              <Button
                className="bg-transparent w-48 h-12 border border-primary-800 font-regular rounded-lg"
                onPress={() => {
                  // bottomSheetRef.current?.hide();
                  setMarkedDates({});
                  setStartDate(null);
                }}
              >
                <ButtonText className="text-primary-800 font-medium">
                  Reset
                </ButtonText>
              </Button>
              <Button
                className="w-48 bg-primary-950 h-12 rounded-lg"
                onPress={() => {
                  handleRangeConfirmed();
                  bottomSheetRef.current?.hide();
                  setErrors([]);
                }}
              >
                <ButtonText>Done</ButtonText>
              </Button>
            </View>
          </View>

        </BottomSheet>
      </ScrollView>
    </BasePage>
  );
};

export default CreateLeaveRequest;
