import { View, Text, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { ReactNode } from "react";
// Assuming Translator is in this path

type BasePageProps = { children: ReactNode; includeTop?: boolean };

const BasePage = ({ children, includeTop = false }: BasePageProps) => {
  const edges = includeTop
    ? (["top", "left", "right", "bottom"] as const)
    : (["left", "right", "bottom"] as const);
  return (
    <SafeAreaView className="" edges={edges}>
      <StatusBar
                      backgroundColor="#ffffff"
                      barStyle="dark-content"
                      translucent={false}
                    />
      <View>{children}</View>
    </SafeAreaView>
  );
};

export default BasePage;
