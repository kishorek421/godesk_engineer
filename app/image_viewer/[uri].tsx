import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

const ImageViewer = () => {
  const { uri } = useLocalSearchParams();

  console.log(uri);

  return (
    <View>
      <View className="flex w-full justify-end items-end pe-2">
        <Pressable
          className="mt-3"
          onPress={() => {
            router.back();
          }}
        >
          <AntDesign name="closecircle" size={20} color="#9ca3af" />
        </Pressable>
      </View>
      <View className="h-full flex justify-center items-center p-4">
        <Image className=" w-full h-full p-6" source={{ uri: uri.toString() }} />
      </View>
    </View>
  );
};

export default ImageViewer;
