import {
  View,
  Pressable,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ErrorModel } from "@/models/common";
import PrimaryPrimaryTextFormField from "@/components/PrimaryTextFormField";
import SubmitButton from "@/components/SubmitButton";
import api from "@/clients/apiClient";
import LottieView from "lottie-react-native";
import { RESET_PASSWORD } from "@/constants/api_endpoints";
import { router, useLocalSearchParams } from "expo-router";

import { primaryColor } from "@/constants/colors";
import PrimaryText from "@/components/PrimaryText";
import PrimaryTextFormField from "@/components/PrimaryTextFormField";
import PrimaryButton from "@/components/PrimaryButton";
import { useTranslation } from "react-i18next";
import BasePage from "@/components/base/base_page";
import PrimaryLink from "@/components/PrimaryLink";
import { useToast } from "@/context/ToastContext";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { isFormFieldInValid } from "@/utils/helper";
import { Button, ButtonText } from "@/components/ui/button";
enum PasswordChangeStatus {
  none,
  otpSent,
  otpVerified,
  restPin,
}
const ForgotPassword = () => {
  const [timer, setTimer] = useState(120);
  const [isDisabled, setIsDisabled] = useState(true);

  const [userId, setUserId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [mobile, setMobileNumber] = useState<string>("");
  const [PIN, setPIN] = useState<string>("");
  const [errors, setErrors] = useState<ErrorModel[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputs = useRef<Array<TextInput | null>>([]);
  const { showToast } = useToast();
  const { mobileNumber, key, from } = useLocalSearchParams<{
    mobileNumber?: string;
    key?: string;
    from?: string;
  }>();

  const [canValidateField, setCanValidateField] = useState(false);
  const { t } = useTranslation();
  const [fieldValidationStatus, setFieldValidationStatus] = useState<any>({});

  const [passwordChangeStatus, setPasswordChangeStatus] =
    useState<PasswordChangeStatus>(PasswordChangeStatus.none);

  const setFieldValidationStatusFunc = (
    fieldName: string,
    isValid: boolean
  ) => {
    if (fieldValidationStatus[fieldName]) {
      fieldValidationStatus[fieldName](isValid);
    }
  };

  const getButtonText = (): string => {
    switch (passwordChangeStatus) {
      case PasswordChangeStatus.none:
        return "Send OTP";
      case PasswordChangeStatus.otpSent:
        return "Verify";

      case PasswordChangeStatus.otpVerified:
        return from === "setPin" ? "Set PIN" : "Reset PIN";
      case PasswordChangeStatus.restPin:
        return "";
    }
  };
  useEffect(() => {
    if (mobileNumber) {
      setMobileNumber(mobileNumber);
    }
  }, [mobileNumber]);

  useEffect(() => {
    if (mobile.length === 10) {
      sendOTP();
    }
  }, [mobile]);
  const sendOTP = async () => {
    if (!mobile) {
      setErrors([
        {
          param: "mobile",
          message: "Please enter a valid 10-digit mobile number.",
        },
      ]);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    const reqBody = { mobile, key: "FIELD_ENGINEER" };

    //console.log("reqBody", reqBody);

    await api
      .get(
        `/userProfile/forgotPassword/sendForgotPasswordOtp?mobile=${mobile}&key=FIELD_ENGINEER`
      )

      .then(async (response) => {
        let loginData = response.data.data;
        //console.log("loginData ", loginData);
        // setEmail("");
        if (loginData.userId) {
          setUserId(loginData?.userId);
          setModalVisible(true);
        } else {
          setErrors([
            {
              param: "mobile",
              message:
                response.data?.message ?? "Failed to send OTP. Try again.",
            },
          ]);
        }
      })
      .catch((error) => {
        console.error("Error sending OTP:", error.response?.data || error);
        setErrors([
          {
            param: "mobile",
            message: "No user found with this mobile number",
          },
        ]);
      })
      .finally(() => {
        //console.log("Request completed");
        setIsLoading(false);
      });
  };
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (text: string, index: number) => {
    const digits = text.replace(/\D/g, "").split("");
    const newOtp = [...otp];

    if (digits.length === 6) {
      // Handle full OTP paste
      setOtp(digits.slice(0, 6));
      inputs.current[5]?.focus();
      return;
    }

    newOtp[index] = digits[0] || "";
    setOtp(newOtp);

    if (digits[0] && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (otp[index] === "") {
        const prevIndex = index > 0 ? index - 1 : 0;
        const newOtp = [...otp];
        newOtp[prevIndex] = "";
        setOtp(newOtp);
        inputs.current[prevIndex]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  useEffect(() => {
    const finalOtp = otp.join("").trim();
    if (finalOtp.length === 6 && /^[0-9]{6}$/.test(finalOtp)) {
      setErrors([]);
    }
  }, [otp]);

  const verifyOTP = async (otpValue: string) => {
    setErrors([]);
    setCanValidateField(true);

    const finalOtp = otp.join("").trim();
    if (!finalOtp || !/^[0-9]{6}$/.test(finalOtp)) {
      setErrors([
        {
          param: "OTP",
          message: "Please enter a valid 6-digit OTP.",
        },
      ]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get(
        `/userProfile/forgotPassword/checkOTP?userId=${userId}&OTP=${finalOtp}`
      );

      if (response.data?.success) {
        setPasswordChangeStatus(PasswordChangeStatus.otpVerified);
        setModalVisible(false);
      }
    } catch (e: any) {
      const apiErrors = e?.response?.data?.errors || [
        {
          param: "OTP",
          message: "Invalid OTP. Please try again.",
        },
      ];
      console.error("API Errors:", apiErrors);
      setErrors(apiErrors);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setIsDisabled(false);
    }
  }, [timer]);

  const getTime = () => {
    try {
      if (typeof timer !== "number" || isNaN(timer)) return "00:00";
      const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
      const seconds = String(timer % 60).padStart(2, "0");
      return `${minutes}:${seconds}`;
    } catch (e) {
      return "00:00";
    }
  };

  const handleSendOTP = async () => {
    setIsLoading(true);
    setErrors([]);

    await api
      .post("/users/send", { mobile, key: "FIELD_ENGINEER" })
      .then((response) => {
        //console.log("Response:", response.data.data);

        if (response.data?.success) {
          // Navigate to OTP verification page
          // Toast.show({
          //   type: "success",
          //   text1: translatedStrings["toast5"],
          // });

          setTimer(120); // Reset the timer to 2 minutes
          setIsDisabled(true);
        }
      })
      .catch((error) => {
        console.error("Error sending OTP:", error.response?.data || error);
        const iErrors = (error.response?.data?.errors ?? []).filter(
          (error: any) => "otp" === error.param
        );
        if (iErrors.length > 0) {
          setErrors(iErrors);
        } else {
          setErrors([
            {
              param: "otp",
              message: "Something went wrong, Please try again.",
            },
          ]);
        }
      })
      .finally(() => {
        //console.log("Request completed");
        setIsLoading(false); // Ensure loading state is reset
      });
  };

  const changePassword = async () => {
    if (!canValidateField) {
      let newErrors: ErrorModel[] = [];
      if (!confirmPassword) {
        newErrors.push({
          param: "confirmPassword",
          message: "Please enter confirm password",
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

    // Wait for all validations to complete
    await Promise.all(validationPromises);

    const allValid = errors
      .map((error) => error.message?.length === 0)
      .every((status) => status === true);

    if (allValid) {
      setIsLoading(true);

      setErrors([]);

      const formData = new FormData();

      formData.append("newPassword", password);
      formData.append("confirmPassword", confirmPassword);

      api
        .put(
          RESET_PASSWORD + `?userId=${userId}&key=FIELD_ENGINEER`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then(async (response) => {
          let loginData = response.data.data;
          //console.log("loginData ", loginData);
          showToast({
            position: "top",
            type: "success",
            message: "PIN set successfully",
          });
          setIsLoading(false);
          setPasswordChangeStatus(PasswordChangeStatus.restPin);
          // router.replace("/(auth)/login");
        })
        .catch(async (e) => {
          // console.error(e);
          console.error(e.response);
          let errors = e.response?.data?.errors;
          if (errors) {
            console.error("errors -> ", errors);
            setErrors(errors);
          }
          setIsLoading(false);
          showToast({
            type: "error",
            message: "toast24",
          });
        });
    }
  };

  return (
    <BasePage includeTop>
      <View className={`h-full ${modalVisible ? "bg-gray-100" : "bg-white"}`}>
        <View className="h-16 border-gray-300 shadow-gray-300 flex justify-center">
          <Pressable
            onPress={() => {
              if (passwordChangeStatus === PasswordChangeStatus.otpSent) {
                setPasswordChangeStatus(PasswordChangeStatus.none);
              } else if (
                passwordChangeStatus === PasswordChangeStatus.otpVerified
              ) {
                setPasswordChangeStatus(PasswordChangeStatus.otpSent);
              }
              // else if (passwordChangeStatus === PasswordChangeStatus.restPin) {
              //   setPasswordChangeStatus(PasswordChangeStatus.otpVerified);
              // }
              else {
                router.back();
              }
            }}
          >
            <View
              className={`flex-row px-4 items-center w-full ${modalVisible ? "bg-white" : "bg-white"}`}
            >
              <View className="flex-row items-end  ">
                <Image
                  source={require("../assets/images/godezk_engineer_banner_300x150.png")}
                  style={{
                    width: 120,
                    height: 70,
                  }}
                />
              </View>
            </View>
          </Pressable>
        </View>
        {/* <View className="w-full border-gray-200 border-[1px] p-0"/> */}
        <View className="mx-4 mt-4">
          {passwordChangeStatus === PasswordChangeStatus.none ? (
            <View>
              <PrimaryText className="text-2xl font-bold-1 ">
                <PrimaryText className="text-primary-950 font-semibold">
                  {from === "setPin" ? "Set PIN" : "Reset Your PIN"}{" "}
                </PrimaryText>
              </PrimaryText>
              <PrimaryText className="text-gray-500 text-md mt-1 pe-4 leading-6 font-regular">
                Enter your mobile number to receive an OTP and{" "}
                {from === "setPin" ? "set" : "reset"} your PIN.
              </PrimaryText>
            </View>
          ) : passwordChangeStatus === PasswordChangeStatus.otpVerified ? (
            <View>
              <PrimaryText className="text-2xl font-bold-1 ">
                <PrimaryText className="text-primary-950 font-semibold">
                  Set New PIN
                </PrimaryText>
              </PrimaryText>
              <PrimaryText className="text-gray-500 text-md mt-1 pe-4 leading-6 font-regular">
                Create a New PIN for Your Account
              </PrimaryText>
            </View>
          ) : (
            <View className="flex-1 bg-white  items-center px-4"></View>
          )}
          <View
            className={`mt-6 ${passwordChangeStatus === PasswordChangeStatus.none ? "block" : "hidden"}`}
          >
            {" "}
            {/* <FormControl
              isInvalid={isFormFieldInValid("mobileNo", errors).length > 0} />*/}
            <PrimaryTextFormField
              prefix="+91"
              prefixStyle="text-black font-bold mx-2"
              fieldName="mobile"
              label="mobileNumber"
              placeholder="enterMobileNumber"
              defaultValue={mobile}
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
            {/* {/* <FormControlError>
                <FormControlErrorText>
                  {isFormFieldInValid("mobile", errors)}
                </FormControlErrorText>
              </FormControlError>
            </FormControl> */}
          </View>

          <View
            className={`mt-6 ${passwordChangeStatus === PasswordChangeStatus.otpVerified ? "block" : "hidden"}`}
          >
            <PrimaryPrimaryTextFormField
              inputType="password"
              fieldName="newPassword"
              label="PIN"
              placeholder="•••••••••"
              errors={errors}
              setErrors={setErrors}
              min={6}
              max={6}
              isRequired={
                passwordChangeStatus === PasswordChangeStatus.otpVerified
                  ? true
                  : false
              }
              keyboardType="visible-password"
              filterExp={/^[0-9]*$/}
              canValidateField={canValidateField}
              setCanValidateField={setCanValidateField}
              setFieldValidationStatus={setFieldValidationStatus}
              validateFieldFunc={setFieldValidationStatusFunc}
              onChangeText={(value) => {
                setPassword(value);
              }}
            />
            {password.length === 6 && (
              <PrimaryPrimaryTextFormField
                className="mt-4"
                inputType="password"
                fieldName="confirmPassword"
                label="Confirm PIN"
                placeholder="•••••••••"
                errors={errors}
                setErrors={setErrors}
                min={6}
                max={6}
                isRequired={
                  passwordChangeStatus === PasswordChangeStatus.otpVerified
                    ? true
                    : false
                }
                keyboardType="visible-password"
                filterExp={/^[0-9]*$/}
                customValidations={(value) => {
                  if (password !== value) {
                    return "PIN and Confirm PIN have to match";
                  }
                  return undefined;
                }}
                canValidateField={canValidateField}
                setCanValidateField={setCanValidateField}
                setFieldValidationStatus={setFieldValidationStatus}
                validateFieldFunc={setFieldValidationStatusFunc}
                onChangeText={(value) => {
                  setConfirmPassword(value);
                }}
              />
            )}
          </View>
          {passwordChangeStatus !== PasswordChangeStatus.restPin && (
            <SubmitButton
              className="mt-6"
              btnText={getButtonText()}
              isLoading={isLoading}
              onPress={() => {
                switch (passwordChangeStatus) {
                  case PasswordChangeStatus.none:
                    sendOTP();
                    return;
                  case PasswordChangeStatus.otpSent:
                    verifyOTP(otp.join(""));
                    return;
                  case PasswordChangeStatus.otpVerified:
                    changePassword();
                    return;
                }
              }}
            />
          )}
        </View>
        <Modal
          className=""
          visible={modalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => {
            setModalVisible(false);
            setOtp(Array(6).fill(""));
            setTimer(120);
          }}
        >
          <View className="flex-1 justify-center items-center  bg-opacity-50">
            <View
              style={{
                width: 320,
                height: 400,
                backgroundColor: "white",
                borderRadius: 16,
                padding: 16,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View className="mb-6">
                <PrimaryText className="text-2xl font-semibold text-center ">
                  Enter OTP
                </PrimaryText>
                <PrimaryText className="text-gray-500 text-md mt-1 pe-4 leading-6 font-regular">
                  OTP sent to your mobile number.
                </PrimaryText>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setOtp(Array(6).fill(""));
                    setTimer(120);
                  }}
                >
                  <PrimaryText className="underline color-secondary-950 text-center">
                    Change mobile number
                  </PrimaryText>
                </TouchableOpacity>
              </View>
              <View className="">
                <FormControl
                  isInvalid={isFormFieldInValid("OTP", errors).length > 0}
                  className="items-center"
                >
                  <View className="flex-row justify-center space-x-3">
                    {otp.map((digit, index) => (
                      <View
                        key={index}
                        className="w-10 border-b-2 border-black  mx-2"
                      >
                        <TextInput
                          ref={(ref) => {
                            inputs.current[index] = ref;
                          }}
                          value={otp[index]}
                          onChangeText={(text) => handleChange(text, index)}
                          onKeyPress={(e) => handleKeyPress(e, index)}
                          keyboardType="number-pad"
                          maxLength={6}
                          testID={`otp-input-${index}`}
                          className="text-2xl text-black text-center w-full h-12"
                        />
                      </View>
                    ))}
                  </View>
                  <FormControlError className="mt-2">
                    <FormControlErrorText>
                      {isFormFieldInValid("OTP", errors)}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <PrimaryButton
                  isLoading={isLoading}
                  onPress={verifyOTP}
                  btnText="verifyOtp"
                />
              </View>
              <View>
                <View className="flex justify-center mt-8 items-center ">
                  <View className="flex items-center">
                    <PrimaryText className="text-gray-700 font-regular">
                      Didn't receive an OTP?
                    </PrimaryText>
                    <View className="flex">
                      <Pressable
                        onPress={() => {
                          handleSendOTP();
                        }}
                        disabled={isDisabled}
                      >
                        <PrimaryText
                          className={`${isDisabled ? "text-gray-500" : "text-primary-950 font-semibold"}`}
                          translate="none"
                        >
                          {isDisabled ? (
                            <>
                              {t("resendOtpInTime") + " "}
                              <PrimaryText
                                className="font-semibold underline text-primary-950"
                                translate="none"
                              >
                                {getTime()}
                              </PrimaryText>
                            </>
                          ) : (
                            t("Resend OTP")
                          )}
                        </PrimaryText>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Modal>
        {passwordChangeStatus === PasswordChangeStatus.restPin && (
          <View className="flex-1 bg-white  items-center px-4">
            <View className="mb-10">
              <Image
                className="mb-16 mt-10"
                source={require("../assets/images/resetPin.png")}
                width={30}
                height={20}
              />
            </View>
            <PrimaryText className="text-2xl font-bold  text-center mb-2">
              PIN Set Successfully
            </PrimaryText>
            <PrimaryText className="text-base text-gray-600 text-center mt-1">
              You can now log in with your new PIN.
            </PrimaryText>
            <Button
              className="bg-primary-950 mt-10  rounded-lg h-14 w-full items-center justify-center px-8"
              onPress={() => {
                router.push("/login");
              }}
            >
              <View className="flex-row items-center">
                <ButtonText className="ms-2 text-white font-semibold mx-2">
                  Go To Login
                </ButtonText>
                <MaterialIcons name="arrow-forward" size={20} color="white" />
              </View>
            </Button>
          </View>
        )}
      </View>
    </BasePage>
  );
};

export default ForgotPassword;
