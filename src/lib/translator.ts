import { useState, useEffect } from "react";
import { Language } from "./i18n";

// ── Dictionary Mappings for Instant Common Translations ──────────────────────
const COMMON_DICTIONARY: Record<string, Record<Language, string>> = {
  "Live": { uz: "Faol", en: "Live", ru: "В эфире" },
  "In Progress": { uz: "Jarayonda", en: "In Progress", ru: "В процессе" },
  "General": { uz: "Umumiy", en: "General", ru: "Общий" },
  "Portfolio": { uz: "Portfolio", en: "Portfolio", ru: "Портфолио" },
  "Experience": { uz: "Tajriba", en: "Experience", ru: "Опыт работы" },
  "Skills & Expertise": { uz: "Ko'nikmalar va Tajriba", en: "Skills & Expertise", ru: "Навыки и Опыт" },
  "About Me": { uz: "Men haqimda", en: "About Me", ru: "Обо мне" },
  "Certificates": { uz: "Sertifikatlar", en: "Certificates", ru: "Сертификаты" },
  "Projects": { uz: "Loyihalar", en: "Projects", ru: "Проекты" },
  "Resume": { uz: "Rezyume", en: "Resume", ru: "Резюме" },
  "Contact": { uz: "Aloqa", en: "Contact", ru: "Контакты" },
  "AI/ML Student & Python Developer": {
    uz: "AI/ML Talabasi & Python Dasturchi",
    en: "AI/ML Student & Python Developer",
    ru: "Студент AI/ML & Python Разработчик"
  },
  "Senior Full-Stack Engineer & AI Specialist": {
    uz: "Katta Full-Stack Muxandisi & AI Mutaxassisi",
    en: "Senior Full-Stack Engineer & AI Specialist",
    ru: "Ведущий Full-Stack Инженер и ИИ Специалист"
  },
  "Data Science & Machine Learning student at School 21": {
    uz: "School 21 da Data Science va Machine Learning talabasi",
    en: "Data Science & Machine Learning student at School 21",
    ru: "Студент Data Science и Machine Learning в Школе 21"
  },
  "Full-stack software engineer specializing in modern web technologies.": {
    uz: "Zamonaviy veb-texnologiyalar va Sun'iy Intellekt bo'yicha mutaxassis.",
    en: "Full-stack software engineer specializing in modern web technologies and AI.",
    ru: "Full-stack разработчик, специализирующийся на современных веб-технологиях и ИИ."
  },
  "I build smart, scalable digital products": {
    uz: "Men aqlli va masshtablanuvchi raqamli mahsulotlar yarataman",
    en: "I build smart, scalable digital products",
    ru: "Я создаю умные и масштабируемые цифровые продукты"
  },
  "IT dunyosiga sayohatimning asosiy bosqichlari": {
    uz: "IT dunyosiga sayohatimning asosiy bosqichlari",
    en: "Key milestones of my journey in the IT world",
    ru: "Ключевые этапы моего пути в мире IT"
  },
  "Ko'nikmalarim va texnologiyalar bo'yicha bilimlarim": {
    uz: "Ko'nikmalarim va texnologiyalar bo'yicha bilimlarim",
    en: "My skills and technological expertise",
    ru: "Мои навыки и технологический опыт"
  }
};

// ── In-Memory & LocalStorage Translation Cache ───────────────────────────────
const MEMORY_CACHE = new Map<string, string>();

function getCacheKey(text: string, targetLang: string): string {
  return `tr_v2_${targetLang}_${text.trim()}`;
}

function getCachedTranslation(text: string, targetLang: string): string | null {
  const key = getCacheKey(text, targetLang);
  if (MEMORY_CACHE.has(key)) {
    return MEMORY_CACHE.get(key)!;
  }
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        MEMORY_CACHE.set(key, saved);
        return saved;
      }
    } catch (e) {
      // localStorage disabled or full
    }
  }
  return null;
}

function setCachedTranslation(text: string, targetLang: string, translated: string) {
  const key = getCacheKey(text, targetLang);
  MEMORY_CACHE.set(key, translated);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, translated);
    } catch (e) {
      // localStorage disabled or full
    }
  }
}

// Listeners for dynamic updates when async translation arrives
type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach(fn => fn());
}

/**
 * Async Google Translate engine for arbitrary dynamic strings
 */
export async function translateTextAsync(text: string, targetLang: Language): Promise<string> {
  if (!text || !text.trim()) return text;
  const trimmed = text.trim();

  // If target language is UZ (default) or dictionary hit
  if (targetLang === "uz") return text;
  if (COMMON_DICTIONARY[trimmed]?.[targetLang]) {
    return COMMON_DICTIONARY[trimmed][targetLang];
  }

  // Check cache
  const cached = getCachedTranslation(trimmed, targetLang);
  if (cached) return cached;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    if (data && data[0] && Array.isArray(data[0])) {
      const translated = data[0].map((x: any) => x[0]).join("");
      if (translated) {
        setCachedTranslation(trimmed, targetLang, translated);
        notifyListeners();
        return translated;
      }
    }
  } catch (err) {
    console.warn("Auto-translation fetch warning:", err);
  }

  return text;
}

/**
 * Synchronous helper for immediate render (with background auto-translation trigger)
 */
export function translateDynamicText(text: string | null | undefined, targetLang: Language): string {
  if (!text || !text.trim()) return "";
  const trimmed = text.trim();

  if (targetLang === "uz") return text;

  // 1. Direct dictionary match
  if (COMMON_DICTIONARY[trimmed]?.[targetLang]) {
    return COMMON_DICTIONARY[trimmed][targetLang];
  }

  // 2. Case-insensitive dictionary match
  const lowerKey = Object.keys(COMMON_DICTIONARY).find(k => k.toLowerCase() === trimmed.toLowerCase());
  if (lowerKey && COMMON_DICTIONARY[lowerKey]?.[targetLang]) {
    return COMMON_DICTIONARY[lowerKey][targetLang];
  }

  // 3. Check Cache
  const cached = getCachedTranslation(trimmed, targetLang);
  if (cached) return cached;

  // 4. Trigger async translation in background
  translateTextAsync(trimmed, targetLang);

  // Return original while waiting for async translation
  return text;
}

/**
 * Custom React Hook that automatically subscribes to translation updates
 */
export function useTranslatedText(text: string | null | undefined, targetLang: Language): string {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (!text) return "";
  return translateDynamicText(text, targetLang);
}
