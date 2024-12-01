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
import api from '@/services/api/base_api_service';
import { VERIFY_OTP} from "@/constants/api_endpoints";

const VerifyOTPScreen = () => {
  const { mobile } = useLocalSearchParams();

  const [otp, setOtp] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const animationRef = useRef<LottieView>(null);
  const [errors, setError] = useState<ErrorModel[]>([]);
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError([{ field: "otp", message: "Please enter a valid 6-digit OTP." }]);
      return;
    }

    setIsLoading(true);
    setError([]);

    try {

      await api.get(`${VERIFY_OTP}?mobile=${mobile}&otp=${otp}`).then((response) => {
        if (response.data?.success) {
          router.replace('/home');
          console.log("valid otp");
        }
      }).catch((e) => {
        console.error(e.response.request);
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError([{ field: "otp", message: "An error occurred. Please try again." }]);
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

          <View className="mt-8">
            <Text className="text-2xl font-bold">Check your mobile 📱</Text>
            <Text className="color-gray-400 text-sm">
              OTP has been sent to {mobile}.
            </Text>
          </View>

          <View className="mt-2">
            <FormControl isInvalid={isFormFieldInValid('otp', errors).length > 0}>
              <FormControlLabel className="mb-1">
                <FormControlLabelText>Enter OTP</FormControlLabelText>
              </FormControlLabel>
              <Input
                variant="outline"
                size="md"
                isInvalid={isFormFieldInValid('otp', errors).length > 0}
              >
                <InputField
                  placeholder="Enter your OTP"
                  keyboardType="numeric"
                  className="py-2"
                  maxLength={6}
                  value={otp}
                  onChangeText={(text) => setOtp(text)}
                />
              </Input>
              <FormControlError>
                <FormControlErrorText>
                  {isFormFieldInValid('otp', errors)}
                </FormControlErrorText>
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
