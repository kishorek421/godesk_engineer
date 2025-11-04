import { View, Text, Platform } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { router } from "expo-router";
import PrimaryTextFormField from "@/components/PrimaryTextFormField";
import SubmitButton from "@/components/SubmitButton";
import api from "@/clients/apiClient";
import { CHANGE_PASSWORD } from "@/constants/api_endpoints";
import { ErrorModel } from "@/models/common";
import Toast from "react-native-toast-message";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/storage_keys";
import { setItem } from "@/utils/secure_store";
import PrimaryText from "@/components/PrimaryText";
import BasePage from "@/components/base/base_page";
import { useFocusEffect } from "@react-navigation/native";

const ChangePassword = () => {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorModel[]>([]);
  const [canValidateField, setCanValidateField] = useState(false);

  const [fieldValidationStatus, setFieldValidationStatus] = useState<any>({});

  const setFieldValidationStatusFunc = (fieldName: string, isValid: boolean) => {
    if (fieldValidationStatus[fieldName]) {
      fieldValidationStatus[fieldName](isValid);
    }
  };

  // RESET FORM FIELDS
  const resetForm = () => {
    setPassword("");
    setConfirmPassword("");
    setCurrentPassword("");
    setErrors([]);
    setCanValidateField(false);
  };

  // ✅ Clear PINs when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      resetForm();
    }, [])
  );

  const changePassword = async () => {
    if (!canValidateField) {
      let newErrors: ErrorModel[] = [];
      if (!confirmPassword) {
        newErrors.push({
          param: "confirmPassword",
          message: "Please enter confirm PIN",
        });
      }

      if (newErrors.length === 0) {
        setErrors([]);
      }

      setErrors(newErrors);
      if (newErrors.length > 0) {
        setCanValidateField(true);
        return;
      }
    }

    const validationPromises = Object.keys(fieldValidationStatus).map(
      (key) =>
        new Promise((resolve) => {
          setFieldValidationStatus((prev: any) => ({
            ...prev,
            [key]: resolve,
          }));
        })
    );

    setCanValidateField(true);
    await Promise.all(validationPromises);

    const allValid = errors
      .map((error) => error.message?.length === 0)
      .every((status) => status === true);

    if (allValid) {
      setIsLoading(true);
      setErrors([]);

      const data = {
        newPassword: password,
        confirmPassword: confirmPassword,
        currentPassword: currentPassword,
      };

      api
        .put(CHANGE_PASSWORD, data)
        .then(async (response) => {
          let loginData = response.data.data;

          if (loginData) {
            await setItem(AUTH_TOKEN_KEY, loginData.token);
            await setItem(REFRESH_TOKEN_KEY, loginData.refreshToken);
          }

          Toast.show({
            type: "success",
            text1: "PIN changed successfully",
            visibilityTime: 5000,
          });

          setIsLoading(false);
          resetForm();
          router.back();
        })
        .catch(async (e) => {
          let errors = e.response?.data?.errors;
          if (errors) {
            setErrors(errors);
          }
          setIsLoading(false);
        });
    }
  };

  return (
    <BasePage>
      <View className="bg-white h-full">
        <View className={`${Platform.OS === "ios" ? "px-4" : "px-6"} my-4`}>
          <View>
            <PrimaryTextFormField
              inputType="password"
              fieldName="currentPassword"
              label="Current PIN"
              defaultValue={currentPassword}
              placeholder="••••••"
              errors={errors}
              setErrors={setErrors}
              min={6}
              max={6}
              filterExp={/^[0-9]*$/}
              isRequired={true}
              keyboardType="visible-password"
              canValidateField={canValidateField}
              setCanValidateField={setCanValidateField}
              setFieldValidationStatus={setFieldValidationStatus}
              validateFieldFunc={setFieldValidationStatusFunc}
              onChangeText={(value) => setCurrentPassword(value)}
            />

            <PrimaryTextFormField
              inputType="password"
              fieldName="newPassword"
              label="New PIN"
              defaultValue={password}
              placeholder="••••••"
              errors={errors}
              setErrors={setErrors}
              min={6}
              max={6}
              filterExp={/^[0-9]*$/}
              isRequired={true}
              keyboardType="visible-password"
              canValidateField={canValidateField}
              setCanValidateField={setCanValidateField}
              setFieldValidationStatus={setFieldValidationStatus}
              validateFieldFunc={setFieldValidationStatusFunc}
              onChangeText={(value) => setPassword(value)}
              className="mt-4"
            />

            <PrimaryTextFormField
              className="mt-4"
              inputType="password"
              fieldName="confirmPassword"
              label="Confirm PIN"
              defaultValue={confirmPassword}
              placeholder="••••••"
              errors={errors}
              setErrors={setErrors}
              min={6}
              max={6}
              filterExp={/^[0-9]*$/}
              isRequired={true}
              keyboardType="visible-password"
              customValidations={(value) => {
                if (password !== value) {
                  return "New PIN and Confirm PIN have to match";
                }
                return undefined;
              }}
              canValidateField={canValidateField}
              setCanValidateField={setCanValidateField}
              setFieldValidationStatus={setFieldValidationStatus}
              validateFieldFunc={setFieldValidationStatusFunc}
              onChangeText={(value) => setConfirmPassword(value)}
            />
          </View>

          <SubmitButton
            className="mt-6"
            btnText="Change PIN"
            isLoading={isLoading}
            onPress={changePassword}
          />
        </View>
      </View>
    </BasePage>
  );
};

export default ChangePassword;
