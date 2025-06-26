import React, { useEffect, useState } from "react";
import { Text, TextProps } from "react-native";
import { useTranslation } from "react-i18next";
import { translateUsingApi } from "@/i18n/index";

interface PrimaryTextProps extends TextProps {
  children: any;
  className?: string;
  onPress?: () => void;
  translate?: "local" | "api" | "none";
  toLang?: string; // optional, default to current language
}

const PrimaryText = ({
  children,
  className,
  onPress,
  translate = "local",
  toLang = "en",
  ...props
}: PrimaryTextProps) => {
  const { t } = useTranslation();
  const [translatedText, setTranslatedText] = useState<string>("");

  const getFontRegular = (cn: string): string => {
    if (
      !cn.includes("font-medium") &&
      !cn.includes("font-semibold") &&
      !cn.includes("font-bold")
    ) {
      return "font-regular";
    }
    return "";
  };

  useEffect(() => {
    const run = async () => {
      if (translate === "api") {
        const result = await translateUsingApi(children as string, toLang);
        setTranslatedText(result);
      }
    };
    run();
  }, [children, translate, toLang]);

  const displayText =
    children &&
    (typeof children === "string"
      ? translate === "local"
        ? t(children)
        : translate === "api"
          ? translatedText
          : children
      : children);

  return (
    <Text
      className={`${getFontRegular(className ?? "")} ${className ?? ""}`}
      onPress={onPress}
      {...props}
    >
      {displayText}
    </Text>
  );
};

export default PrimaryText;
