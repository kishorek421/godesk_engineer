import {
  View,
  SafeAreaView,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import PrimaryText from "@/components/PrimaryText";
import React, { useEffect, useRef, useState } from "react";
import LottieView from "lottie-react-native";
import { ErrorModel } from "@/models/common";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Button } from "@/components/ui/button";
import apiClient from "@/clients/apiClient";
import { setItem } from "@/utils/secure_store";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/storage_keys";
import PrimaryTextFormField from "@/components/PrimaryTextFormField";
import { getFCMToken } from "@/services/fcm";

import BasePage from "@/components/base/base_page";
import { useFirebaseMessaging } from "@/hooks/useFirebaseMessaging";
import { I18nextProvider, useTranslation } from "react-i18next";
import { useToast } from "@/context/ToastContext";
import { Ionicons } from "@expo/vector-icons";
const VerifyOTPScreen = () => {
  const { mobile } = useLocalSearchParams();
  const { showToast } = useToast();
  const [timer, setTimer] = useState(120);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isDisabled, setIsDisabled] = useState(true);
  const [otp, setOtp] = useState<string>("");
  const animationRef = useRef<LottieView>(null);
  const { t } = useTranslation();
  const [canValidateField, setCanValidateField] = useState(false);
  const [errors, setErrors] = useState<ErrorModel[]>([]);
  const [fieldValidationStatus, setFieldValidationStatus] = useState<any>({});
  const { messagingRef } = useFirebaseMessaging();
  const setFieldValidationStatusFunc = (
    fieldName: string,
    isValid: boolean
  ) => {
    if (fieldValidationStatus[fieldName]) {
      fieldValidationStatus[fieldName](isValid);
    }
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setIsDisabled(false);
    }
  }, [timer]);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setErrors([{ param: "otp", message: "otpValidationMessage" }]);
      return;
    }
    setIsLoading(true);
    setErrors([]);
    let fcmToken = "";

    try {
      fcmToken = (await getFCMToken(messagingRef.current)) ?? "";
      console.log("fcmToken", fcmToken);
    } catch (e) {
      console.error("Token Error ->", e);
    }

    try {
      await apiClient
        .get(
          `/otp/verify?mobile=${mobile}&otp=${otp}&type=FIELD_ENGINEER&fcmToken=${fcmToken}`
        )
        .then(async (response) => {
          if (response.data?.success) {
            const loginData = response.data?.data;
            if (loginData && loginData.token) {
              await setItem(AUTH_TOKEN_KEY, loginData.token);
              await setItem(REFRESH_TOKEN_KEY, loginData.refreshToken);
              router.replace("/home");
            }
          }
        })
        .catch((e) => {
          console.error(e.response.data);
          const errors = e.response.data.errors;
          if (errors) {
            setErrors(errors);
          }
        });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setErrors([
        { param: "otp", message: "An error occurred. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  const getTime = () => {
    try {
      return ` ${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, "0")}`;
    } catch (e) {
      return "";
    }
  };
  const handleSendOTP = async () => {
    setIsLoading(true);
    setErrors([]);
    await apiClient
      .post("/otp/send", { mobile, type: "FIELD_ENGINEER" })
      .then((response) => {
        console.log("Response:", response.data.data);
        if (response.data?.success) {
          showToast({
            position: "top",
            type: "success",
            message: "toast5",
          });
          setTimer(120);
          setIsDisabled(true);
        }
      })
      .catch((error) => {
        console.error("Error sending OTP:", error.response?.data || error);
      })
      .finally(() => {
        console.log("Request completed");
        setIsLoading(false);
      });
  };

  return (
    <BasePage includeTop>
      <View className="flex justify-between h-full bg-white">
        <View className="mt-1">
          <View className="flex-row items-end mx-3">
            <Image
              source={require("../assets/images/godezk_engineer_banner_300x150.png")}
              style={{ width: 100, height: 60 }}
            />
            {/* <PrimaryText className="font-bold-1 text-secondary-950 ms-.5 mb-1.5">
                desk <PrimaryText className="text-primary-950 font-regular">Engineer</PrimaryText>
              </PrimaryText> */}
          </View>
          <View className=" px-4">
            <View className="mt-4">
              <PrimaryText className="text-2xl font-bold-1">
                checkYourMobile
              </PrimaryText>
              <View className="flex-row mt-2">
                <PrimaryText
                  className="color-gray-400 text-sm font-regular"
                  translate="none"
                >
                  {t("otpMessage", { mobile })}.
                </PrimaryText>
              </View>
            </View>

            <View className="mt-6">
              <PrimaryTextFormField
                fieldName="otp"
                label="OTP"
                placeholder="enterOtp"
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
                onChangeText={(e: string) => setOtp(e)}
                // defaultErrorMessage="Please enter a OTP"
              />
            </View>
            <View className="flex justify-center mt-8 items-center ">
              <View className="flex items-center">
                <PrimaryText className="text-gray-700 font-regular">
                  didReceiveOTP?
                </PrimaryText>
                <View className="flex">
                  <Pressable
                    onPress={() => {
                      handleSendOTP();
                    }}
                    disabled={isDisabled}
                  >
                    <PrimaryText
                      className={`${isDisabled ? "text-gray-500" : "text-primary-950 font-semibold"}`}
                      translate="none"
                    >
                      {isDisabled ? (
                        <>
                          {t("resendOtpInTime") + " "}
                          <PrimaryText
                            className="font-semibold underline text-primary-950"
                            translate="none"
                          >
                            {getTime()}
                          </PrimaryText>
                        </>
                      ) : (
                        t("resendOTP")
                      )}
                    </PrimaryText>
                  </Pressable>
                </View>
              </View>
            </View>
            <View className=" mt-12">
              <Button
                className=" flex justify-center items-center bg-primary-950 rounded-md  w-full h-12 p-0"
                onPress={handleVerifyOTP}
              >
                <PrimaryText className="font-semibold text-white text-xl">
                  verifyOtp
                </PrimaryText>
                {isLoading ? (
                  <ActivityIndicator color="white" className="ms-1" />
                ) : (
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="white"
                    className="ms-1"
                  />
                )}
              </Button>
            </View>
          </View>
        </View>
        <View>
          <LottieView
            ref={animationRef}
            source={require("../assets/lottie/login.json")}
            autoPlay
            loop
            style={{ height: 200 }}
          />
        </View>
      </View>
    </BasePage>
  );
};

export default VerifyOTPScreen;
