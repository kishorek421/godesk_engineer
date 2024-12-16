import { View, ActivityIndicator } from "react-native";
import * as React from 'react';
const LoadingBar = () => {
  return (
    <View className="h-full flex justify-center">
      <ActivityIndicator size="large" />
    </View>
  );
};

export default LoadingBar;
