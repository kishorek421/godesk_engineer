import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import i18n from './i18n'; // import i18n configuration
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageSelectionScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // Default language is 'en'

  // Check for stored language preference on first render
  useEffect(() => {
    const fetchLanguage = async () => {
      const storedLanguage = await AsyncStorage.getItem('language');
      if (storedLanguage) {
        setSelectedLanguage(storedLanguage);
        i18n.changeLanguage(storedLanguage); 
      }
    };

    fetchLanguage();
  }, []);

  // Handle language change
  const handleLanguageChange = (lang :any) => {
    setSelectedLanguage(lang);
    i18n.changeLanguage(lang); // Change the language in i18n
    AsyncStorage.setItem('language', lang); // Save selected language to AsyncStorage
  };

  return (
    <View className="flex-1 justify-center items-center p-5">
      <Text className="text-2xl font-bold mb-5">Select Language</Text>

      {/* Button styles using Tailwind-like class names */}
      <View className="w-full mb-3">
        <Button
          title="English"
          onPress={() => handleLanguageChange('en')}
          color={selectedLanguage === 'en' ? 'green' : 'blue'}
        />
      </View>
      <View className="w-full mb-3">
        <Button
          title="ಕನ್ನಡ"
          onPress={() => handleLanguageChange('kn')}
          color={selectedLanguage === 'kn' ? 'green' : 'blue'}
        />
      </View>
      <View className="w-full mb-3">
        <Button
          title="తెలుగు"
          onPress={() => handleLanguageChange('te')}
          color={selectedLanguage === 'te' ? 'green' : 'blue'}
        />
      </View>
      
      <Text className="mt-5 text-lg">
        Selected Language: {i18n.t('welcomeMessage')}
      </Text>
    </View>
  );
};

export default LanguageSelectionScreen;
