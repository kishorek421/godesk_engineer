import { View, Text, SafeAreaView, Image, TouchableOpacity } from 'react-native'
import React, { useRef, useState } from 'react'
import { VStack } from '../components/ui/vstack'
import LottieView from 'lottie-react-native';
import { FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorText } from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { isFormFieldInValid } from '@/utils/helper';
import { ErrorModel } from '@/models/common';
import { router } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Button, ButtonSpinner } from '@/components/ui/button';

const LoginScreen = () => {
  const animationRef = useRef<LottieView>(null);

  const [errors, setErrors] = useState<ErrorModel[]>([]);

  return (
    <SafeAreaView className='bg-white'>
      <View className='flex justify-between h-full'>
        <View className='mt-1 px-4'>
          <View>
            <View className='flex-row items-end'>
              <Image
                source={require('../assets/images/godesk.jpg')}
                style={{
                  width: 40,
                  height: 40,
                }}
              />
              <Text className='font-bold text-secondary-950 ms-.5 text-lg mb-2'>
                desk <Text className='text-primary-950'>Engineer</Text>
              </Text>
            </View>
            {/* <Text className='font-bold text-secondary-950'>Employee</Text> */}
          </View>
          <View className='mt-8'>
            <Text className="text-2xl font-bold">
              Hey, Welcome! 🎉
            </Text>
            <Text className="color-gray-400 text-sm">
              Let’s create something extraordinary!
            </Text>
          </View>
          <View className='mt-4'>
            <FormControl
              isInvalid={isFormFieldInValid("mobileNo", errors).length > 0}
            >
              <FormControlLabel className="mb-1">
                <FormControlLabelText>Mobile Number</FormControlLabelText>
              </FormControlLabel>
              <Input
                variant="outline"
                size="md"
                isDisabled={false}
                isInvalid={false}
                isReadOnly={false}

              >
                <InputField
                  placeholder="Enter your mobile number"
                  className='py-2'
                  onChangeText={(e) => {
                    // setEmail(e);
                  }}
                />
              </Input>
              <FormControlError>
                <FormControlErrorText>
                  {isFormFieldInValid("mobileNo", errors)}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          </View>
          <View className='flex-row justify-between items-center mt-12'>
            <Text className='font-bold text-primary-950 text-xl '>Login</Text>
            <TouchableOpacity onPress={() => {
              router.replace("(home)/home")
            }}>

              <Button className='bg-primary-950 rounded-full w-14 h-14 p-0' onPress={() => {
                router.push("/verify_otp")
              }}>
                <AntDesign name="arrowright" size={20} color="white" />
                {/* <ButtonSpinner className='text-white'/> */}
              </Button>
              {/* <View className='bg-primary-950 rounded-full p-4'>
                <AntDesign name="arrowright" size={20} color="white" />

              </View> */}
            </TouchableOpacity>
          </View>
        </View>
        <View className=''>
          <LottieView
            ref={animationRef}
            source={require("../assets/lottie/login.json")}
            autoPlay
            loop
            style={{
              height: 200,
            }}
          />
          <Text className='mt-8 text-sm text-center px-8 '>By logging in, you agree to our <Text className='text-primary-950 font-bold'>Terms & Conditions</Text> and <Text className='font-bold text-primary-950'>Privacy Policy</Text></Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default LoginScreen