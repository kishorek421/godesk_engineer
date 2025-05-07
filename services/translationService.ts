

import axios from 'axios';
import { uiStrings } from  'locales/en'
import translations from 'locales/kn';

import { getItem, setItem } from '@/utils/secure_store';
const AZURE_ENDPOINT = 'https://api.cognitive.microsofttranslator.com';
const AZURE_REGION = 'centralindia';
const AZURE_KEY = 'AbqyZHwZfwf9es1l2mpS01Q2W2Oe7QGt3WO9E7Al5avYcouLkrrUJQQJ99BDACGhslBXJ3w3AAAbACOGfhd1';

const SUPPORTED_INDIAN_LANGUAGES = [
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi' },
  // { code: 'bn', name: 'বাংলা', englishName: 'Bengali' },
  { code: 'te', name: 'తెలుగు', englishName: 'Telugu' },
  { code: 'mr', name: 'मराठी', englishName: 'Marathi' },
  { code: 'ta', name: 'தமிழ்', englishName: 'Tamil' },
  // { code: 'ur', name: 'اردو', englishName: 'Urdu' },
  // { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati' },
  { code: 'ml', name: 'മലയാളം', englishName: 'Malayalam' },
  { code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada' },
  // { code: 'or', name: 'ଓଡ଼ିଆ', englishName: 'Odia' },
  // { code: 'pa', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi' },
  // { code: 'as', name: 'অসমীয়া', englishName: 'Assamese' },
];


const { kn, hi, te, ta } = translations;
const PREDEFINED_TRANSLATIONS: Record<string, Record<string, string>> = {
  kn , hi,te,ta

};

export const translateUIStringsToAllIndianLanguages = async (
  strings: Record<string, string> = uiStrings
) => {
  try {
    const translations: Record<string, Record<string, string>> = { en: strings };

    for (const lang of SUPPORTED_INDIAN_LANGUAGES) {
      const cached = await getItem(`translations_${lang.code}`);
      if (cached) {
        translations[lang.code] = JSON.parse(cached);
        continue;
      }

      const predefined = PREDEFINED_TRANSLATIONS[lang.code] || {};
      const missingKeys = Object.keys(strings).filter(
        key => !(key in predefined)
      );

      let translated: Record<string, string> = { ...predefined };

      if (missingKeys.length > 0) {
        const texts = missingKeys.map(key => strings[key]);
          const response = await axios.post(
            `${AZURE_ENDPOINT}/translate?api-version=3.0&from=en&to=${lang.code}`,
            texts.map(text => ({ Text: text })),
            {
              headers: {
                'Ocp-Apim-Subscription-Key': AZURE_KEY,
                'Ocp-Apim-Subscription-Region': AZURE_REGION,
                'Content-Type': 'application/json',
              },
            }
          );

        missingKeys.forEach((key, index) => {
          translated[key] = response.data[index].translations[0].text;
        });
      }

      await setItem(`translations_${lang.code}`, JSON.stringify(translated));
      translations[lang.code] = translated;
    }

    return translations;
  } catch (error) {
    console.error('UI strings translation error:', error);
    throw error;
  }
}; 