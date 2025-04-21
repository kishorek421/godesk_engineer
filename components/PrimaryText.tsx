import React from "react";
import { Pressable } from "react-native";
import { Text } from "react-native";

interface PrimaryTextProps {
  children: any;
  className: string;
  onPress?: () => void;
}

const PrimaryText = ({ children, className, onPress }: PrimaryTextProps) => {
  const getFontRegular = (cn: string): string => {
    // console.log("cn", cn);

    if (
      !cn.includes("font-medium") &&
      !cn.includes("font-semibold") &&
      !cn.includes("font-bold")
    ) {
      return "font-regular";
    }
    return "";
  };
  return (
    <Text className={`${getFontRegular(className ?? "")} ${className} `}>
      {children}
    </Text>
  );
};

export default PrimaryText;
