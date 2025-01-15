import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import i18n from './i18n';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getItem, setItem } from '@/utils/secure_store';

const LanguageSelectionScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const router = useRouter();

  useEffect(() => {
    const fetchLanguage = async () => {
      const storedLanguage = await getItem('language');
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
    await setItem('language', selectedLanguage);
    router.push('/login');
  };

  return (
    <View className="flex-1 bg-white p-5">
      {/* Header */}
      <View>
        <View className="flex-row items-end">
          <Image
            source={require("../../assets/images/godesk.jpg")}
            style={{ width: 30, height: 30 }}
          />
          <Text className="font-bold text-secondary-950 ms-.5 mb-1.5">
            desk <Text className="text-primary-950">Workplace</Text>
          </Text>
        </View>
      </View>

      {/* Title */}
      <View className="mt-10">
        <Text className="text-3xl font-bold text-center mb-10 text-gray-800">
          Select Your Language
        </Text>
      </View>

      {/* Language Options */}
      <View className="flex-col items-center w-full px-4 mt-5 space-y-4">
        {/* English Option */}
      
        <TouchableOpacity
          onPress={() => handleLanguageChange('en')}
          className="flex-row items-center w-full p-4 border border-gray-300 rounded-xl shadow-md"
          style={{
            backgroundColor: selectedLanguage === 'en' ? '#f1f5f9' : '#fff',
          }}
        >
          <Ionicons
            name={selectedLanguage === 'en' ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color={selectedLanguage === 'en' ? '#39a676' : '#ccc'}
          />
          <Text className="text-lg font-semibold text-gray-700 ml-4">English</Text>
        </TouchableOpacity>
      
        {/* Kannada Option */}
        <TouchableOpacity
          onPress={() => handleLanguageChange('kn')}
          className="flex-row items-center w-full p-4 border mt-10 border-gray-300 rounded-xl shadow-md"
          style={{
            backgroundColor: selectedLanguage === 'kn' ? '#f1f5f9' : '#fff',
          }}
        >
          <Ionicons
            name={selectedLanguage === 'kn' ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color={selectedLanguage === 'kn' ? '#39a676' : '#ccc'}
          />
          <Text className="text-lg font-semibold text-gray-700 ml-4">ಕನ್ನಡ</Text>
        </TouchableOpacity>

        {/* Telugu Option */}
        <TouchableOpacity
          onPress={() => handleLanguageChange('te')}
          className="flex-row items-center w-full p-4 border mt-10 border-gray-300 rounded-xl shadow-md"
          style={{
            backgroundColor: selectedLanguage === 'te' ? '#f1f5f9' : '#fff',
          }}
        >
          <Ionicons
            name={selectedLanguage === 'te' ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color={selectedLanguage === 'te' ? '#39a676' : '#ccc'}
          />
          <Text className="text-lg font-semibold text-gray-700 ml-4">తెలుగు</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={() => handleLanguageChange('hi')}
          className="flex-row items-center w-full p-4 border mt-10 border-gray-300 rounded-xl shadow-md"
          style={{
            backgroundColor: selectedLanguage === 'hi' ? '#f1f5f9' : '#fff',
          }}
        >
          <Ionicons
            name={selectedLanguage === 'hi' ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color={selectedLanguage === 'hi' ? '#39a676' : '#ccc'}
          />
          <Text className="text-lg font-semibold text-gray-700 ml-4">Hindi</Text>
        </TouchableOpacity> */}
      </View>

      {/* Done Button */}
      <View className="flex-1">
  {/* Other content of the screen */}
  <View className="mt-10">
        <TouchableOpacity
          onPress={handleDone}
          className="bg-primary-950 w-full p-4 rounded-xl shadow-md"
        >
       <Text className="text-lg font-bold text-center text-white">Done</Text>
       </TouchableOpacity>
  </View>
</View>

    </View>
  );
};

export default LanguageSelectionScreen;