"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations } from "@/lib/i18n";
import { translateDynamicText, addTranslationListener } from "@/lib/translator";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  td: (text: string | null | undefined) => string;
  mounted: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("uz");
  const [mounted, setMounted] = useState(false);
  const [, setTick] = useState(0); // Force re-render when async translations complete

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("devini_lang") as Language;
      if (saved && ["uz", "en", "ru"].includes(saved)) {
        setLanguageState(saved);
      }
    }
  }, []);

  // Subscribe to async translation completions → force re-render
  useEffect(() => {
    const unsubscribe = addTranslationListener(() => setTick(t => t + 1));
    return unsubscribe;
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("devini_lang", lang);
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["uz"]?.[key] || key;
  };

  const td = (text: string | null | undefined): string => {
    if (!mounted) return text || "";
    return translateDynamicText(text, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, td, mounted }}>
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
