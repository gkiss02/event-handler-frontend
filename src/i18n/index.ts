import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import huErrors from "./hu/errors.json";

void i18n.use(initReactI18next).init({
  lng: "hu",
  fallbackLng: "hu",
  interpolation: {
    escapeValue: false,
  },
  resources: {
    hu: {
      errors: huErrors,
    },
  },
});

export default i18n;
