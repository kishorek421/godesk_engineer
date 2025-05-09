import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Linking,
} from "react-native";
import LottieView from "lottie-react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Button } from "@/components/ui/button";
import apiClient from "@/clients/apiClient";
import { ErrorModel } from "@/models/common";
import { isFormFieldInValid } from "@/utils/helper";
import PrimaryTextFormField from "@/components/PrimaryTextFormField";
import PrimaryText from "@/components/PrimaryText";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { getFCMToken } from "@/services/fcm";
import { useFirebaseMessaging } from "@/hooks/useFirebaseMessaging";
import BasePage from "@/components/base/base_page";
const LoginScreen = () => {
  const animationRef = useRef<LottieView>(null);
  const [mobile, setMobileNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorModel[]>([]);
  const [canValidateField, setCanValidateField] = useState(false);
  const [fieldValidationStatus, setFieldValidationStatus] = useState<any>({});
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const { messagingRef } = useFirebaseMessaging();

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await requestTrackingPermissionsAsync();
      console.log("Tracking Permission Status:", status);
      if (status === "granted") {
      } else {
        console.log("Tracking permission denied");
      }
    };
    requestPermission();
  }, []);

  const setFieldValidationStatusFunc = (
    fieldName: string,
    isValid: boolean
  ) => {
    if (fieldValidationStatus[fieldName]) {
      fieldValidationStatus[fieldName](isValid);
    }
  };

  const handleSendOTP = async () => {
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      setErrors([
        {
          param: "mobile",
          message: "Please enter a valid 10-digit mobile number.",
        },
      ]);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    let fcmToken = "";

    try {
      fcmToken = (await getFCMToken(messagingRef.current)) ?? "";
    } catch (e) {
      console.error("Token Error ->", e);
    }

    await apiClient
      .post("/otp/send", { mobile, type: "FIELD_ENGINEER", "fcmToken": fcmToken })
      .then((response) => {
        console.log("Response:", response.data.data);
        if (response.data?.success) {
          setMobileNumber(""); //reset mobile no
          router.push({
            pathname: "/verify_otp",
            params: { mobile },
          });
        } else {
          setErrors([
            {
              param: "mobile",
              message:
                response.data?.message || "Failed to send OTP. Try again.",
            },
          ]);
        }
      })
      .catch((error) => {
        console.error("Error sending OTP:", error.response?.data || error);
        setErrors([
          {
            param: "mobile",
            message: ("An error occurred. Please try again."),
          },
        ]);
      })
      .finally(() => {
        console.log("Request completed");
        setIsLoading(false);
      });
  };

  return (
    <BasePage>
      <View className="flex justify-between h-full bg-white">
        <View className="mt-1 h-full">
          <View className="flex-row items-end mx-3">
            <Image
              source={require("../assets/images/godezk_engineer_banner_300x150.png")}
              style={{
                width: 100,
                height: 60,
              }}
            />
            {/* <PrimaryText className="mb-1.5 font-bold-1 text-secondary-950 ms-.5 font-regular">
                desk <PrimaryText className="text-primary-950 font-regular">Engineer</PrimaryText>
              </PrimaryText> */}
          </View>
          <View className="px-4 flex justify-between h-[88%]">
            <View>
              <View className="mt-2">
                <PrimaryText className="text-2xl font-bold-1">welcome</PrimaryText>

                <PrimaryText className="color-gray-400 text-sm font-regular">
                  createExtraordinary
                </PrimaryText>
              </View>
              <View className="mt-6">
                <FormControl
                  isInvalid={isFormFieldInValid("mobileNo", errors).length > 0}
                >
                  <PrimaryTextFormField
                    fieldName="mobile"
                    label="mobileLabel"
                    placeholder="mobilePlaceholder"
                    errors={errors}
                    setErrors={setErrors}
                    min={10}
                    max={10}
                    keyboardType="phone-pad"
                    filterExp={/^[0-9]*$/}
                    canValidateField={canValidateField}
                    setCanValidateField={setCanValidateField}
                    setFieldValidationStatus={setFieldValidationStatus}
                    validateFieldFunc={setFieldValidationStatusFunc}
                    customValidations={(value) => {
                      // mobile no should start with 6-9
                      const customRE = /^[6-9]/;
                      if (!customRE.test(value)) {
                        return ("Mobile no. should start with 6-9");
                      }
                      return undefined;
                    }}
                    onChangeText={(text: string) => {
                      setMobileNumber(text);
                    }}
                  />
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("mobile", errors)}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              </View>
              <View className="mt-12">
                <Button
                  className=" flex justify-center items-center bg-primary-950 rounded-md  w-full h-12 p-0"
                  onPress={handleSendOTP}
                >
                  <PrimaryText className="font-semibold text-white text-lg">
                    loginButton
                  </PrimaryText>
                  {isLoading ? (
                    <ActivityIndicator color="white" className="ms-1" />
                  ) : (
                    <AntDesign  
                      size={20}
                      color="white"
                      className="ms-1"
                    />
                  )}
                </Button>
              </View>
            </View>
            <View>
              <LottieView
                ref={animationRef}
                source={require("../assets/lottie/login.json")}
                autoPlay
                loop
                style={{
                  height: 200,
                }}
              />
              <PrimaryText className="px-12 text-center text-sm font-regular mt-2">
                loginAgreement{" "}
                <PrimaryText
                  onPress={() => {
                    Linking.openURL(
                      "https://godezk.com/Terms_And_conditions.html"
                    );
                  }}
                  className="font-bold-1 text-secondary-950"
                >
                termsConditions
                </PrimaryText>{" "}
                and{" "}
                <PrimaryText
                  onPress={() => {
                    Linking.openURL("https://godezk.com/Privacy_Policy.html");
                  }}
                  className="font-bold-1 text-secondary-950"
                >
                  privacyPolicy
                </PrimaryText>
              </PrimaryText>
            </View>
          </View>
        </View>
      </View>
      </BasePage>
  );
};
export default LoginScreen;
