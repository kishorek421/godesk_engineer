import { View, Text, SafeAreaView } from "react-native";
import React, { ReactNode } from "react";
// Assuming Translator is in this path

const BasePage = ({ children }: { children: ReactNode }) => {
  return (
    <SafeAreaView className="">
      <View>{children}</View>
    </SafeAreaView>
  );
};

export default BasePage;
