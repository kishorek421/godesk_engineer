import React from "react";
import { Button, ButtonSpinner, ButtonText } from "./ui/button";

interface SubmitButtonProps {
  isLoading: boolean;
  onPress: any;
  btnText: string;
  className?: string;
}

const SubmitButton = ({ isLoading, onPress, btnText }: SubmitButtonProps) => {
  return (
    <Button
      className={`bg-primary-950 mt-6 h-14 shadow-sm rounded-lg`}
      onPress={onPress}
      disabled={isLoading}
      accessible={true}
      accessibilityLabel={btnText}
    >
      <ButtonText className="text-white">{btnText}</ButtonText>
      {isLoading && <ButtonSpinner className="text-white ms-2" />}
    </Button>
  );
};

export default SubmitButton;
