
import apiClient from '@/clients/apiClient';

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
};export const translateBaseToLanguage = async (
  base: Record<string, string>,
  langCode: string,
  predefined: Record<string, Record<string, string>>
): Promise<Record<string, string>> => {
  if (langCode === 'en') return base;

  const cacheKey = `lang-${langCode}`;
  const cached = await getItem(cacheKey);
  const cachedTranslations: Record<string, string> = cached ? JSON.parse(cached) : {};

  const result: Record<string, string> = {};

  // Combine usedTranslationKeys and all base keys for wider coverage
  const keysToTranslate = new Set([
    ...Object.keys(base),
    ...Array.from(usedTranslationKeys),
  ]);

  const keysToFetch: string[] = [];

  for (const key of keysToTranslate) {
    const normalized = key.toLowerCase();

    if (predefined[langCode]?.[normalized]) {
      result[key] = predefined[langCode][normalized];
      cachedTranslations[key] = result[key];
    } else if (cachedTranslations[key]) {
      result[key] = cachedTranslations[key];
    } else {
      keysToFetch.push(key);
    }
  }

  if (keysToFetch.length > 0) {
    try {
      const textParam = keysToFetch.map(encodeURIComponent).join(',');
      const response = await apiClient.get(
        `/language/translate?text=${textParam}&languageCode=${langCode}`
      );

      const translations: Record<string, string> = response.data?.data || {};

      for (const key of keysToFetch) {
        result[key] = translations[key] || base[key] || key;
        cachedTranslations[key] = result[key];
      }

      await setItem(cacheKey, JSON.stringify(cachedTranslations));
    } catch (err) {
      console.error('Batch translation fetch failed:', err);
      for (const key of keysToFetch) {
        result[key] = base[key] || key;
      }
    }
  }

  return result;
};
