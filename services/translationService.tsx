import apiClient from '@/clients/apiClient';
import { getItem, setItem } from '@/utils/secure_store';
import { usedTranslationKeys } from '@/context/TranslationContext';
import RNFS from 'react-native-fs';
import { Alert } from 'react-native';

export const saveUsedKeys = async () => {
  try {
    await setItem('usedTranslationKeys', JSON.stringify([...usedTranslationKeys]));
  } catch { }
};

export const loadUsedKeys = async () => {
  try {
    const saved = await getItem('usedTranslationKeys');
    if (saved) {
      JSON.parse(saved).forEach((key: string) => usedTranslationKeys.add(key));
    }
  } catch { }
};

export const fetchAndCacheLanguageFile = async (
  langCode: string,
  allowDownload = true
): Promise<Record<string, string>> => {
  const filePath = `${RNFS.DocumentDirectoryPath}/language_${langCode}.json`;
  const versionFilePath = `${RNFS.DocumentDirectoryPath}/language_${langCode}_version.json`;

  try {
    const fileExists = await RNFS.exists(filePath);
    const versionExists = await RNFS.exists(versionFilePath);

    let currentVersion = null;
    if (versionExists) {
      const versionContent = await RNFS.readFile(versionFilePath, 'utf8');
      currentVersion = JSON.parse(versionContent).version;
    }

    const res = await apiClient.get(`/language/getLanguageFile?code=${langCode}&version=latest&app=GODEZK_ENGINEER`);
    const fileURL = res.data?.data?.url;
    const latestVersion = res.data?.data?.version || 'latest';

    if (!fileURL) throw new Error('Missing URL from language response');

    const shouldDownload = !fileExists || currentVersion !== latestVersion;

    if (shouldDownload && allowDownload) {
      console.log(` Downloading updated language file for ${langCode} (v${latestVersion})`);
   

      // Delete old files
      if (fileExists) await RNFS.unlink(filePath);
      if (versionExists) await RNFS.unlink(versionFilePath);

      const downloadResult = await RNFS.downloadFile({
        fromUrl: fileURL,
        toFile: filePath,
      }).promise;

      if (downloadResult.statusCode !== 200) {
        throw new Error(` Failed to download language file for ${langCode}`);
      }

      await RNFS.writeFile(versionFilePath, JSON.stringify({ version: latestVersion }), 'utf8');

      const json = await RNFS.readFile(filePath, 'utf8');
      return JSON.parse(json);
    }
    if (fileExists) {
      const fileContent = await RNFS.readFile(filePath, 'utf8');
      return JSON.parse(fileContent);
    }
    console.warn(`⚠️ No local file found and download not allowed for ${langCode}`);
    return {};

  } catch (error) {
    console.error('⚠️ Error loading language file:', error);
    return {};
  }
};

export const fetchBaseStrings = async (): Promise<Record<string, string>> => {
  return await fetchAndCacheLanguageFile('en');
};

export const translateBaseToLanguage = async (
  base: Record<string, string>,
  langCode: string,
  predefinedTranslations: Record<string, Record<string, string>> = {},
  
): Promise<Record<string, string>> => {
  if (langCode === 'en') return { ...base };

  const translations = await fetchAndCacheLanguageFile(langCode);
  const result: Record<string, string> = {};

  for (const key of Object.keys(base)) {
    if (translations[key]) {
      result[key] = translations[key];
    } else if (predefinedTranslations[langCode]?.[key]) {
      result[key] = predefinedTranslations[langCode][key];
    } else {
      result[key] = base[key];
    }
  }

  return result;
};

export const translateText = async (text: string, toLang: string): Promise<string> => {
  try {
    if (toLang === 'en') return text;
    const cacheKey = `translation_${toLang}_${text}`;
    const cached = await getItem(cacheKey);
    if (cached) return cached;

    const res = await apiClient.get(
      `/language/translate?text=${encodeURIComponent(text)}&languageCode=${toLang}`
    );
    const translated = res.data?.data?.convertedText || text;
    await setItem(cacheKey, translated);
    return translated;
  } catch {
    return text;
  }
};

export const translateToEnglish = async (text: string): Promise<string> => {
  try {
    if (!text) return text;
    const cacheKey = `translation_en_${text}`;
    const cached = await getItem(cacheKey);
    if (cached) return cached;

    const res = await apiClient.get(
      `/language/translate?text=${encodeURIComponent(text)}&languageCode=en`
    );
    const translated = res.data?.data?.convertedText || text;
    await setItem(cacheKey, translated);
    return translated;
  } catch {
    return text;
  }
};


export const exportLanguageFileToDownloads = async (langCode = 'en') => {
  try {
    const sourcePath = `${RNFS.DocumentDirectoryPath}/language_${langCode}.json`;
    const targetPath = `${RNFS.DownloadDirectoryPath}/language_${langCode}.json`;

    const exists = await RNFS.exists(sourcePath);
    if (!exists) {
      Alert.alert('Not Found', `language_${langCode}.json not found in internal storage.`);
      return;
    }

    await RNFS.copyFile(sourcePath, targetPath);
    Alert.alert('Success', `language_${langCode}.json copied to Downloads.`);
    console.log(`Copied ${sourcePath} → ${targetPath}`);
  } catch (error) {
    console.error('Failed to export language file:', error);
    Alert.alert('Error', 'Failed to export file to Downloads.');
  }
};
