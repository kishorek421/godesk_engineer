import React from "react";
import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Link } from "expo-router";

interface PrimaryLinkProps {
  children: any;
  href: any;
  className?: string;
  onPress?: () => void;
  translate?: "local" | "api" | "none";
}

const PrimaryLink = ({
  children,
  href,
  className,
  onPress,
  translate = "local",
}: PrimaryLinkProps) => {
  // language
  const { t } = useTranslation();

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
    <Link
      href={href}
      className={`${getFontRegular(className ?? "")} ${className ?? ""} `}
    >
      {translate === "local" ? t(children) : children}
    </Link>
  );
};

export default PrimaryLink;
