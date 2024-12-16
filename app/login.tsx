import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import LottieView from "lottie-react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import { VStack } from "../components/ui/vstack";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import apiClient from "@/clients/apiClient";
import { ErrorModel } from "@/models/common";
import { isFormFieldInValid } from "@/utils/helper";
import { setItem } from "@/utils/secure_store";
import { AUTH_TOKEN_KEY } from "@/constants/storage_keys";
import PrimaryTextFormField from "@/components/PrimaryTextFormField";
const LoginScreen = () => {
  const animationRef = useRef<LottieView>(null);
  const [mobile, setMobileNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorModel[]>([]);
  const [canValidateField, setCanValidateField] = useState(false);

  const [fieldValidationStatus, setFieldValidationStatus] = useState<any>({});

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await requestTrackingPermissionsAsync();
      console.log("Tracking Permission Status:", status);
      // Handle the status accordingly
      if (status === "granted") {
        // Proceed with tracking-related tasks
      } else {
        // Skip or limit tracking
      }
    };

    // Request tracking permission before any data is collected
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

    await apiClient
      .post("/otp/send", { mobile })
      .then((response) => {
        console.log("Response:", response.data.data);

        if (response.data?.success) {
          // Navigate to OTP verification page
          router.push({
            pathname: "/verify_otp",
            params: { mobile }, // Use query for parameter passing
          });
        } else {
          // Handle error from the API response
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

        // Handle network or unexpected errors
        setErrors([
          {
            param: "mobile",
            message: "An error occurred. Please try again.",
          },
        ]);
      })
      .finally(() => {
        console.log("Request completed");
        setIsLoading(false); // Ensure loading state is reset
      });
  };
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
              <Text className="mb-1.5 font-bold text-secondary-950 ms-.5">
                desk <Text className="text-primary-950">Engineer</Text>
              </Text>
            </View>
          </View>

          {/* Welcome Text */}
          <View className="mt-6">
            <Text className="font-bold text-2xl">Hey, Welcome! 🎉</Text>
            <Text className="text-sm color-gray-400">
              Let’s create something extraordinary!
            </Text>
          </View>

          {/* Mobile Number Input */}
          <View className="mt-6">
            <FormControl
              isInvalid={isFormFieldInValid("mobileNo", errors).length > 0}
            >
              {/* <Input variant="outline" size="md" isInvalid={isFormFieldInValid("mobileNo", errors).length > 0}>
                <InputField
                  placeholder="Enter your mobile number"
                  className="py-2"
                  keyboardType="numeric"
                  maxLength={10}
                  value={mobile}
                  onChangeText={(text: string) => setMobileNumber(text)}
                />
              </Input> */}
              <PrimaryTextFormField
                fieldName="mobile"
                label="Mobile Number"
                placeholder="Enter your mobile number"
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
                    return "Mobile no. should start with 6-9";
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
            <Text className="font-bold text-primary-950 text-xl">Login</Text>
            <Button
              className="bg-primary-950 p-0 rounded-full w-14 h-14"
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
        <View >
          <LottieView
            ref={animationRef}
            source={require("../assets/lottie/login.json")}
            autoPlay
            loop
            style={{
              height: 200,
            }}
          />
          <Text className="mt-8 px-8 text-center text-sm">
            By logging in, you agree to our{" "}
            <Text
              onPress={() => {
                Linking.openURL("https://godesk.co.in/Terms_And_conditions.html");
              }}
              className="font-bold text-primary-950"
            >
              Terms & Conditions
            </Text>{" "}
            and{" "}
            <Text
              onPress={() => {
                Linking.openURL("https://godesk.co.in/Engineer_Privacy_Policy.html");
              }}
              className="font-bold text-primary-950"
            >
              Privacy Policy
            </Text>
          </Text>
          {/* <Text className="px-12 text-center text-sm">
          By logging in, you agree to our{" "}
          <Text
            onPress={() => {
              Linking.openURL("https://godesk.co.in/Privacy_Policy.html");
            }}
            className="font-bold text-primary-950"
          >
            Terms & Conditions
          </Text>{" "}
          and{" "}
          <Text
            onPress={() => {
              Linking.openURL("https://godesk.co.in/Privacy_Policy.html");
            }}
            className="font-bold text-primary-950"
          >
            Privacy Policy
          </Text>
        </Text> */}
        </View>
      </View>
    </SafeAreaView>
  );
}
export default LoginScreen;
function requestTrackingPermissionsAsync(): { status: any; } | PromiseLike<{ status: any; }> {
  throw new Error("Function not implemented.");
}

