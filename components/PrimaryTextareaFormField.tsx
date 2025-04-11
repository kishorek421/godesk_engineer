import { View, Text, KeyboardTypeOptions } from "react-native";
import React, { useEffect, useState } from "react";
import { isFormFieldInValid, setErrorValue } from "@/utils/helper";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  FormControlLabelAstrick,
} from"@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { ErrorModel } from "@/models/common";
import { Textarea, TextareaInput } from "@/components/ui/textarea";

interface PrimaryTextareaFormFieldProps {
  fieldName: string;
  label: string;
  placeholder: string;
  errors: ErrorModel[];
  setErrors: any;
  onChangeText: (value: string) => void;
  canValidateField: boolean;
  setCanValidateField: any;
  setFieldValidationStatus: any;
  validateFieldFunc: (fieldName: string, isValid: boolean) => void;
  defaultValue?: string;
  isRequired?: boolean;
  keyboardType?: KeyboardTypeOptions;
  min?: number;
  max?: number;
  filterExp?: RegExp;
  customValidations?: (value: string) => string | undefined;
  canClearForm?: boolean;
  className?:string
}

const PrimaryTextareaFormField = ({
  fieldName,
  label,
  placeholder,
  errors,
  setErrors,
  defaultValue,
  isRequired = true,
  canValidateField,
  setCanValidateField,
  validateFieldFunc,
  setFieldValidationStatus,
  keyboardType = "default",
  onChangeText,
  min,
  max = 50,
  filterExp,
  customValidations,
  canClearForm,
  className
}: PrimaryTextareaFormFieldProps) => {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    if (canClearForm && value.length > 0) {
      setValue("");
    }
  }, [canClearForm]);

  useEffect(() => {
    setFieldValidationStatus((prevState: any) => ({
      ...prevState,
      [fieldName]: null,
    }));
  }, []);

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
    if (canValidateField) {
      validateField(value);
      setCanValidateField(false);
    }
  }, [defaultValue, canValidateField]);

  const validateField = (newValue: string) => {
    if (isRequired && newValue.length === 0) {
      validateFieldFunc(fieldName, false);
      setErrorValue(
        fieldName,
        value,
        `Please enter a ${label.toLowerCase()}`,
        setErrors,
      );
      return;
    }
    if (customValidations) {
      const errorValidationMsg = customValidations(value);
      if (errorValidationMsg) {
        validateFieldFunc(fieldName, false);
        setErrorValue(fieldName, value, errorValidationMsg, setErrors);
        return;
      }
    }
    const valLen = newValue.length;
    if (min && valLen < min) {
      validateFieldFunc(fieldName, false);
      // if this field is not valid set validField is false
      setErrorValue(
        fieldName,
        value,
        `Min. length should be ${min}`,
        setErrors,
      );
      return;
    }
    validateFieldFunc(fieldName, true);
    setErrorValue(fieldName, value, "", setErrors);
  };

  return (
    <FormControl
      key={fieldName}
      isInvalid={isFormFieldInValid(fieldName, errors).length > 0}
    >
      <FormControlLabel className="mb-1">
        <FormControlLabelText>{label}</FormControlLabelText>
        <FormControlLabelAstrick className="text-red-400 ms-0.5">
          {isRequired ? "*" : ""}
        </FormControlLabelAstrick>
      </FormControlLabel>
      <Textarea size="md" variant="default">
        <TextareaInput
          placeholder={placeholder}
          value={value}
          keyboardType={keyboardType}
          onChangeText={(newValue) => {
            // if expression not null and value matches the expressions(regular expressions)
            if (filterExp && !filterExp.test(newValue)) {
              return;
            }
            const valLen = newValue.length;
            if (max && valLen <= max) {
              onChangeText(newValue);
              setValue(newValue);
            }
            validateField(newValue);
          }}
        />
      </Textarea>
      <FormControlError>
        <FormControlErrorText>
          {isFormFieldInValid(fieldName, errors)}
        </FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
};

export default PrimaryTextareaFormField;
