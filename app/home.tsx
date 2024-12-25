import {
  View,
  Text,
  FlatList,
  BackHandler, 
  ToastAndroid,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { useLocalSearchParams, router, Link,useSegments } from "expo-router";
import { TicketListItemModel } from "@/models/tickets";
import apiClient from "@/clients/apiClient";
import TicketStatusComponent from "@/components/tickets/TicketStatusComponent";
import moment from "moment";
import {
  GET_CHECK_IN_OUT_STATUS,
  GET_INPROGRESS_TICKETS_DETAILS,
  GET_USER_DETAILS,
} from "@/constants/api_endpoints";
import TicketListLayout from "@/components/tickets/TicketListLayout";
import { CheckInOutStatusDetailsModel, UserDetailsModel } from "@/models/users";
import { getGreetingMessage } from "@/utils/helper";
import { Button, ButtonText } from "@/components/ui/button";
import CheckInOutModal from "@/components/home/CheckInOutModal";

const HomeScreen = () => {
  const { ticketId } = useLocalSearchParams();
  const [inProgressTicketDetails, setInProgressTicketDetails] =
    useState<TicketListItemModel>({});
  const [userDetails, setUserDetails] = useState<UserDetailsModel>({});
  const [isLoading, setIsLoading] = useState(true);
  const [exitApp, setExitApp] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { refresh } = useLocalSearchParams();
  const segments = useSegments(); 
  const bottomSheetRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
      .post("/otp/send", { mobile })
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

        // Handle network or unexpected errors
        setErrors([
          {
            param: "mobile",
            message: t("An error occurred. Please try again."),
          },
        ]);
      })
      .finally(() => {
        console.log("Request completed");
        setIsLoading(false); // Ensure loading state is reset
      });
  };
 
  const handleDoubleClick = () => {
    if (exitApp) {
      BackHandler.exitApp(); // Exits the app
    } else {
      setExitApp(true);
      ToastAndroid.show("Press again to exit", ToastAndroid.SHORT); // Optional feedback to user

      // Reset the `exitApp` state after 2 seconds
      timeoutRef.current = setTimeout(() => {
        setExitApp(false);
      }, 2000);
    }
  };

  useEffect(() => {
    const backAction = () => {
      if  (segments.join("/") === "home") {
       
        handleDoubleClick();
        return true;
      } else if (router.canGoBack()) {
        router.back(); // Navigate back if possible
        return true;
      } else {
        ToastAndroid.show("No screen to go back to!", ToastAndroid.SHORT);
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      backHandler.remove(); 
    };
  }, [exitApp, segments]);

  return (
    <SafeAreaView className="bg-white">
      <View className="flex justify-between h-full">
        <View className="mt-1 px-4">
          {/* Logo */}
          <View>
            <View className="flex-row items-end">
              <Image
                source={require("../assets/images/godesk.jpg")}
                style={{
                  width: 30,
                  height: 30,
                }}
              />
              <Text className="font-bold text-secondary-950 ms-.5 mb-1.5">
                desk <Text className="text-primary-950">Engineer</Text>
              </Text>
            </View>
          </View>
          {/* Welcome Text */}
          <View className="mt-6">
            <Text className="text-2xl font-bold">{t("welcome")}</Text>
            <Text className="color-gray-400 text-sm">
              {t(' Let’s create something extraordinary!')}
            </Text>
            
          </View>

          {/* Mobile Number Input */}
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

          {/* Login Button */}
          <View className="flex-row justify-between items-center mt-12">
            <Text className="font-bold text-primary-950 text-xl">{t("Login")}</Text>
            <Button
              className="bg-primary-950 rounded-full w-14 h-14 p-0"
              onPress={handleSendOTP}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <AntDesign name="arrowright" size={20} color="white" />
              )}
            </Button>
          </View>
        </View>

        {/* Footer Animation */}
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
          <Text className="mt-8 text-sm text-center px-8">
            {t('loginAgreement')}{" "}
            <Text
              onPress={() => {
                Linking.openURL("https://godesk.co.in/Privacy_Policy.html");
              }}
              className="font-bold text-primary-950"
            >
              {t("terms_conditions")}
            </Text>{" "}
            {t('and')}{" "}
            <Text
              onPress={() => {
                Linking.openURL("https://godesk.co.in/Privacy_Policy.html");
              }}
              className="font-bold text-primary-950"
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
