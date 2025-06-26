import { primaryColor } from "@/constants/colors";
import { useToast } from "@/context/ToastContext";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, Animated, Dimensions } from "react-native";

const Toast: React.FC = () => {
  const { toast, hideToast } = useToast();
  const { visible, message, type, duration, position, backgroundColor } = toast;
  const [fadeAnim] = useState(new Animated.Value(0));
  const windowHeight = Dimensions.get("window").height;
  // translation
  const { t } = useTranslation();

  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    return type === "success" ? primaryColor : "#EF4444cc"; // Green for success, red for error
  };

  React.useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: duration || 2000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        hideToast();
      });
    }
  }, [visible, duration, hideToast]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          backgroundColor: getBackgroundColor(),
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [position === "top" ? -50 : 50, 0],
              }),
            },
          ],
        },
      ]}
      className={`absolute rounded-md px-4 py-2 self-center ${position === "top" ? "top-12" : "bottom-12"}`}
    >
      <Text className="text-white text-base">
        {toast.translate === "local" ? t(message) : toast.message}{" "}
        {/* if toast.translate === "api" use live translation */}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  alignSelf: "center",
  },
});

export default Toast;
