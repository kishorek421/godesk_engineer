import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getItem, setItem } from "@/utils/secure_store";
import PrimaryText from "@/components/PrimaryText";
import i18next from "i18next";
import i18n from "@/i18n";
import { LANGUAGE_KEY } from "@/constants/storage_keys";

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", englishName: "English" },
  { code: "hi", name: "हिन्दी", englishName: "Hindi" },
  { code: "te", name: "తెలుగు", englishName: "Telugu" },
  { code: "ta", name: "தமிழ்", englishName: "Tamil" },
  { code: "kn", name: "ಕನ್ನಡ", englishName: "Kannada" },
  { code: "ml", name: "മലയാളം", englishName: "Malayalam" },
  { code: "mr", name: "मराठी", englishName: "Marathi" },
];

const LanguageSelectionScreen = () => {
  const lng = i18next.language;
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState<string>(lng);
  const [loading, setLoading] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);

  useEffect(() => {
    const fetchLanguage = async () => {
      const storedLanguage = await getItem("language");
      if (storedLanguage) {
        setSelectedLang(storedLanguage);
        // await setLanguage(storedLanguage);
        i18n.changeLanguage(storedLanguage);
      }
      setInitializing(false);
    };
    fetchLanguage();
  }, []);

  const handleSelectLanguage = async (code: string) => {
    setSelectedLang(code);
    setLoading(true);
    // await setLanguage(code);
    i18n.changeLanguage(code);
    setLoading(false);
  };

  const handleDone = async () => {
    setLoading(true);
    // await setLanguage(selectedLang);
    i18n.changeLanguage(selectedLang);
    await setItem(LANGUAGE_KEY, selectedLang);
    setLoading(false);
    router.push('/(auth)/login');
  };

  if (initializing) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#206e69" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{
          paddingTop: 10,
          paddingBottom: 10,
          paddingHorizontal: 20,
        }}
      >
        <View className="items-start">
          <Image
             source={require('../../assets/images/godezk_engineer_banner_300x150.png')}
            style={{ width: 100, height: 60 }}
          />
        </View>

        <View className="mt-6">
          <PrimaryText className="text-xl font-semibold text-gray-800">
            Select Language
          </PrimaryText>
        </View>

        <View className="mt-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <Pressable
                key={lang.code}
                onPress={() => handleSelectLanguage(lang.code)}
                disabled={loading}
                className="flex-row items-center p-4 mt-4 border border-gray-300 rounded-lg"
                style={{
                  backgroundColor: isSelected ? "#f1f5f9" : "#fff",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <Ionicons
                  name={isSelected ? "radio-button-on" : "radio-button-off"}
                  size={24}
                  color={isSelected ? "#206e69" : "#ccc"}
                />
                <PrimaryText
                  className="text-lg font-semibold text-gray-700 ml-4"
                  translate="none"
                >
                  {lang.name} ({lang.englishName})
                </PrimaryText>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-10">
          <Pressable
            onPress={handleDone}
            disabled={loading}
            className="bg-primary-950 w-full p-4 rounded-lg"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <PrimaryText className="text-lg font-medium text-center text-white">
                Choose
              </PrimaryText>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LanguageSelectionScreen;
