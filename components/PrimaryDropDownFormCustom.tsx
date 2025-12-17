import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Pressable,
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

  // Sync display text whenever selectedValue or options change
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

  // Register validation resolver only once
  useEffect(() => {
    setFieldValidationStatus((prev: any) => ({
      ...prev,
      [fieldName]: (isValid: boolean) => validateFieldFunc(fieldName, isValid),
    }));
  }, []); // Runs only on mount

  // Trigger validation when requested
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
    setIsOpen(false); // Close dropdown after selection
  };

  return (
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

      {/* Dropdown Trigger */}
      <Pressable onPress={() => setIsOpen(!isOpen)}>
        <View className="flex-row items-center justify-between px-4 border border-gray-300 rounded-md bg-white w-full py-3.5">
          <Text
            className={`text-lg ${
              displayText ? "text-gray-900" : "text-gray-900"
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

      {/* Static Dropdown List Below the Field */}
      {isOpen && (
        <View className="mt-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-60">
          <FlatList
            data={options}
            keyExtractor={(_, index) => index.toString()}
            showsVerticalScrollIndicator={true}
            renderItem={({ item }) => {
              const label = typeof item === "string" ? item : item.label;
              const value = typeof item === "string" ? item : item.value;
              const isSelected = value === selectedValue;

              return (
                <TouchableOpacity
                  className={`py-3 px-4 border-b border-gray-200 last:border-b-0 ${
                    isSelected ? "" : ""
                  }`}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    className={`text-base ${
                      isSelected
                        ? "text-gray-800 font-regular"
                        : "text-gray-800 font-regular"
                    }`}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      <FormControlError>
        <FormControlErrorText>
          {isFormFieldInValid(fieldName, errors)}
        </FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
};

export default PrimaryDropdownFormFieldWithCustomDropdown;