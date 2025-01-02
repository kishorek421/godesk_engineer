import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import i18n from './i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const LanguageSelectionScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const router = useRouter();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'te', label: 'తెలుగు' }
  ];

  useEffect(() => {
    const fetchLanguage = async () => {
      const storedLanguage = await AsyncStorage.getItem('language');
      if (storedLanguage) {
        setSelectedLanguage(storedLanguage);
        i18n.changeLanguage(storedLanguage);
      } else {
        i18n.changeLanguage('en');
      }
    };
    fetchLanguage();
  }, []);

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
  };

  const handleDone = async () => {
    i18n.changeLanguage(selectedLanguage);
    await AsyncStorage.setItem('language', selectedLanguage);
    router.push('/login');
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-5">
        <View>
          <View className="flex-row items-end">
            <Image
              source={require('../../assets/images/godesk.jpg')}
              style={{ width: 30, height: 30 }}
            />
            <Text className="font-bold text-secondary-950 ms-.5 mb-1.5">
              desk <Text className="text-primary-950">Engineer</Text>
            </Text>
          </View>
        </View>
        <View className="mt-10">
          <Text className="text-3xl font-bold text-center mb-10 text-gray-800">
            Select Your Language
          </Text>
        </View>
        <View className="flex-col items-center w-full px-4 mt-5">
          {languages.map(({ code, label }) => (
            <TouchableOpacity
              key={code}
              onPress={() => handleLanguageChange(code)}
              className="flex-row items-center w-full p-4 border border-gray-300 rounded-xl shadow-md mb-6" 
              style={{
                backgroundColor: selectedLanguage === code ? '#f1f5f9' : '#fff',
              }}
            >
              <Ionicons
                name={selectedLanguage === code ? 'radio-button-on' : 'radio-button-off'}
                size={24}
                color={selectedLanguage === code ? '#39a676' : '#ccc'}
              />
              <Text className="text-lg font-semibold text-gray-700 ml-4">{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View className="mt-10">
          <TouchableOpacity
            onPress={handleDone}
            className="bg-primary-950 w-full p-4 px-4 rounded-xl shadow-md"
          >
            <Text className="text-lg font-bold text-center text-white">Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LanguageSelectionScreen;
