import {View,Text,SafeAreaView,Image,Pressable,ActivityIndicator} from "react-native";
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
import { useTranslation } from "react-i18next"; 
import Toast from "react-native-toast-message";

const VerifyOTPScreen = () => {

  const { mobile } = useLocalSearchParams();
  const { t, i18n } = useTranslation(); 
  const [timer, setTimer] = useState(120); 
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isDisabled, setIsDisabled] = useState(true);
  const [otp, setOtp] = useState<string>("");
  const animationRef = useRef<LottieView>(null);

  const [canValidateField, setCanValidateField] = useState(false);
  const [errors, setErrors] = useState<ErrorModel[]>([]);
  const [fieldValidationStatus, setFieldValidationStatus] = useState<any>({});

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
      setErrors([{ param: "otp", message: t("otpValidationMessage") }]); 
      return;
    }
    setIsLoading(true);
    setErrors([]);

    try {
      await apiClient
        .get(`/otp/verify?mobile=${mobile}&otp=${otp}&type=FIELD_ENGINEER`)
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
          console.error(e.response.request);
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
        Toast.show({
          type: "success",
          text1: "OTP sent successfully",
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
    <SafeAreaView className="bg-white">
      <View className="flex justify-between h-full">
        <View className="mt-1 px-4">
          <View>
            <View className="flex-row items-end">
              <Image
                source={require("../assets/images/godesk.jpg")}
                style={{ width: 30, height: 30 }}
              />
              <Text className="font-bold text-secondary-950 ms-.5 mb-1.5">
                desk <Text className="text-primary-950">Engineer</Text>
              </Text>
            </View>
          </View>
          <View className="mt-6">
            <Text className="text-2xl font-bold">{t("checkYourMobile")}</Text>
            <Text className="color-gray-400 text-sm">
              {t("otp_message", { mobile })}.
            </Text>
          </View>

          <View className="mt-6">
            <PrimaryTextFormField
              fieldName="otp"
              label={t("enterOtp")}
              placeholder={t("enterOtp")}
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
            />
          </View>
          <View className="flex-row justify-center mt-8">
              <View className="flex-row">
                <Text className="text-gray-700">Didn't Receive OTP? </Text>
                <View className="flew-row">
                  <Pressable
                    onPress={() => {
                      handleSendOTP();
                    }}
                    disabled={isDisabled}
                  >
                    <Text
                      className={`${isDisabled ? "text-gray-500 " : "text-primary-950 font-semibold"}`}
                    >
                      Resend OTP
                      {isDisabled && (
                        <Text className="text-gray-600 font-normal">
                          {" "}
                          in
                          <Text className="font-semibold underline text-primary-950">
                            {getTime()}
                          </Text>
                        </Text>
                      )}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

          <View className="flex-row justify-between items-center mt-12">
            <Text className="font-bold text-primary-950 text-xl">
              {t("verifyOtp")}
            </Text>
            <Button
              className="bg-primary-950 rounded-full w-14 h-14 p-0"
              onPress={handleVerifyOTP}
            >
               {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <AntDesign name="arrowright" size={20} color="white" />
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
            style={{ height: 200 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VerifyOTPScreen;
