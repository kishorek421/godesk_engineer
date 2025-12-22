import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Pressable,
  TouchableWithoutFeedback,
  Dimensions,
  Keyboard,
} from "react-native";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlLabelAstrick,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { ErrorModel } from "@/models/common";
import { isFormFieldInValid, setErrorValue } from "@/utils/helper";

interface PrimaryDropdownFormFieldProps {
  options: (string | { label: string; value: string })[];
  selectedValue: string;
  setSelectedValue: (value: string) => void;
  onSelect?: (selected: string) => void;
  placeholder: string;
  canValidateField: boolean;
  setCanValidateField: (value: boolean) => void;
  setFieldValidationStatus: any;
  validateFieldFunc: (fieldName: string, isValid: boolean) => void;
  fieldName: string;
  errors: ErrorModel[];
  setErrors: any;
  label: string;
  isRequired?: boolean;
  className?: string;
}

const PrimaryDropdownFormFieldWithCustomDropdown = ({
  options,
  selectedValue,
  setSelectedValue,
  onSelect,
  placeholder,
  errors,
  setErrors,
  fieldName,
  label,
  isRequired = true,
  canValidateField,
  setCanValidateField,
  validateFieldFunc,
  setFieldValidationStatus,
  className = "",
}: PrimaryDropdownFormFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayText, setDisplayText] = useState<string>("");

  // Update displayed text when selectedValue changes
  useEffect(() => {
    if (selectedValue) {
      const selectedOption = options.find((item) => {
        if (typeof item === "string") return item === selectedValue;
        return item.value === selectedValue;
      });

      const label =
        typeof selectedOption === "string"
          ? selectedOption
          : selectedOption?.label || selectedValue;

      setDisplayText(label);
    } else {
      setDisplayText("");
    }
  }, [selectedValue, options]);

  // Register validation function
  useEffect(() => {
    setFieldValidationStatus((prev: any) => ({
      ...prev,
      [fieldName]: (isValid: boolean) => validateFieldFunc(fieldName, isValid),
    }));
  }, [fieldName, validateFieldFunc, setFieldValidationStatus]);

  // Validate when requested from parent
  useEffect(() => {
    if (canValidateField) {
      validateField(selectedValue);
      setCanValidateField(false);
    }
  }, [canValidateField, selectedValue]);

  const validateField = (value: string) => {
    if (isRequired && !value) {
      setErrorValue(
        fieldName,
        value,
        `Please select a ${label.toLowerCase()}`,
        setErrors
      );
      return false;
    }
    setErrorValue(fieldName, value, "", setErrors);
    return true;
  };

  const handleSelect = (item: string | { label: string; value: string }) => {
    const value = typeof item === "string" ? item : item.value;
    const label = typeof item === "string" ? item : item.label;

    setSelectedValue(value);
    setDisplayText(label);
    onSelect?.(value);
    setIsOpen(false);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    Keyboard.dismiss();
  };

  return (
    <View className="relative">
      {/* Main Form Field */}
      <FormControl
        isInvalid={isFormFieldInValid(fieldName, errors).length > 0}
        className={className}
      >
        <FormControlLabel className="mb-1">
          <FormControlLabelText>{label}</FormControlLabelText>
          {isRequired && (
            <FormControlLabelAstrick className="text-red-400 ms-0.5">
              *
            </FormControlLabelAstrick>
          )}
        </FormControlLabel>

        {/* Trigger */}
        <Pressable onPress={() => setIsOpen(!isOpen)}>
          <View
            pointerEvents="box-only"
            className="flex-row items-center justify-between px-4 py-3.5 border border-gray-300 rounded-md bg-white"
          >
            <Text
              className={`text-lg flex-1 ${
                displayText ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {displayText || placeholder}
            </Text>
            <SimpleLineIcons
              name={isOpen ? "arrow-up" : "arrow-down"}
              size={16}
              color="#a9a9a9"
            />
          </View>
        </Pressable>

        {/* Error Message */}
        <FormControlError>
          <FormControlErrorText>
            {isFormFieldInValid(fieldName, errors)}
          </FormControlErrorText>
        </FormControlError>
      </FormControl>

      {/* Dropdown List - Absolute positioned below the field */}
      {isOpen && (
        <View className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60">
          <FlatList
            data={options}
            keyExtractor={(_, index) => index.toString()}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            renderItem={({ item }) => {
              const label = typeof item === "string" ? item : item.label;
              const value = typeof item === "string" ? item : item.value;
              const isSelected = value === selectedValue;

              return (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  className={`py-3 px-4 border-b border-gray-200 last:border-b-0 ${
                    isSelected ? "" : ""
                  }`}
                >
                  <Text
                    className={`text-base ${
                      isSelected ? "text-gray-800" : "text-gray-800"
                    }`}
                  >
                    {label}
                  </Text>
                  <View className="h-[1px] bg-gray-200 mt-2" />
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {/* Invisible Full-Screen Overlay - Closes dropdown on outside tap */}
      {isOpen && (
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View
            style={{
              position: "absolute",
              top: -Dimensions.get("window").height,
              left: -Dimensions.get("window").width,
              right: -Dimensions.get("window").width,
              bottom: -Dimensions.get("window").height,
              zIndex: 40, // Below dropdown (which has z-50)
            }}
          />
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

export default PrimaryDropdownFormFieldWithCustomDropdown;