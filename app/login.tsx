import React, { useEffect, useRef, useState } from "react";
import {View,Text,SafeAreaView,Image,ActivityIndicator,Linking} from "react-native";
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
import { useTranslation } from 'react-i18next';
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";

const LoginScreen = () => {
  const { t, i18n } = useTranslation(); // Access translations using `t`
  const animationRef = useRef<LottieView>(null);
  const [mobile, setMobileNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorModel[]>([]);
  const [canValidateField, setCanValidateField] = useState(false);
  const [fieldValidationStatus, setFieldValidationStatus] = useState<any>({});
  const [selectedLanguage, setSelectedLanguage] = useState('en');
 
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
          message: t("Please enter a valid 10-digit mobile number."),
        },
      ]);
      return;
    }

    setIsLoading(true);
    setErrors([]);
   

 await apiClient
      .post("/otp/send", { mobile, "type": "FIELD_ENGINEER"})
      .then((response) => {
        console.log("Response:", response.data.data);
        if (response.data?.success) {
          setMobileNumber(''); //reset mobile no
          router.push({
            pathname: "/verify_otp",
            params: { mobile },

          });
        } else {
          setErrors([
            {
              param: "mobile",
              message:
                response.data?.message || t("Failed to send OTP. Try again."),
            },
          ]);
        }
      })
      .catch((error) => {
        console.error("Error sending OTP:", error.response?.data || error);
        setErrors([
          {
            param: "mobile",
            message: t("An error occurred. Please try again."),
          },
        ]);
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
                source={require("../assets/images/godesk.png")}
                style={{
                  width: 30,
                  height: 30,
                }}
              />
              <Text className="mb-1.5 font-bold text-secondary-950 ms-.5 font-regular">
                desk <Text className="text-primary-950 font-regular">Engineer</Text>
              </Text>
            </View>
          </View>
          <View className="mt-6">
            <Text className="text-2xl font-bold font-regular">{t("welcome")}</Text>
            
            <Text className="color-gray-400 text-sm font-regular">
              {t(' Let’s create something extraordinary!')}
            </Text>
          </View>
          <View className="mt-6">
            <FormControl
              isInvalid={isFormFieldInValid("mobileNo", errors).length > 0}
            >
              <PrimaryTextFormField
                fieldName="mobile"
                label={t("Mobile Number")}
                placeholder={t("Enter your mobile number")}
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
                    return t("Mobile no. should start with 6-9");
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

          <View className=" mt-12">
            <Button
              className=" flex justify-center items-center bg-primary-950 rounded-md  w-full h-12 p-0"
              onPress={handleSendOTP}
            >
              <Text className="font-bold text-white text-xl font-regular">{t('Login')}</Text>
              {isLoading ? (
                <ActivityIndicator color="white" className="ms-1" />
              ) : (
                <AntDesign
                  name="arrowright"
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
         <Text className="px-12 text-center text-sm font-regular">
          {t('loginAgreement')}{" "}
            <Text
              onPress={() => {
                Linking.openURL("https://godesk.co.in/Terms_And_conditions.html");
              }}
              className="font-bold text-[#667085]"
            >
              {t("terms_conditions")}
            </Text>{" "}
            {t('and')}{" "}
            <Text
              onPress={() => {
                Linking.openURL("https://godesk.co.in/Privacy_Policy.html");
              }}
              className="font-bold text-[#667085]"
            >
              {t("privacy_policy")}
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
export default LoginScreen;
