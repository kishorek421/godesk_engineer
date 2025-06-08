import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  Children,
  isValidElement,
  cloneElement,
} from 'react';
import { Text } from 'react-native';
import { getItem, setItem } from '@/utils/secure_store';
import TRANSLATIONS from '@/locales/translations';
import {
  fetchBaseStrings,
  translateBaseToLanguage,
  loadUsedKeys,
  saveUsedKeys,
  translateText,
} from '@/services/translationService';
import LoadingBar from '@/components/LoadingBar';
import RNFS from 'react-native-fs';

const PREDEFINED_TRANSLATIONS: Record<string, Record<string, string>> = Object.fromEntries(
  Object.entries(TRANSLATIONS).map(([lang, translations]) => [
    lang,
    Object.fromEntries(Object.entries(translations).map(([k, v]) => [k.toLowerCase(), v])),
  ])
);

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  translatedStrings: Record<string, string>;
  baseStrings: Record<string, string>;
}

const TranslationContext = createContext<TranslationContextType>({
  language: 'en',
  setLanguage: async () => {},
  translatedStrings: {},
  baseStrings: {},
});

export const usedTranslationKeys = new Set<string>();

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState('en');
  const [translatedStrings, setTranslatedStrings] = useState<Record<string, string>>({});
  const [baseStrings, setBaseStrings] = useState<Record<string, string>>({});

  const setLanguage = async (lang: string) => {
    try {
      const selectedLang = lang || 'en';
      await setItem('language', selectedLang);
      await loadUsedKeys();
      const base = await fetchBaseStrings();
      const translated = await translateBaseToLanguage(base, selectedLang, PREDEFINED_TRANSLATIONS);
      setLanguageState(selectedLang);
      setBaseStrings(base);
      setTranslatedStrings(translated);
    } catch (err) {
      console.error('Translation load error:', err);
    }
  };

 useEffect(() => {
  (async () => {
    try {
      const storedLang = await getItem('language');
      await setLanguage(storedLang || 'en');
    } catch (e) {
      console.error('Language init error:', e);
    }
  })();
}, []);

  useEffect(() => {
    const timer = setTimeout(() => saveUsedKeys(), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <TranslationContext.Provider
      value={{ language, setLanguage, translatedStrings, baseStrings }}
    >
      {children}
    </TranslationContext.Provider>
  );
};
export const loadLanguageFromCache = async (): Promise<{
  language: string;
  translatedStrings: Record<string, string>;
  baseStrings: Record<string, string>;
}> => {
  const langCode = (await getItem('language')) || 'en';
  const filePath = `${RNFS.DocumentDirectoryPath}/language_${langCode}.json`;

  let translatedStrings: Record<string, string> = {};
  try {
    const exists = await RNFS.exists(filePath);
    if (exists) {
      const content = await RNFS.readFile(filePath, 'utf8');
      translatedStrings = JSON.parse(content);
      console.log(`✅ Loaded cached language file for ${langCode}`);
    } else {
      console.warn(`⚠️ Cached translation file not found for ${langCode}`);
    }
  } catch (err) {
    console.warn('⚠️ Error reading cached translation file:', err);
  }

  const baseStrings = await fetchBaseStrings();

  return {
    language: langCode,
    translatedStrings,
    baseStrings,
  };
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) throw new Error('useTranslation must be used inside TranslationProvider');
  return context;
};

const NON_TRANSLATABLE_PROPS = [
  'value',
  'defaultErrorMsg',
  'className',
  'href',
  'keyboardType',
  'resizeMode',
  'color',
  'options',
];

const translateChildren = (
  children: ReactNode,
  translations: Record<string, string>,
  base: Record<string, string>,
  language: string
): ReactNode =>
  Children.map(children, (child) => {
    if (typeof child === 'string' && child.trim()) {
      usedTranslationKeys.add(child);
      const normalized = child.toLowerCase();
      return (
        translations[child] ||
        translations[normalized] ||
        PREDEFINED_TRANSLATIONS[language]?.[normalized] ||
        base[child] ||
        base[normalized] ||
        child
      );
    }

    if (isValidElement(child)) {
      const translatedProps: Record<string, any> = {};

      for (const [key, value] of Object.entries(child.props)) {
        if (NON_TRANSLATABLE_PROPS.includes(key)) {
          translatedProps[key] =
            key === 'options' && Array.isArray(value)
              ? value.map((opt) => {
                  const label = opt.label?.toString() || '';
                  const normalized = label.toLowerCase();
                  usedTranslationKeys.add(label);
                  return {
                    ...opt,
                    label:
                      translations[label] ||
                      translations[normalized] ||
                      base[label] ||
                      PREDEFINED_TRANSLATIONS[language]?.[normalized] ||
                      label,
                  };
                })
              : value;
        } else if (typeof value === 'string') {
          usedTranslationKeys.add(value);
          const normalized = value.toLowerCase();
          translatedProps[key] =
            translations[value] ||
            translations[normalized] ||
            PREDEFINED_TRANSLATIONS[language]?.[normalized] ||
            base[value] ||
            base[normalized] ||
            value;
        } else if (key === 'children') {
          translatedProps.children = translateChildren(value, translations, base, language);
        } else {
          translatedProps[key] = value;
        }
      }

      return cloneElement(child, translatedProps);
    }

    return child;
  });

export const Translator = ({
  children,
  text,
  dynamic = false,
  showLoadingBar = false,
}: {
  children?: ReactNode;
  text?: string;
  dynamic?: boolean;
  showLoadingBar?: boolean;
}) => {
  const { translatedStrings, baseStrings, language } = useTranslation();
  const [dynamicTranslated, setDynamicTranslated] = useState<string | null>(null);

  useEffect(() => {
    const translate = async () => {
      if (dynamic && text && language !== 'en') {
        const result = await translateText(text, language);
        setDynamicTranslated(result);
      }
    };
    translate();
  }, [text, language, dynamic]);

  if (dynamic) {
    if (dynamicTranslated === null) {
      return showLoadingBar ? <LoadingBar /> : null;
    }
    return <Text>{dynamicTranslated}</Text>;
  }

  if (text) {
    usedTranslationKeys.add(text);
    const normalized = text.toLowerCase();
    const translated =
      translatedStrings[text] ||
      translatedStrings[normalized] ||
      PREDEFINED_TRANSLATIONS[language]?.[normalized] ||
      baseStrings[text] ||
      baseStrings[normalized] ||
      text;
    return <Text>{translated}</Text>;
  }

  return <>{translateChildren(children, translatedStrings, baseStrings, language)}</>;
};

export default Translator;
