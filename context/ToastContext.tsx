import React, { createContext, useState, ReactNode } from "react";

export type ToastType = "success" | "error";

interface ToastConfig {
  message: string;
  message1?:string;
  type?: ToastType;
  duration?: number;
  position?: "top" | "bottom";
  backgroundColor?: string;
  translate?: "local" | "api";
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
  toast: ToastConfig & { visible: boolean };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<ToastConfig & { visible: boolean }>({
    message: "",
    message1:"",
    visible: false,
    type: "success",
    duration: 2000,
    position: "bottom",
    translate: "local",
  });

  const showToast = (config: ToastConfig) => {
    setToast({
      visible: true,
      message: config.message,
      message1:config.message1,
      type: config.type || "success",
      duration: config.duration || 2000,
      position: config.position || "bottom",
      backgroundColor: config.backgroundColor,
      translate: config.translate || "local",
    });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast, toast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
