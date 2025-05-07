import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import BottomSheet from "./BottomSheet";
import Entypo from "@expo/vector-icons/Entypo";
import PrimaryText from "@/components/PrimaryText";
type ImagePickerComponentProps = {
  onImagePicked: (uri: string, fileSizeBytes: number) => void;
  setIsModalVisible: any;
  bottomSheetRef: any;
};

enum PickerPermissions {
  CAMERA,
  MEDIA,
}

const ImagePickerComponent: React.FC<ImagePickerComponentProps> = ({
  onImagePicked,
  setIsModalVisible,
  bottomSheetRef,
}) => {
  const [mediaLibraryPermissionStatus, requestMediaLibraryPermission] =
    ImagePicker.useMediaLibraryPermissions();
  const [cameraPermissionStatus, requestCameraPermission] =
    ImagePicker.useCameraPermissions();

  const requestPermissions = async (pickerPermissions: PickerPermissions) => {
    if (Platform.OS !== "web") {
      switch (pickerPermissions) {
        case PickerPermissions.CAMERA:
          console.log("cameraPermissionStatus", cameraPermissionStatus);
          // accessPrivileges - 'all' | 'limited' | 'none'
          if (cameraPermissionStatus?.granted) {
            return true;
          } else if (
            cameraPermissionStatus?.status ===
            ImagePicker.PermissionStatus.DENIED
          ) {
            if (cameraPermissionStatus?.canAskAgain) {
              const permissionResponse = await requestCameraPermission();
              if (permissionResponse.granted) {
                return true;
              }
            }
            alert(
              "Sorry, we need a camera permission to access to your camera to capture your organization’s image and photos of damaged assets for reporting purposes.",
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
              "Sorry, we need a media library permission to access to your photos to upload your organization’s image and damaged asset images for reporting purposes.",
            );
            return false;
          }
        case PickerPermissions.MEDIA:
          // accessPrivileges - 'all' | 'limited' | 'none'
          if (mediaLibraryPermissionStatus?.granted) {
            return true;
          } else if (
            mediaLibraryPermissionStatus?.accessPrivileges === "none" ||
            mediaLibraryPermissionStatus?.status ===
              ImagePicker.PermissionStatus.DENIED
          ) {
            if (mediaLibraryPermissionStatus?.canAskAgain) {
              const permissionResponse = await requestMediaLibraryPermission();
              if (permissionResponse.granted) {
                return true;
              }
            }
            alert(
              "Sorry, we need a media library permissions to access to your photos to upload your organization’s image and damaged asset images for reporting purposes.",
            );
            return false;
          } else if (
            mediaLibraryPermissionStatus?.status ===
            ImagePicker.PermissionStatus.UNDETERMINED
          ) {
            const permissionResponse = await requestMediaLibraryPermission();
            if (permissionResponse.granted) {
              return true;
            }
            alert(
              "Sorry, we need a media library permissions to access to your photos to upload your organization’s image and damaged asset images for reporting purposes.",
            );
            return false;
          }
      }
    }
    alert(
      "Sorry, we need a camera and media library permissions to access to your photos or to capture the photo to upload your organization’s image and damaged asset images for reporting purposes.",
    );
    return false;
  };

  const pickImage = async () => {
    const permissionsGranted = await requestPermissions(
      PickerPermissions.MEDIA,
    );
    if (!permissionsGranted) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const fileSize = (asset.base64?.length ?? 0) * (3 / 4) - 2;
      const uri = asset.uri;
      onImagePicked(uri, fileSize);
      closeModal();
    }
  };

  const takePhoto = async () => {
    const permissionsGranted = await requestPermissions(
      PickerPermissions.CAMERA,
    );
    if (!permissionsGranted) return;

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
     aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const fileSize = (asset.base64?.length ?? 0) * (3 / 4) - 2;
      const uri = asset.uri;
      onImagePicked(uri, fileSize);
      closeModal();
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    bottomSheetRef.current?.hide();
  };

  return (
    // <Modalize
    //   ref={modalizeRef}
    //   onClose={closeModal}
    //   snapPoint={180}
    //   withOverlay={true}
    //   handlePosition="inside"
    // >
    //   <View style={styles.modalContent}>
    //     <TouchableOpacity style={styles.option} onPress={pickImage}>
    //       <PrimaryText style={styles.optionText}>Pick an Image from Gallery</PrimaryText>
    //     </TouchableOpacity>
    //     <TouchableOpacity style={styles.option} onPress={takePhoto}>
    //       <PrimaryText style={styles.optionText}>Take a Photo</PrimaryText>
    //     </TouchableOpacity>
    //   </View>
    // </Modalize>
    <BottomSheet initialHeight={200} ref={bottomSheetRef}>
      <View style={styles.modalContent}>
        <TouchableOpacity style={styles.option} onPress={pickImage}>
          <View className="flex-row w-full justify-center items-center">
            <Entypo name="folder-images" size={20} color="black" />
            <PrimaryText className="ms-2 text-lg font-regular">Pick an Image from Gallery</PrimaryText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={takePhoto}>
          <View className="flex-row w-full justify-center items-center">
            <Entypo name="camera" size={20} color="black" />
            <PrimaryText className="ms-2 text-lg font-regular">Take a Photo</PrimaryText>
          </View>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    padding: 20,
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  optionText: {
    fontSize: 18,
    textAlign: "center",
  },
});

export default ImagePickerComponent;
