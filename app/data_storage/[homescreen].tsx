import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/context/TranslationContext';
import { getItem } from '@/utils/secure_store';
import PrimaryText from "@/components/PrimaryText";
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', englishName: 'English' },
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi' },
  { code: 'te', name: 'తెలుగు', englishName: 'Telugu' },
  { code: 'ta', name: 'தமிழ்', englishName: 'Tamil' },
  { code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada' },
];

const LanguageSelectionScreen = () => {
  const { language, setLanguage, } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    const fetchLanguage = async () => {
      const storedLanguage = await getItem('language');
      if (storedLanguage) {
        setLanguage(storedLanguage);
      }
    };
    fetchLanguage();
  }, [setLanguage]);

  const handleDone = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingTop: 10, paddingBottom: 10, paddingHorizontal: 20 }}>
        <View className="items-start">
        <Image
              source={require('../../assets/images/godezk_engineer_banner_300x150.png')}
              style={{ width: 100, height: 60 }}
            />
        </View>

        <View className="mt-6">
          <PrimaryText className="text-xl font-semibold text-gray-800">Select Language</PrimaryText>
        </View>

        <View className="">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => setLanguage(lang.code)}
              className="flex-row items-center p-4 mt-4 border border-gray-300 rounded-lg"
              style={{
                backgroundColor: language === lang.code ? '#f1f5f9' : '#fff',
              }}
            >
              <Ionicons
                name={language === lang.code ? 'radio-button-on' : 'radio-button-off'}
                size={24}
                color={language === lang.code ? '#206e69' : '#ccc'}
              />
              <PrimaryText className="text-lg font-semibold text-gray-700 ml-4">
                {lang.name} ({lang.englishName})
              </PrimaryText>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mt-10">
          <TouchableOpacity
            onPress={handleDone}
            className="bg-primary-950 w-full p-4 rounded-lg"
          >
            <PrimaryText className="text-lg font-medium text-center text-white">
              Choose
            </PrimaryText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LanguageSelectionScreen;
