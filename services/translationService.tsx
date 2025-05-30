
import apiClient from '@/clients/apiClient';
import { numerals_kn,numerals_ta,numerals_te,numerals_en,numerals_hi } from '@/utils/helper';
import { getItem, setItem } from '@/utils/secure_store';
import { usedTranslationKeys } from '@/context/TranslationContext';

export const saveUsedKeys = async () => {
  try {
    await setItem('usedTranslationKeys', JSON.stringify([...usedTranslationKeys]));
  } catch (err) {}
};

export const loadUsedKeys = async () => {
  try {
    const saved = await getItem('usedTranslationKeys');
    if (saved) {
      JSON.parse(saved).forEach((key: string) => usedTranslationKeys.add(key));
    }
  } catch (err) {}
};

export const fetchBaseStrings = async (): Promise<Record<string, string>> => {
  try {
    const res = await apiClient.get('/language/getLanguageFile?code=en&app=GODEZK_ENGINEER&version=latest');
    const fileURL = res.data?.data?.url || res.data?.url;
    if (!fileURL) return {};
    const response = await fetch(fileURL);
    const json = await response.json();
    return typeof json === 'object' ? json : {};
  } catch (err) {
    return {};
  }
};

export const translateBaseToLanguage = async (
  base: Record<string, string>,
  langCode: string,
  PREDEFINED_TRANSLATIONS: Record<string, Record<string, string>>
): Promise<Record<string, string>> => {
  if (langCode === 'en') return { ...base };

  const cacheKey = `lang-${langCode}`;
  let cachedTranslations: Record<string, string> = {};

  // Load cached translations
  try {
    const cached = await getItem(cacheKey);
    cachedTranslations = cached ? JSON.parse(cached) : {};
  } catch {
    cachedTranslations = {};
  }

  const updatedCache: Record<string, string> = { ...cachedTranslations };
  const result: Record<string, string> = {};

  for (const key of Object.keys(base)) {
    const normalized = key.toLowerCase();
    const englishValue = base[key];

    // 1. Use predefined translation if available
    if (PREDEFINED_TRANSLATIONS[langCode]?.[normalized]) {
      result[key] = PREDEFINED_TRANSLATIONS[langCode][normalized];
      updatedCache[key] = result[key];
      continue;
    }

    // 2. Use cached translation if available
    if (cachedTranslations[key]) {
      result[key] = cachedTranslations[key];
      continue;
    }

    // 3. Otherwise, call API and translate
    try {
      const cleanText = englishValue.replace(/[\u{1F600}-\u{1F64F}]/gu, '');
      const res = await apiClient.get(
        `/language/translate?text=${encodeURIComponent(cleanText)}&languageCode=${langCode}`
      );
      const translated = res.data?.data?.convertedText || englishValue;

      result[key] = translated;
      updatedCache[key] = translated;
    } catch {
      result[key] = englishValue;
    }
  }

  // Save updated cache
  try {
    await setItem(cacheKey, JSON.stringify(updatedCache));
  } catch (err) {
    console.warn('Error saving translation cache', err);
  }

  return result;
};
export const translateNumberToNative = (num: any, lang:'en'| 'kn' | 'te' | 'ta' | 'hi') => {
  const maps: Record< 'en'|'kn' | 'te' | 'ta' | 'hi', Record<string, string>> = {
    kn: numerals_kn,
    te: numerals_te,
    ta: numerals_ta,
    en : numerals_en,
    hi : numerals_hi,
  };

  const digits = num.toString().split('');
  return digits.map((d: string) => maps[lang][d] ?? d).join('');
};