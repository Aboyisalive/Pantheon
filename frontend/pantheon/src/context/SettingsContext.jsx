import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { translate } from "../i18n";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem("pantheon_theme") || "dark"
  );
  const [language, setLanguageState] = useState(
    () => localStorage.getItem("pantheon_language") || "en"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = useCallback((value) => {
    localStorage.setItem("pantheon_theme", value);
    setThemeState(value);
  }, []);

  const setLanguage = useCallback((value) => {
    localStorage.setItem("pantheon_language", value);
    setLanguageState(value);
  }, []);

  const t = useCallback((key) => translate(language, key), [language]);

  return (
    <SettingsContext.Provider value={{ theme, setTheme, language, setLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook lives with its provider
export function useSettings() {
  return useContext(SettingsContext);
}
