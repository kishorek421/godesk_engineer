import React, { useRef, useState, useEffect } from "react";
import { View, Image, Linking, BackHandler, ToastAndroid } from "react-native";
import LottieView from "lottie-react-native";
import { router, useSegments } from "expo-router";
import { ErrorModel } from "@/models/common";
import PrimaryTextFormField from "@/components/PrimaryTextFormField";
import api from "@/clients/apiClient";
import BasePage from "@/components/base/base_page";
import { useTranslation } from "react-i18next";
import PrimaryText from "@/components/PrimaryText";
import PrimaryLink from "@/components/PrimaryLink";
import PrimaryButton from "@/components/PrimaryButton";
import { getItem, setItem } from "@/utils/secure_store";
import {
  AUTH_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  TEMP_FCM_TOKEN,
} from "@/constants/storage_keys";
import { useToast } from "@/context/ToastContext";
import { getFCMToken } from "@/services/fcm";
import { useFirebaseMessaging } from "@/hooks/useFirebaseMessaging";
const LoginScreen = () => {
  const { showToast } = useToast();
  const animationRef = useRef<LottieView>(null);
  const [mobile, setMobileNumber] = useState<string>();
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorModel[]>([]);
  const [canValidateField, setCanValidateField] = useState(false);
  const { t } = useTranslation();
  const [fieldValidationStatus, setFieldValidationStatus] = useState<any>({});
  const [exitApp, setExitApp] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const segments = useSegments();
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const { messagingRef } = useFirebaseMessaging();
  const [debouncedMobile, setDebouncedMobile] = useState(mobile);
  const setFieldValidationStatusFunc = (
    fieldName: string,
    isValid: boolean
  ) => {
    if (fieldValidationStatus[fieldName]) {
      fieldValidationStatus[fieldName](isValid);
    }
  };

  const handleDoubleClick = () => {
    if (exitApp) {
      BackHandler.exitApp();
    } else {
      setExitApp(true);
      ToastAndroid.show("Press again to exit", ToastAndroid.SHORT);
      timeoutRef.current = setTimeout(() => {
        setExitApp(false);
      }, 2000);
    }
  };

  useEffect(() => {
    const backAction = () => {
      const currentPath = segments.join("/");

      // Adjust this to match your actual login route
      const isLoginScreen =
        currentPath === "login" ||
        currentPath === "(auth)/login" ||
        currentPath === "" ||
        currentPath === "home";

      if (isLoginScreen) {
        handleDoubleClick();
        return true;
      } else if (router.canGoBack()) {
        router.back();
        return true;
      } else {
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      backHandler.remove();
    };
  }, [exitApp, segments]);

  const handleSendOTP = async () => {
    if (!canValidateField) {
      let newErrors: ErrorModel[] = [];
      if (!password) {
        newErrors.push({
          param: "password",
          message: "Please enter a pin",
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
          // Resolve each validation status based on field key
          setFieldValidationStatus((prev: any) => ({
            ...prev,
            [key]: resolve,
          }));
        })
    );

    setCanValidateField(true);

    console.log("login validataion promise before");

    // Wait for all validations to complete
    await Promise.all(validationPromises);

    console.log("login validataion promise after");

    const allValid = errors
      .map((error) => error.message?.length === 0)
      .every((status) => status === true);

    console.log("error", errors);

    if (allValid) {
      setErrors([]);

      setIsLoading(true);
      let fcmToken = "";

      try {
        fcmToken = (await getFCMToken(messagingRef.current)) ?? "";
        console.log("fcmToken", fcmToken);
        await setItem(TEMP_FCM_TOKEN, fcmToken);
      } catch (e) {
        console.error("Token Error ->", e);
      }

      const oldFCMToken = await getItem(TEMP_FCM_TOKEN);
      console.log("oldFCMToken", oldFCMToken);
      const reqBody = {
        key: "FIELD_ENGINEER",
        mobile,
        password,
        fcmToken,
      };

      console.log("Request Body:", reqBody);

      await api
        .post("/login/user_login", reqBody)
        .then(async (response) => {
          if (response.data?.success) {
            const loginData = response.data?.data;
            if (loginData && loginData.token) {
              console.log("loginData ->", loginData.token);
              await setItem(AUTH_TOKEN_KEY, loginData.token);
              await setItem(REFRESH_TOKEN_KEY, loginData.refreshToken);
              console.log("AUTH_TOKEN_KEY ->", await getItem(AUTH_TOKEN_KEY));
              router.dismissAll();
              router.replace("/home");
            }
          }
        })
        .catch(async (e) => {
          // console.error(e);
          console.error(e.response);
          if (e?.response?.data?.errors) {
            const responseErrors = e.response.data.errors;

            setErrors(responseErrors.filter((err: any) => err.param !== null));

            const genericMessages = responseErrors
              .filter((err: any) => err.param === null)
              .map((err: any) => err.message)
              .join("\n");

            if (genericMessages) {
              showToast({
                position: "top",
                type: "error",
                message: genericMessages,
              });
            }
          } else {
            showToast({
              position: "top",
              type: "error",
              message:
                e.response?.data?.message ||
                "An unexpected error occurred. Please try again.",
            });
          }
        })

        .finally(() => {
          setIsLoading(false);
        });
    }
  };
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMobile(mobile);
    }, 100);

    return () => {
      clearTimeout(handler);
    };
  }, [mobile]);

const checkPin = async (mobile: string) => {
  const trimmedMobile = mobile.trim(); // Remove spaces

  if (!trimmedMobile || !/^\d{10}$/.test(trimmedMobile)) {
    setErrors([
      {
        param: "mobile",
        message: "Please enter a valid 10-digit mobile number.",
      },
    ]);
    return;
  }

  try {
    const res = await api.get(
      `/users/checkPin?mobile=${trimmedMobile}&key=INTERNAL`
    );
    const resData = res.data?.data;

    if (resData && resData.length > 0) {
      // Only get users with role FIELD_ENGINEER
      const b2CUsers = resData.filter(
        (user: any) => user.role === "FIELD_ENGINEER"
      );

      if (b2CUsers.length > 0) {
        const pinResetUser = b2CUsers.find(
          (user: any) => user.pinReset === true
        );

        if (pinResetUser) {
          setHasPin(true);
        } else {
          router.push({
            pathname: "/forgot_password",
            params: {
              mobileNumber: trimmedMobile,
              key: "INTERNAL",
              from: "setPin",
            },
          });
        }
        return;
      }
    }
    setErrors([
      {
        param: "mobile",
        message: "You are not registered. Please register to continue.",
      },
    ]);
  } catch (error) {
    setErrors([
      {
        param: "mobile",
        message: "Something went wrong. Please try again later.",
      },
    ]);
  }
};


  useEffect(() => {
    if (debouncedMobile && debouncedMobile.length === 10) {
      checkPin(debouncedMobile);
    } else {
      setHasPin(false);
      // setErrors([]);
    }
  }, [debouncedMobile]);

  return (
    <BasePage>
      <View className="flex justify-between h-full bg-white">
        <View className="px-4">
          <View>
            <View className="flex-row items-end ">
              <Image
                source={require("../assets/images/godezk_engineer_banner_300x150.png")}
                style={{
                  width: 80,
                  height: 50,
                }}
              />
            </View>
          </View>

          <View className="mt-4">
            <PrimaryText className="text-2xl font-bold-1 text-primary-950">
              goodToSeeYouAgain
            </PrimaryText>
            <PrimaryText className="color-gray-400 text-sm font-regular">
              logInToGetExpertTechSupportInstantly
            </PrimaryText>
          </View>

          <View className="mt-6">
            {/* <PrimaryText>{JSON.stringify(errors)}</PrimaryText> */}
            <PrimaryTextFormField
              prefix="+91"
              prefixStyle="text-black font-bold mx-2"
              fieldName="mobile"
              label="mobileNumber"
              placeholder="enterMobileNumber"
              errors={errors}
              setErrors={setErrors}
              min={10}
              max={10}
              keyboardType="phone-pad"
              filterExp={/^[0-9]*$/}
              canValidateField={canValidateField}
              setCanValidateField={setCanValidateField}
              setFieldValidationStatus={setFieldValidationStatus}
              validateFieldFunc={setFieldValidationStatusFunc}
              customValidations={(value) => {
                // mobile no should start with 6-9
                const customRE = /^[6-9]/;
                if (!customRE.test(value)) {
                  return "mobileNoShouldStartWith69";
                }
                return undefined;
              }}
              onChangeText={(text: string) => {
                setMobileNumber(text);
              }}
            />
          </View>
          {hasPin && (
            <View className="mt-6">
              <PrimaryTextFormField
                inputType="password"
                fieldName="password"
                label="PIN"
                placeholder="Enter 6-Digit PIN"
                errors={errors}
                setErrors={setErrors}
                min={6}
                max={6}
                keyboardType="phone-pad"
                filterExp={/^[0-9]*$/}
                canValidateField={canValidateField}
                setCanValidateField={setCanValidateField}
                setFieldValidationStatus={setFieldValidationStatus}
                validateFieldFunc={setFieldValidationStatusFunc}
                onChangeText={(text: string) => {
                  setPassword(text);
                }}
              />
            </View>
          )}

          <View className="mt-2 mx-1">
            <PrimaryLink
              href="/forgot_password"
              className="font-semibold  color-secondary-950"
            >
              Forgot PIN?
            </PrimaryLink>
          </View>
          <View className="mt-2">
            <PrimaryButton
              isLoading={isLoading}
              onPress={hasPin ? handleSendOTP : checkPin}
              btnText={hasPin ? "Login" : "Submit"}
            />
            {/* <PrimaryText
              className="mt-4  text-center text-sm font-regular"
              translate="none"
            >
              {t("dontHaveAnAccount") + " "}
              <PrimaryLink
                href="/registration/null"
                className="font-bold-1 underline color-secondary-950"
              >
                registerNow
              </PrimaryLink>
            </PrimaryText> */}
          </View>
        </View>

        {/* Footer Animation */}
        <View>
          <LottieView
            ref={animationRef}
            source={require("../assets/lottie/login.json")}
            autoPlay
            loop
            style={{
              height: 200,
            }}
          />
          {/* <PrimaryText
            className="mt-8 text-sm text-center px-8 font-regular"
            translate="none"
          >
            {t("byLoggingInYouAgreeToOur") + " "}
            <PrimaryText
              onPress={() => {
                Linking.openURL("https://godezk.com/Terms_And_conditions.html");
              }}
              className="font-bold-1 text-primary-950"
            >
              termsConditions
            </PrimaryText>{" "}
            {t("and") + " "}
            <PrimaryText
              onPress={() => {
                Linking.openURL("https://godezk.com/Privacy_Policy.html");
              }}
              className="font-bold-1 text-primary-950"
            >
              privacyPolicy
            </PrimaryText>
          </PrimaryText> */}
        </View>
      </View>
    </BasePage>
  );
};
export default LoginScreen;
