import { View, Text, SafeAreaView, Image } from 'react-native';
import React, { useRef, useState } from 'react';
import { VStack } from '../components/ui/vstack';
import LottieView from 'lottie-react-native';
import { FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorText } from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { isFormFieldInValid } from '@/utils/helper';
import { ErrorModel } from '@/models/common';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Button } from '@/components/ui/button';
import apiClient from '@/clients/apiClient';
import { setItem } from '@/utils/secure_store';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/constants/storage_keys';
import PrimaryTextFormField from "@/components/PrimaryTextFormField";
const VerifyOTPScreen = () => {
  const { mobile } = useLocalSearchParams();

  const [otp, setOtp] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const animationRef = useRef<LottieView>(null);

  const [canValidateField, setCanValidateField] = useState(false);
  const [errors, setErrors] = useState<ErrorModel[]>([]);
  const [fieldValidationStatus, setFieldValidationStatus] = useState<any>({});

  const setFieldValidationStatusFunc = (
    fieldName: string,
    isValid: boolean,
  ) => {
    if (fieldValidationStatus[fieldName]) {
      fieldValidationStatus[fieldName](isValid);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setErrors([{ param: "otp", message: "Please enter a valid 6-digit OTP." }]);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {

      await apiClient.get(`/otp/verify?mobile=${mobile}&otp=${otp}`).then(async (response) => {
        if (response.data?.success) {
          const loginData = response.data?.data;
          if (loginData && loginData.token) {
            await setItem(AUTH_TOKEN_KEY, loginData.token);
            await setItem(REFRESH_TOKEN_KEY, loginData.refreshToken);
            router.replace('/home');
          }
        }
      }).catch((e) => {
        console.error(e.response.request);
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setErrors([{ param: "otp", message: "An error occurred. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-white">
      <View className="flex justify-between h-full">
        <View className="mt-1 px-4">
          <View>
            <View className="flex-row items-end">
              <Image
                source={require('../assets/images/godesk.jpg')}
                style={{ width: 30, height: 30 }}
              />
              <Text className="font-bold text-secondary-950 ms-.5 mb-1.5">
                desk <Text className="text-primary-950">Engineer</Text>
              </Text>
            </View>
          </View>
          <View className="mt-6">
            <Text className="text-2xl font-bold">Check your mobile 📱</Text>
            <Text className="color-gray-400 text-sm">
              OTP has been sent to {mobile}.
            </Text>
          </View>

          <View className="mt-6">
            <FormControl
              isInvalid={isFormFieldInValid("otp", errors).length > 0}
              className="mt-4 "
            >
              <PrimaryTextFormField
                fieldName="Enter OTP"
                label="Enter OTP"
                placeholder="Enter your OTP"
                // defaultValue={.orgMobile}
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
                onChangeText={(e: any) => setOtp(e)}
              />
              {/* <Input variant="outline" size="md" isDisabled={false} isReadOnly={false}>
                          <InputField
                            placeholder="Enter customer otp"
                            className="py-2"
                            onChangeText={(e: any) => setOtp(e)}  // Ensure the OTP is set correctly
                          />
                        </Input> */}
              <FormControlError>
                <FormControlErrorText>{isFormFieldInValid("otp", errors)}</FormControlErrorText>
              </FormControlError>
            </FormControl>
          </View>

          <View className="flex-row justify-between items-center mt-12">
            <Text className="font-bold text-primary-950 text-xl">Verify OTP</Text>
            <Button
              className="bg-primary-950 rounded-full w-14 h-14 p-0"

              onPress={handleVerifyOTP}
            >
              <AntDesign name="arrowright" size={20} color="white" />
            </Button>
          </View>
        </View>

        <View>
          <LottieView
            ref={animationRef}
            source={require('../assets/lottie/login.json')}
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
