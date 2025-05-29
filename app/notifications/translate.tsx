import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import apiClient from '@/clients/apiClient';



const languages = [
  { code: 'kn', label: 'Kannada' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'ml', label: 'Malayalam' },
];

const TranslationScreen = () => {
  const [inputText, setInputText] = useState('');
  const [languageCode, setLanguageCode] = useState('kn');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [refreshing, setRefreshing] = useState(false);

  const translateText = () => {
  if (!inputText.trim() || isLoading) return;

  setIsLoading(true);
  setRefreshing(true);
  setErrorMessage('');
  setTranslatedText('');

  apiClient
    .get('/language/translate', {
      params: {
        text: inputText,
        languageCode,
      },
      
    })
    .then((response) => {
      const converted = response?.data?.data?.convertedText;
      if (converted) {
        console.log(`🔄 "${inputText}" ➜ "${converted}"`);
        setTranslatedText(converted);
      } else {
        setTranslatedText('No translation available.');
      }
    })
    .catch((error) => {
      console.error('❌ Translation failed:', error?.message || error);
      setErrorMessage('Translation failed. Please try again.');
    })
    .finally(() => {
      setIsLoading(false);
      setRefreshing(false);
    });
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Text Translator</Text>

      <TextInput
        placeholder="Enter text to translate"
        value={inputText}
        onChangeText={setInputText}
        style={styles.input}
        multiline
      />

      <Text style={styles.label}>Select Language:</Text>
      <View style={styles.langButtons}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.langButton,
              languageCode === lang.code && styles.selectedLang,
            ]}
            onPress={() => setLanguageCode(lang.code)}
          >
            <Text
              style={[
                styles.langText,
                languageCode === lang.code && styles.selectedLangText,
              ]}
            >
              {lang.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title="Translate" onPress={translateText} disabled={loading} />

      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Text style={styles.resultLabel}>Translation:</Text>
      <Text style={styles.result}>{translatedText}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  langButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  langButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedLang: {
    backgroundColor: '#333',
  },
  langText: {
    color: '#000',
  },
  selectedLangText: {
    color: '#fff',
  },
  resultLabel: {
    marginTop: 20,
    fontWeight: 'bold',
  },
  result: {
    fontSize: 18,
    marginTop: 10,
    color: 'green',
  },
  error: {
    marginTop: 10,
    color: 'red',
    fontWeight: 'bold',
  },
});

export default TranslationScreen;
