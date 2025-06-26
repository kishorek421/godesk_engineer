import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import commonEn from "./translations/en.json";
import commonTa from "./translations/ta.json";
import commonKn from "./translations/kn.json";
import commonTe from "./translations/te.json";
import commonMl from "./translations/ml.json";
import commonMr from "./translations/mr.json";
import commonHi from "./translations/hi.json";

import apiClient from "@/clients/apiClient";
import { getItem, setItem } from "@/utils/secure_store";

// Translation resources
const translationResources = {
  en: { common: commonEn },
  ta: { common: commonTa },
  kn: { common: commonKn },
  hi: { common: commonHi },
  te: { common: commonTe },
  ml: { common: commonMl },
  mr: { common: commonMr },
};

// i18n initialization
const initI18n = async () => {
  const savedLanguage = await AsyncStorage.getItem("language");
  const fallbackLang = Localization.locale.split("-")[0] || "en";
  const language = savedLanguage || fallbackLang;

  await i18n.use(initReactI18next).init({
    resources: translationResources,
    lng: language,
    fallbackLng: "en",
    ns: ["common"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: "v4",
    react: { useSuspense: false },
    debug: false,
  });

  i18n.on("languageChanged", (lng: string) => {
    AsyncStorage.setItem("language", lng);
  });
};

initI18n();

export const translateUsingApi = async (
  text: string,
  toLang: string
): Promise<string> => {
  const cacheKey = `translation_${toLang}_${text}`;
  const lng = i18n.language;
  try {
    // const cached = await getItem(cacheKey);
    // if (cached) return cached;

    const res = await apiClient.get(
      `/language/translate?text=${encodeURIComponent(text)}&languageCode=${lng}`
    );

    const translated = res.data?.data?.convertedText || text;

    await setItem(cacheKey, translated);

    return translated;
  } catch (error) {
    console.error("API translation failed:", error);
    return text;
  }
};
export const translateText = async (
  text: string,
  toLang: string
): Promise<string> => {
  const lng = i18n.language;
  try {
    if (!text?.trim()) {
      console.warn("No text provided for translation.");
      return text;
    }

    if (toLang === "en") {
      console.log("Target language is English — skipping translation.");
      return text;
    }

    ////////////caching should be implement through sql local db

    // const cacheKey = `translation_${toLang}_${text}`;
    // const cached = await getItem(cacheKey);

    // console.log("cacheKey", cacheKey);

    // if (cached) {
    //   console.log("Using cached translation:", cached);
    //   return cached;
    // }

    console.log("Calling translation API with:", { text, toLang });

    const params = {
      text: text,
      languageCode: lng,
    };

    console.log("params", params);

    const res = await apiClient.get(`/language/translate`, {
      params: params,
    });

    const translated = res.data?.data?.convertedText;

    console.log("translated", translated);

    if (!translated || typeof translated !== "string") {
      console.warn(
        "No valid translated text returned from API. Fallback to original."
      );
      return text;
    }

    // await setItem(cacheKey, translated);
    return translated;
  } catch (error) {
    console.error("Translation API failed:", error);
    return text;
  }
};

export default i18n;
