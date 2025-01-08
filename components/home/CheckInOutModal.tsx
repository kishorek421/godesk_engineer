import { View, Text, Pressable, Image, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import BottomSheet from "../BottomSheet";
import moment from "moment";
import * as Location from "expo-location";
import {
  bytesToMB,
  getFileName,
  isFormFieldInValid,
  setErrorValue,
} from "@/utils/helper";
import { ErrorModel } from "@/models/common";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import { Button, ButtonText } from "../ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "../ui/form-control";
import { TICKET_UPLOADS, CHECK_IN_OUT } from "@/constants/api_endpoints";
import Toast from "react-native-toast-message";
import { CreateCheckInOutModel } from "@/models/users";
import AntDesign from "@expo/vector-icons/AntDesign";
import apiClient from "@/clients/apiClient";
import { useTranslation } from 'react-i18next';
interface CheckInOutProps {
  setIsModalVisible: any;
  bottomSheetRef: any;
  status?: string;
  checkedInId?: string;
  onClose: () => void;
}

const CheckInOutModal = ({
  status,
  bottomSheetRef,
  checkedInId,
  setIsModalVisible,
  onClose,
}: CheckInOutProps) => {
  const [currentTime, setCurrentTime] = useState(
    moment().format("DD/MM/YYYY hh:mm:ss A"),
  );
  const [pincode, setPincode] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<ErrorModel[]>([]);
  const { t, i18n } = useTranslation();
  const [selfie, setSelfie] = useState("");

  const [errorMsg, setErrorMsg] = useState("");

  const [cameraPermissionStatus, requestCameraPermission] =
    ImagePicker.useCameraPermissions();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format("DD/MM/YYYY hh:mm:ss A"));
    }, 1000);

    const fetchPincode = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      setPincode(address.postalCode ?? "");
    };

    fetchPincode();

    return () => clearInterval(timer); // Cleanup timer on component unmount
  }, []);

  const requestCameraPermissions = async () => {
    if (cameraPermissionStatus?.granted) {
      return true;
    } else if (
      cameraPermissionStatus?.status === ImagePicker.PermissionStatus.DENIED
    ) {
      if (cameraPermissionStatus?.canAskAgain) {
        const permissionResponse = await requestCameraPermission();
        if (permissionResponse.granted) {
          return true;
        }
      }
      alert(
        "Sorry, we need a camera permission to access to your camera to capture selfie image for check in",
      );
      return false;
    } else if (
      cameraPermissionStatus?.status ===
      ImagePicker.PermissionStatus.UNDETERMINED
    ) {
      const permissionResponse = await requestCameraPermission();
      if (permissionResponse.granted) {
        return true;
      }
      alert(
        "Sorry, we need a camera permission to access to your camera to capture selfie image for check in",
      );
      return false;
    }
    alert(
      "Sorry, we need a camera permission to access to your camera to capture selfie image for check in",
    );
    return false;
  };

  const takePhoto = async () => {
    // setSelfie(
    //   "file:///Users/fci-1988/Library/Developer/CoreSimulator/Devices/2552B9A6-1492-49E4-88FE-BF21786D7E11/data/Containers/Data/Application/AE599E3E-E808-49A2-8A4A-FDE16DD81297/Library/Caches/ImagePicker/34E026E3-9107-4E08-BD66-54829AB346E1.png",
    // );

    const permissionsGranted = await requestCameraPermissions();
    if (!permissionsGranted) return;

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
      cameraType: ImagePicker.CameraType.front,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const fileSize = (asset.base64?.length ?? 0) * (3 / 4) - 2;
      const fileSizeMB = bytesToMB(fileSize);
      if (fileSizeMB < 16) {
        setSelfie(asset.uri);
      } else {
        Toast.show({
          type: "error",
          text1: "Image more than 15 mb not accepeted",
        });
      }
    }
  };

  const chechInOut = async () => {
    if (selfie.length === 0) {
      setErrorValue("selfie", "", "Selfie is required", setErrors);
      return;
    } else {
      setErrorValue("selfie", "", "", setErrors);
    }

    setIsLoading(true);

    const formData = new FormData();

    formData.append("assetImages", {
      uri: selfie,
      type: "image/jpeg",
      name: getFileName(selfie, true),
    } as any);

    setErrors([]);

    apiClient
      .post(TICKET_UPLOADS, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        const uploadedSelfie = response.data.data;
        console.log("uploadedSelfie", uploadedSelfie);

        if (uploadedSelfie && uploadedSelfie.length > 0) {
          const checkInOutModel: CreateCheckInOutModel = {
            date: moment().format("YYYY-MM-DD"),
            pincode: pincode?.length === 5 ? `560078` : pincode,
            checkInImage:
              status === undefined ? uploadedSelfie[0] : undefined,
            checkOutImage:
              status === "Checked In" ? uploadedSelfie[0] : undefined,
          };
          apiClient
            .put(CHECK_IN_OUT + (checkedInId ? `?attendanceId=${checkedInId}` : ''), checkInOutModel)
            .then((response) => {
              console.log(response.data.data);
              // setIsModalVisible(false);
              // bottomSheetRef
              setIsLoading(false);
              Toast.show({
                type: "success",
                text1:
                  status === "Checked In"
                    ? "Checked out successfully"
                    : "Checked in successfully",
              });
              setSelfie("");
              setErrors([]);
              setErrorMsg("");
              onClose();
             
            })
            .catch((e) => {
              console.error(e.response?.data);
              let errors = e.response?.data?.errors;
              if (errors) {
                console.error("errors -> ", errors);
                setErrors(errors);
              }
              setErrorMsg("Failed to check in");
              setIsLoading(false);
            });
        } else {
          setIsLoading(false);
          Toast.show({
            type: "error",
            text1: "Failed to upload your selfie",
          });
          setErrorMsg("Failed to check in");
        }
      })
      .catch((e) => {
        let errors = e.response?.data;
        console.log("errors ---->", errors);
        setIsLoading(false);
        setErrorMsg("Failed to check in");
      });
  };

  return (
    <BottomSheet initialHeight={500} ref={bottomSheetRef}>
      <View className="gap-4 p-4">
        {/* <Text>{JSON.stringify(checkedInId)}</Text> */}
        <Text className="font-bold text-xl">
          {status === "Checked In" ? t('checkOut') : t("checkIn")}
        </Text>
        <View className="gap-5">
          <View className="">
            <Text className="font-semibold text-lg">{t('startAt')}</Text>
            <Text className="mt-1 text-gray-700 text-md">{currentTime}</Text>
          </View>
          <View className="">
            <Text className="font-semibold text-lg">{t('pincode')}</Text>
            <Text className="mt-1 text-gray-700 text-md">{pincode ?? "-"}</Text>
          </View>
          <View className="flex-row justify-between">
            <FormControl
              key="selfie"
              isInvalid={isFormFieldInValid("selfie", errors).length > 0}
            >
              <View className="">
                <Text className="font-semibold text-lg">{t('selfie')} <Text className="text-red-400 mt-1">*</Text></Text>
                {selfie.length === 0 ? (
                  <Pressable
                    onPress={() => {
                      takePhoto();
                    }}
                    className="mt-1"
                  >
                    <View
                      className={`${isFormFieldInValid("selfie", errors).length === 0 ? "border-primary-950" : "border-red-700"} border-[1px] 
                      border-dashed h-28 w-28
                rounded-md mt-1 flex justify-center items-center `}
                    >
                      <View className="flex justify-center items-center mt-3">
                        <View
                          className={`${isFormFieldInValid("selfie", errors).length === 0 ? "bg-primary-300" : "bg-red-300"} rounded-md p-2 bg-primary-300 w-auto`}
                        >
                          <MaterialCommunityIcons
                            name="camera-plus"
                            color={`${isFormFieldInValid("selfie", errors).length === 0 ? "#009c68" : "#b91c1c"}`}
                            size={18}
                          />
                        </View>
                      </View>
                    </View>
                  </Pressable>
                ) : (
                  <View>
                    <Image
                      source={{ uri: selfie }}
                      className="absolute mt-1 rounded-xl w-28 h-28"
                    />
                    <View className="flex items-end gap-4 rounded-xl w-28 h-28">
                      <Pressable
                        className="mt-2 me-2"
                        onPress={() => {
                          // setImagePath("");
                          setSelfie("");
                        }}
                      >
                        <AntDesign name="closecircle" size={16} color="white" />
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
              <FormControlError>
                <FormControlErrorText>
                  {isFormFieldInValid("selfie", errors)}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
            {/* <Image
              source={require("../../assets/images/check_in_out.png")}
              className="w-[150px] h-[150px]"
            /> */}
          </View>
          {errorMsg && <Text className="mt-4 text-red-500">* {errorMsg}</Text>}
          <Button
            className="bg-primary-950 mt-4 rounded-lg h-12"
            onPress={() => {
              if (isLoading) return;
              chechInOut();
            }}
          >
            <ButtonText>
              {status === "Checked In" ? "Check Out" : "Check In"}
            </ButtonText>
            {isLoading && <ActivityIndicator color="white" className="ms-1" />}
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
};

export default CheckInOutModal;
