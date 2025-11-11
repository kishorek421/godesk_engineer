import {
  View,
  KeyboardTypeOptions,
  Pressable,
  Platform,
  Text,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getAorAn, isFormFieldInValid, setErrorValue } from "@/utils/helper";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  FormControlLabelAstrick,
} from "../components/ui/form-control";
import { Input, InputField } from "../components/ui/input";
import { ErrorModel } from "@/models/common";
import { TextCase } from "@/enums/enums";
import Feather from "@expo/vector-icons/Feather";
import { messages } from "@/i18n/constant";
import i18n from "@/i18n";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import PrimaryText from "@/components/PrimaryText";

interface PrimaryTextFormFieldProps {
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
  keyboardType?: KeyboardTypeOptions | "number-pad";
  min?: number;
  max?: number;
  filterExp?: RegExp;
  customValidations?: (value: string) => string | undefined;
  textCase?: TextCase;
  inputType?: "text" | "password";
  className?: string;
  inputCN?: string;
  prefix?: string | React.ReactNode;
  suffix?: string | React.ReactNode;
  prefixStyle?: string;
  suffixStyle?: string;
  isDisabled?: boolean;
  textAlign?: string;
}

const PrimaryTextFormField = ({
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
  textCase = TextCase.freeform,
  inputType,
  className = "",
  inputCN = "",
  prefix,
  prefixStyle = "",
  suffix,
  suffixStyle = "",
  isDisabled = false,
  textAlign = "left",
}: PrimaryTextFormFieldProps) => {
  const [value, setValue] = useState<string>("");
  const [isSecured, setIsSecured] = useState(false);
  const lng = i18n.language;

  const { t } = useTranslation();
  useEffect(() => {
    if (inputType === "password") {
      setIsSecured(true);
    }
  }, [inputType]);

  useEffect(() => {
    // console.log("fieldName", fieldName);

    setFieldValidationStatus((prevState: any) => ({
      ...prevState,
      [fieldName]: null,
    }));
  }, []);

  useEffect(() => {
    console.log("defaultValue ~~~~~~~~~~~~~~~~~~~~~~~~~~~~>", defaultValue);
    setValue(defaultValue ?? "");
  }, [defaultValue]);

  useEffect(() => {
    // console.log("canValidateField ---------------------->", canValidateField);

    if (canValidateField) {
      validateField(value);
      setCanValidateField(false);
    }
  }, [canValidateField]);

  const validateField = (newValue: string) => {
    if (isRequired && newValue.length === 0) {
      validateFieldFunc(fieldName, false);
      setErrorValue(
        fieldName,
        value,
        messages[lng as keyof typeof messages]["label"](
          label,
          getAorAn(label),
          t
        ),
        setErrors
      );
      return;
    }
    const valLen = newValue.length;
    if (customValidations && valLen > 0) {
      const errorValidationMsg = customValidations(newValue);
      if (errorValidationMsg) {
        validateFieldFunc(fieldName, false);
        setErrorValue(fieldName, value, errorValidationMsg, setErrors);
        return;
      }
    }
    if (valLen > 0 && min && valLen < min) {
      validateFieldFunc(fieldName, false);
      // if this field is not valid set validField is false
      setErrorValue(
        fieldName,
        value,
        messages[lng as keyof typeof messages]["min"](min),
        setErrors
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
      className={className}
    >
      <FormControlLabel className="mb-1">
        <FormControlLabelText>{label}</FormControlLabelText>
        <FormControlLabelAstrick className="text-red-400 ms-0.5">
          {isRequired ? "*" : ""}
        </FormControlLabelAstrick>
      </FormControlLabel>

      <Input
        variant="outline"
        size="md"
        className={`h-14  ${inputCN ?? ""}`}
        isDisabled={isDisabled}
      >
        {prefix &&
          (typeof prefix === "string" ? (
            <PrimaryText className={`mr-2 ${prefixStyle}`}>
              {prefix}
            </PrimaryText>
          ) : (
            <View className="mr-2">{prefix}</View>
          ))}
        <InputField
          type={!isSecured ? "text" : inputType}
          placeholder={t(placeholder)}
          value={value}
          textAlign="left"
          autoCapitalize={textCase !== TextCase.freeform ? "none" : "sentences"}
          secureTextEntry={
            textCase !== TextCase.freeform
              ? Platform.OS === "ios"
                ? false
                : true
              : isSecured
          }
         keyboardType={
            inputType === "password"
              ? "number-pad"
              : textCase !== TextCase.freeform
                ? "visible-password"
                : keyboardType
          }
          onChangeText={(newValue: string) => {
            console.log("newValue", newValue);

            // if expression not null and value matches the expressions(regular expressions)
            if (filterExp && !filterExp.test(newValue)) {
              return;
            }

            const valLen = newValue.length;
            let caseValue = newValue;
            // console.log("caseValue", caseValue);
            if (max && valLen <= max) {
              switch (textCase) {
                case TextCase.uppercase:
                  caseValue = newValue.toLocaleUpperCase();
                  break;
                case TextCase.lowercase:
                  caseValue = newValue.toLocaleLowerCase();
                  break;
              }
              // console.log("caseValue 2222->", caseValue);

              onChangeText(caseValue);
              setValue(caseValue);
            }
            validateField(caseValue);
          }}
        />
        {suffix &&
          (typeof suffix === "string" ? (
            <Text className={`ml-2 ${suffixStyle}`}>{suffix}</Text>
          ) : (
            <View className="ml-2">{suffix}</View>
          ))}
        {inputType === "password" && (
          <Pressable
            onPress={() => {
              setIsSecured(!isSecured);
            }}
          >
            <View className="h-full w-12 flex-row justify-center items-center">
              <Feather
                name={isSecured ? "eye-off" : "eye"}
                size={18}
                color="#9ca3af"
              />
            </View>
          </Pressable>
        )}
      </Input>
      {/* <View className="flex-row items-center border-[1px] border-gray-300 px-3 rounded-md h-14">
        <TextInput
          className="flex-1"
          // keyboardType={keyboardType}
          placeholder={placeholder}
          secureTextEntry={isSecured}
          onChangeText={(newValue) => {
            // if expression not null and value matches the expressions(regular expressions)
            if (filterExp && !filterExp.test(newValue)) {
              return;
            }
            const valLen = newValue.length;
            let caseValue = newValue;
            if (max && valLen <= max) {
              switch (textCase) {
                case TextCase.uppercase:
                  caseValue = newValue.toUpperCase();
                  break;
                case TextCase.lowercase:
                  caseValue = newValue.toLowerCase();
                  break;
              }
              onChangeText(caseValue);
              setValue(caseValue);
            }
            validateField(caseValue);
          }}
        />
        {inputType === "password" && (
          <Pressable
            onPress={() => {
              setIsSecured(!isSecured);
            }}
          >
            <Feather
              name={isSecured ? "eye-off" : "eye"}
              className="me-3"
              size={16}
              color="#9ca3af"
            />
          </Pressable>
        )}
      </View> */}
      <FormControlError>
        <FormControlErrorText className="font-regular">
          {isFormFieldInValid(fieldName, errors)}
        </FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
};

export default PrimaryTextFormField;
