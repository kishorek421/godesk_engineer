import React, { useRef, useState } from "react";
import { View, Text, SafeAreaView, Image, TouchableOpacity } from "react-native";
import LottieView from "lottie-react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import { VStack } from "../components/ui/vstack";
import { FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorText } from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import apiClient from "@/clients/apiClient";
import { ErrorModel } from "@/models/common";
import { isFormFieldInValid } from "@/utils/helper";
import { setItem } from "@/utils/secure_store";
import { AUTH_TOKEN_KEY } from "@/constants/storage_keys";

const LoginScreen = () => {
  const animationRef = useRef<LottieView>(null);

  const [mobile, setMobileNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorModel[]>([]);
  
  const handleSendOTP = async () => {
    await setItem(
      AUTH_TOKEN_KEY,
      "eyJhbGciOiJIUzUxMiJ9.eyJwYXNzd29yZCI6Ik5GVFdMNzltOTNLU3IvS1crdDNLRzI3YWxWT2l4bGg1a0FGVnhROG1VRlk9Iiwicm9sZSI6WyJGSUVMRF9FTkdJTkVFUiJdLCJpZCI6IjliYTA0OWQxLTFiNTEtNGNlMS05MzkyLTViYTUyZjE1NWY0OSIsInVzZXJPcmdEZXRhaWxzIjp7ImxlYWRJZCI6ImUwZmJlZmNiLTFiZWYtNDhhNy1hNmVmLTlmZThhZTczYzk3ZiIsIm9yZ0lkIjoiYjBiYzhiZTUtZTRlYi00NTAzLWE4MTMtMTNiOTdiNzZjNzczIiwib3JnRGVwYXJ0bWVudElkIjoiMjUxMWI0NGQtOTE1ZC00NTM1LTliNzgtMGVjNTkyYzBhMDFjIiwib3JnRGVzaWduYXRpb25JZCI6IjY1MWYwYjNjLWM3ZDAtNGQyNi05NzEwLWE0NGJiZGFlMWQyZCJ9LCJlbWFpbCI6ImJoYXJhdGlwYXJpdDRAZ21haWwuY29tIiwidXNlcm5hbWUiOiJCaGFyYXRpIiwic3ViIjoiYmhhcmF0aXBhcml0NEBnbWFpbC5jb20iLCJpYXQiOjE3MzMyMjQyMzQsImV4cCI6MTczMzI1MzAzNH0.979q9XCjMS9FoenTFX3m0cSLfBxe4fWBdmLoGzOcsjCYbCI2Jn3Z-sqYKDnxJNxo2BL9HUw2sAPqDWhy38dgYQ");
    
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      setErrors([{ field: "mobileNo", message: "Please enter a valid 10-digit mobile number." }]);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    await apiClient.post('/otp/send', { mobile }).then((response) => {
      if (response.data?.success) {
        router.push({
          pathname: '/verify_otp',
          params: { mobile },
        });
      } else {
        setErrors([{ field: "mobileNo", message: response.data?.message || 'Failed to send OTP. Try again.' }]);
      }
    }).catch((error) => {
      if (error) {
        console.error('Error sending OTP:', error.response.data);
      }
      setErrors([{ field: "mobileNo", message: "An error occurred. Please try again." }]);
    }).finally(() => {
      setIsLoading(false);
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
              <Text className="font-bold text-secondary-950 ms-.5 mb-1.5">
                desk <Text className="text-primary-950">Engineer</Text>
              </Text>
            </View>
          </View>

          {/* Welcome Text */}
          <View className="mt-6">
            <Text className="text-2xl font-bold">Hey, Welcome! 🎉</Text>
            <Text className="color-gray-400 text-sm">Let’s create something extraordinary!</Text>
          </View>

          {/* Mobile Number Input */}
          <View className="mt-6">
            <FormControl isInvalid={isFormFieldInValid("mobileNo", errors).length > 0}>
              <FormControlLabel className="mb-1">
                <FormControlLabelText>Mobile Number</FormControlLabelText>
              </FormControlLabel>
              <Input variant="outline" size="md" isInvalid={isFormFieldInValid("mobileNo", errors).length > 0}>
                <InputField
                  placeholder="Enter your mobile number"
                  className="py-2"
                  keyboardType="numeric"
                  maxLength={10}
                  value={mobile}
                  onChangeText={(text: string) => setMobileNumber(text)}
                />
              </Input>
              <FormControlError>
                <FormControlErrorText>
                  {isFormFieldInValid("mobileNo", errors)}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          </View>

          {/* Login Button */}
          <View className="flex-row justify-between items-center mt-12">
            <Text className="font-bold text-primary-950 text-xl">Login</Text>
            <Button className="bg-primary-950 rounded-full w-14 h-14 p-0" onPress={handleSendOTP}>
              <AntDesign name="arrowright" size={20} color="white" />
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
            By logging in, you agree to our <Text className="text-primary-950 font-bold">Terms & Conditions</Text> and{" "}
            <Text className="font-bold text-primary-950">Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
