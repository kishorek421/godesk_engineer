import { View, Text } from 'react-native'
import React from 'react'
import { Redirect } from 'expo-router'
import LoadingBar from '@/components/LoadingBar';

const Index = () => {
  // return (
  //   <Redirect href="login" />
  // )
  return (
    <View>
      <LoadingBar />
    </View>
  );
}

export default Index
//const GOOGLE_MAPS_APIKEY = 'AIzaSyArnnwpKWaI9Rp_OSC9mn-L1gG0gtj8J5A';