import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal, Pressable } from "react-native";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { isFormFieldInValid, setErrorValue } from "@/utils/helper";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlLabelAstrick,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { ErrorModel } from "@/models/common";
import { DropdownProps } from "@/models/common";

interface PrimaryDropdownFormFieldProps {
  options: (string | { label: any; value: any })[];
  selectedValue: string; // Expect string (e.g., option value or key)
  setSelectedValue: (value: string) => void;
  type: any;
  onSelect: (selected: string) => void;
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
  defaultValue?: string; // Expect string (e.g., default key)
  className?: string;
}

const PrimaryDropdownFormFieldWithCustomDropdown = ({
  options,
  selectedValue,
  setSelectedValue,
  type,
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
  defaultValue,
  className = "",
}: PrimaryDropdownFormFieldProps) => {
  const [visible, setVisible] = useState(false);
  const [inputText, setInputText] = useState<string>("");

  // Initialize with defaultValue
  useEffect(() => {
    if (defaultValue) {
      const selectedOption = options.find(
        (item) => (typeof item === "string" ? item : item.value) === defaultValue
      );
      if (selectedOption) {
        setSelectedValue(defaultValue);
        setInputText(typeof selectedOption === "string" ? selectedOption : selectedOption.label);
      }
    }
  }, [defaultValue, options]);

  // Sync inputText with selectedValue changes
  useEffect(() => {
    if (selectedValue) {
      const selectedOption = options.find(
        (item) => (typeof item === "string" ? item : item.value) === selectedValue
      );
      if (selectedOption) {
        setInputText(typeof selectedOption === "string" ? selectedOption : selectedOption.label);
      } else {
        setInputText(""); // Reset if selectedValue is invalid
      }
    } else {
      setInputText(""); // Show placeholder if no selection
    }
  }, [selectedValue, options]);

  // Initialize field validation status
  useEffect(() => {
    setFieldValidationStatus((prevState: any) => ({
      ...prevState,
      [fieldName]: null,
    }));
  }, [fieldName]);

  // Validate field when canValidateField changes
  useEffect(() => {
    if (canValidateField) {
      validateField(selectedValue);
      setCanValidateField(false);
    }
  }, [canValidateField, selectedValue]);

  const validateField = (value: string) => {
    if (isRequired && !value) {
      validateFieldFunc(fieldName, false);
      setErrorValue(
        fieldName,
        value,
        `Please select a ${label.toLowerCase()}`,
        setErrors
      );
    } else {
      validateFieldFunc(fieldName, true);
      setErrorValue(fieldName, value, "", setErrors);
    }
  };

  const handleSelect = (item: string | { label: string; value: string }) => {
    const value = typeof item === "string" ? item : item.value;
    const label = typeof item === "string" ? item : item.label;
    setSelectedValue(value);
    setInputText(label);
    onSelect(value);
    setVisible(false);
    validateField(value); // Re-validate on selection
  };

  return (
    <FormControl isInvalid={isFormFieldInValid(fieldName, errors).length > 0} className={className}>
      <FormControlLabel className="mb-1">
        <FormControlLabelText>{label}</FormControlLabelText>
        <FormControlLabelAstrick className="text-red-400 ms-0.5">{isRequired ? "*" : ""}</FormControlLabelAstrick>
      </FormControlLabel>
      {/* Custom Dropdown */}
      <Pressable onPress={() => setVisible(true)}>
        <View className="flex-row items-center justify-between px-4 border border-gray-300 rounded-md bg-white w-full py-3.5">
          <Text className={`${inputText ? "text-gray-900" : "text-gray-500"} text-lg`}>
            {inputText || placeholder}
          </Text>
          <SimpleLineIcons name="arrow-down" size={16} color="#a9a9a9" />
        </View>
      </Pressable>

      {/* Dropdown Modal */}
      <Modal transparent animationType="fade" visible={visible} onRequestClose={() => setVisible(false)}>
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View className="w-96 max-h-96 bg-white rounded-lg p-4 shadow-lg">
            <FlatList
              data={options}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => {
                const displayText = typeof item === "string" ? item : item.label;
                return (
                  <TouchableOpacity className="py-3 border-b border-gray-200" onPress={() => handleSelect(item)}>
                    <Text className="text-base text-gray-800 font-regular">{displayText}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <FormControlError>
        <FormControlErrorText>{isFormFieldInValid(fieldName, errors)}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
};

export default PrimaryDropdownFormFieldWithCustomDropdown;