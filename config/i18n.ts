import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import kn from "../locales/kn.json";
import te from "../locales/te.json";

i18n.use(initReactI18next).init({
  lng: "en", // Default language
  fallbackLng: "en", // Fallback language
  // debug: true,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      translation: en,
    },
    kn: {
      translation: kn,
    },
    te: {
      translation: te,
    },
  },
});

export default i18n;
