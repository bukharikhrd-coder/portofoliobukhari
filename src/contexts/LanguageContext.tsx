import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "id";

export const languageLabels: Record<Language, string> = {
  en: "English",
  id: "Indonesia",
};

export const languageFlags: Record<Language, string> = {
  en: "🇬🇧",
  id: "🇮🇩",
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("preferred-language");
    return (saved as Language) || "en";
  });

  const isRTL = false; // Only supporting LTR languages now

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("preferred-language", lang);
  };

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
