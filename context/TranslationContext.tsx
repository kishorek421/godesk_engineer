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
import LoadingBar from '@/components/LoadingBar';
import { getItem, setItem } from '@/utils/secure_store';
import TRANSLATIONS from '@/locales/translations';
import {
  fetchBaseStrings,
  translateBaseToLanguage,
  loadUsedKeys,
  saveUsedKeys,
} from '@/services/translationService';

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
  loading: boolean;
}

const TranslationContext = createContext<TranslationContextType>({
  language: 'en',
  setLanguage: async () => {},
  translatedStrings: {},
  baseStrings: {},
  loading: true,
});

export const usedTranslationKeys = new Set<string>();

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState('en');
  const [translatedStrings, setTranslatedStrings] = useState<Record<string, string>>({});
  const [baseStrings, setBaseStrings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const setLanguage = async (lang: string) => {
    setLoading(true);
    try {
      const selectedLang = lang || 'en';
      await setItem('language', selectedLang);
      setLanguageState(selectedLang);

      await loadUsedKeys();
      const base = await fetchBaseStrings();
      const translated = await translateBaseToLanguage(base, selectedLang, PREDEFINED_TRANSLATIONS);
      setBaseStrings(base);
      setTranslatedStrings(translated);
    } catch (err) {
      console.error('Translation load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const storedLang = await getItem('language');
      await setLanguage(storedLang || 'en');
    })();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => saveUsedKeys(), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <TranslationContext.Provider
      value={{ language, setLanguage, translatedStrings, baseStrings, loading }}
    >
      {children}
    </TranslationContext.Provider>
  );
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
  ,
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
      const normalizedChild = child.toLowerCase();
      return (
        translations[child] ||
        PREDEFINED_TRANSLATIONS[language]?.[normalizedChild] ||
        base[child] ||
        child
      );
    }
    if (isValidElement(child)) {
      const translatedProps: Record<string, any> = {};
      for (const [key, value] of Object.entries(child.props)) {
        if (NON_TRANSLATABLE_PROPS.includes(key)) {
          translatedProps[key] = value;
        } else if (typeof value === 'string') {
          usedTranslationKeys.add(value);
          const normalized = value.toLowerCase();
          translatedProps[key] =
            translations[value] ||
            PREDEFINED_TRANSLATIONS[language]?.[normalized] ||
            base[value] ||
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

export const Translator = ({ children, text }: { children?: ReactNode; text?: string }) => {
  const { translatedStrings, baseStrings, language, loading } = useTranslation();

if (loading) return <LoadingBar/>;

  if (text) {
    usedTranslationKeys.add(text);
    const normalizedText = text.toLowerCase();
    const translated =
      translatedStrings[text] ||
      PREDEFINED_TRANSLATIONS[language]?.[normalizedText] ||
      baseStrings[text] ||
      text;
    return <Text>{translated}</Text>;
  }

  return <>{translateChildren(children, translatedStrings, baseStrings, language)}</>;
};

export default TranslationContext;
