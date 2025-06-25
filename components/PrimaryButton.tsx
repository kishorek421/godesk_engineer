import React from "react";
import { Button, ButtonSpinner, ButtonText } from "./ui/button";
import { useTranslation } from "react-i18next";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
interface PrimaryButtonProps {
  isLoading: boolean;
  onPress: any;
  btnText: any;
  className?: string;
  rightIcon?: any;
  leftIcon?: any;


  translate?: "local" | "api" | "none";
}

const PrimaryButton = ({
  isLoading,
  onPress,
  btnText,
  className,
  rightIcon,
  leftIcon,
  translate = "local",
}: PrimaryButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button
      className={`bg-primary-950 mt-6 h-14 shadow-sm rounded-lg ${className ?? ""}`}
      onPress={onPress}
      disabled={isLoading}
    >
      {leftIcon && (
        <MaterialIcons name={leftIcon as any} size={18} color="#fff" />
      )}
      <ButtonText className="text-white">  {translate === "local" ? t(btnText) : btnText}</ButtonText>
      {isLoading && <ButtonSpinner className="text-white ms-2" />}
      {rightIcon && (
  <MaterialIcons name={rightIcon as any} size={18} color="#fff" className="mx-2" />
      )}
    </Button>
  );
};

export default PrimaryButton;
