import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  ReactElement,
  isValidElement,
  Children,
  cloneElement,
} from 'react';
import { uiStrings } from '@/locales/en';
import { translateUIStringsToAllIndianLanguages } from '@/services/translationService';
import { getItem, setItem } from '@/utils/secure_store';

// Type for your base string object
type UIStrings = typeof uiStrings;

type TranslationContextType = {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  translatedStrings: UIStrings;
};

const TranslationContext = createContext<TranslationContextType>({
  language: 'en',
  setLanguage: async () => {},
  translatedStrings: uiStrings,
});

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const [translatedStrings, setTranslatedStrings] = useState<UIStrings>(uiStrings);

  const setLanguage = async (langCode: string) => {
    await setItem('language', langCode);
    setLanguageState(langCode);

    if (langCode === 'en') {
      setTranslatedStrings(uiStrings);
    } else {
      const allTranslations = await translateUIStringsToAllIndianLanguages(uiStrings);
      setTranslatedStrings((allTranslations[langCode] as UIStrings) || uiStrings);
    }
  };

  const loadLanguage = async () => {
    const storedLang = await getItem('language');
    if (storedLang) {
      await setLanguage(storedLang);
    }
  };

  useEffect(() => {
    loadLanguage();
  }, []);

  return (
    <TranslationContext.Provider value={{ language, setLanguage, translatedStrings }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);


const translateChildren = (
  children: ReactNode,
  translations: Record<string, string>
): ReactNode => {
  return Children.map(children, (child) => {
    if (typeof child === 'string') {
      return translations[child] ?? child;
    }

    if (isValidElement(child)) {
      const translatedProps: Record<string, any> = {};

      for (const [key, value] of Object.entries(child.props)) {
        if (typeof value === 'string') {
          translatedProps[key] = translations[value] ?? value;
        } else if (key === 'children') {
          translatedProps.children = translateChildren(value, translations) as ReactNode;
        } else {
          translatedProps[key] = value;
        }
      }

      return cloneElement(child, translatedProps);
    }

    return child;
  });
};

export const Translator: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { translatedStrings } = useTranslation();
  return <>{translateChildren(children, translatedStrings)}</>;
};
