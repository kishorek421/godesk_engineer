import { useEffect } from "react";
import { getAorAn, isFormFieldInValid, setErrorValue } from "@/utils/helper";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlLabelAstrick,
  FormControlError,
  FormControlErrorText,
} from "../components/ui/form-control";
import { ErrorModel } from "@/models/common";
import PrimaryDropdownField from "./PrimaryDropdownField";
import React from "react";
import { messages } from "@/i18n/constant";
import i18n from "@/i18n";
import { t } from "i18next";

interface PrimaryDropdownFormFieldProps {
  options: any[];
  selectedValue: any;
  setSelectedValue: any;
  type: any;
  onItemSelect?: (type: string, selectedItem: any) => void;
  placeholder: string;
  canValidateField: boolean;
  setCanValidateField: any;
  setFieldValidationStatus: any;
  validateFieldFunc: (fieldName: string, isValid: boolean) => void;
  fieldName: string;
  errors: ErrorModel[];
  setErrors: any;
  label: string;
  isRequired?: boolean;
  defaultValue?: any;
  className?: string;
  onEndReached?: () => void;
  contentClassName?: string;
  defaultErrorMsg?: string;
  onClear?: () => void;
  parentRef?: React.RefObject<any>;
  emptyMsg?:string;
  disabled?:boolean

}

const PrimaryDropdownFormField = ({
  options,
  selectedValue,
  setSelectedValue,
  type,
  onItemSelect,
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
  onEndReached,
  contentClassName,
  defaultErrorMsg,
  onClear,
  parentRef,
  emptyMsg,
  disabled=false,
}: PrimaryDropdownFormFieldProps) => {
  // useEffect(() => {}, [selectedValue]);
  const lng = i18n.language;
  useEffect(() => {
    if (defaultValue) {
      setSelectedValue(defaultValue);
    }
  }, [defaultValue]);

  useEffect(() => {
    setFieldValidationStatus((prevState: any) => ({
      ...prevState,
      [fieldName]: null,
    }));
  }, []);

  useEffect(() => {
    if (canValidateField) {
      validateField(selectedValue);
      setCanValidateField(false);
    }
  }, [canValidateField]);

  const validateField = (newValue: any) => {
    //console.log("newValue", newValue);
    if (isRequired && (newValue === undefined || newValue.length === 0)) {
      validateFieldFunc(fieldName, false);
      setErrorValue(
        fieldName,
        newValue ?? "",
        // `Please select ${getAorAn(label)} ${label.toLowerCase()}`,
        messages[lng as keyof typeof messages]["label1"](
          label,
          getAorAn(label),
          t,
        ),
        setErrors,
      );
      return;
    }
    validateFieldFunc(fieldName, true);
    setErrorValue(fieldName, newValue ?? "", "", setErrors);
  };

  return (
    <FormControl
      isInvalid={isFormFieldInValid(fieldName, errors).length > 0}
      className={className}
    >
      <FormControlLabel className="mb-4 ">
        <FormControlLabelText>{label}</FormControlLabelText>
        <FormControlLabelAstrick className="text-red-400 ms-0.5">
          {isRequired ? "*" : ""}
        </FormControlLabelAstrick>
      </FormControlLabel>
      <PrimaryDropdownField
        options={options}
        selectedValue={selectedValue}
        placeholder={placeholder}
        onItemSelect={(type, selectedItem) => {
          //console.log("selectedItem", selectedItem);
          onItemSelect && onItemSelect(type, selectedItem);
          validateField(selectedItem);
        }}
        type={type}
        setSelectedValue={setSelectedValue}
        contentClassName={contentClassName}
        onEndReached={onEndReached}
        parentRef={parentRef}
        onClear={onClear}
        emptyMsg={emptyMsg}
        disabled={disabled}
      />
      <FormControlError>
        <FormControlErrorText>
          {isFormFieldInValid(fieldName, errors)}
        </FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
};

export default PrimaryDropdownFormField;