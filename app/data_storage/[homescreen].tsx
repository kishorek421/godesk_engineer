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
      <View className="flex-1 p-5">
        <View>
          <View className="flex-row items-end">
            <Image
              source={require('../../assets/images/godesk.png')}
              style={{ width: 30, height: 30 }}
            />
            <Text className="font-bold text-secondary-950 ms-.5 font-regular mb-1.5">
              desk <Text className="text-primary-950 font-regular">Engineer</Text>
            </Text>
          </View>
        </View>
 
        <View className="mt-10">
          <Text className="text-3xl font-bold text-center mb-6 font-regular  text-gray-800">
            Select Your Language
          </Text>
        </View>

        <View className="flex-col items-center w-full px-4 space-y-4">
            {['en', 'kn', 'te'].map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => handleLanguageChange(lang)}
              className="flex-row items-center w-full p-4 border border-gray-300 rounded-xl shadow-soft-1 mt-10"
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
            className="bg-primary-950 w-full p-4 mt-10 rounded-xl shadow-md">
            <Text className="text-lg font-bold text-center text-white">Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
export default LanguageSelectionScreen;
