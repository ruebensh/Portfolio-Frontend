import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations } from "../lib/i18n";
import { useTranslatedText, translateDynamicText } from "../lib/translator";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  /** Translate dynamic backend content (descriptions, titles, etc.) */
  td: (text: string | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("portfolio_lang") as Language;
      if (saved && ["uz", "en", "ru"].includes(saved)) {
        return saved;
      }
    }
    return "uz"; // Default language Uzbek
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio_lang", lang);
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["uz"]?.[key] || key;
  };

  /** Translate dynamic backend content using dictionary + auto-translate engine */
  const td = (text: string | null | undefined): string => {
    return translateDynamicText(text, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, td }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};