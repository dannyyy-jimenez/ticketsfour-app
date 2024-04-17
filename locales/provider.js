import React from "react";
const LocalizationContext = React.createContext(null);
import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import { translations } from "../localization";

export function useLocalization() {
  const value = React.useContext(LocalizationContext);

  return value;
}

export function LocalizationProvider(props) {
  const i18n = new I18n(translations);
  const locales = Localization.getLocales();
  let [locale, setLocale] = React.useState(locales[0].languageCode);
  i18n.enableFallback = true;
  i18n.defaultLocale = "en";
  i18n.locale = locale;

  return (
    <LocalizationContext.Provider value={{ i18n, locale }}>
      {props.children}
    </LocalizationContext.Provider>
  );
}
