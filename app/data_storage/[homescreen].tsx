import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image ,SafeAreaView} from "react-native";
import i18n from "../../config/i18n";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; 
import { getItem, setItem } from "@/utils/secure_store";

const LanguageSelectionScreen = () => {

  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const router = useRouter();
  useEffect(() => {
    const fetchLanguage = async () => {
      const storedLanguage = await getItem("language");
      if (storedLanguage) {
        setSelectedLanguage(storedLanguage);
        i18n.changeLanguage(storedLanguage);
      } else {
        i18n.changeLanguage("en");
      }
    };
    fetchLanguage();
  }, []);

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
  };

  const handleDone = async () => {
    i18n.changeLanguage(selectedLanguage);
    await setItem("language", selectedLanguage);
    router.push("/login");
  };
 
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4">
        <View>
          <View className="flex-row items-end">
            <Image
              source={require('../../assets/images/godezk_engineer_banner_300x150.png')}
              style={{ width: 100, height: 60 }}
            />
            {/* <Text className="font-bold-1 text-secondary-950 ms-.5 font-regular mb-1.5">
              desk <Text className="text-primary-950 font-regular">Engineer</Text>
            </Text> */}
          </View>
        </View>
        <View className="mt-4">
          <Text className="text-xl font-semibold  text-gray-800">
            Select Your Language
          </Text>
        </View>
        <View className="flex-col items-center w-full">
            {['en', 'kn', 'te'].map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => handleLanguageChange(lang)}
              className="flex-row items-center w-full p-4 border border-gray-300 rounded-lg mt-6"
              style={{
              backgroundColor: selectedLanguage === lang ? '#f1f5f9' : '#fff',
              }} >
              <Ionicons
              name={selectedLanguage === lang ? 'radio-button-on' : 'radio-button-off'}
              size={24}
              color={selectedLanguage === lang ? '#39a676' : '#ccc'}
              />
              <Text className="text-lg font-semibold  text-gray-700 ml-4">
              {lang === 'en' ? 'English' : lang === 'kn' ? 'ಕನ್ನಡ' : 'తెలుగు'}
              </Text>
            </TouchableOpacity>
            ))}
          <TouchableOpacity
            onPress={handleDone}
            className="bg-primary-950 w-full p-4 mt-10 rounded-lg">
            <Text className="text-lg font-semibold text-center text-white">Choose</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
export default LanguageSelectionScreen;
