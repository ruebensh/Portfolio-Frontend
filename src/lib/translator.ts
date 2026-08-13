import { Language } from "./i18n";

// Pre-built dictionary mappings for dynamic API attributes
const COMMON_DICTIONARY: Record<string, Record<Language, string>> = {
  "Live": { uz: "Faol", en: "Live", ru: "В эфире" },
  "In Progress": { uz: "Jarayonda", en: "In Progress", ru: "В процессе" },
  "General": { uz: "Umumiy", en: "General", ru: "Общий" },
  "Portfolio": { uz: "Portfolio", en: "Portfolio", ru: "Портфолио" },
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
  }
};

/**
 * Helper to translate dynamic backend content to the chosen language.
 * Uses dictionary match first; if missing, returns original text or clean translated variant.
 */
export function translateDynamicText(text: string | null | undefined, targetLang: Language): string {
  if (!text) return "";
  const trimmed = text.trim();

  // 1. Direct dictionary match
  if (COMMON_DICTIONARY[trimmed]?.[targetLang]) {
    return COMMON_DICTIONARY[trimmed][targetLang];
  }

  // 2. Case-insensitive dictionary match
  const lowerKey = Object.keys(COMMON_DICTIONARY).find(k => k.toLowerCase() === trimmed.toLowerCase());
  if (lowerKey && COMMON_DICTIONARY[lowerKey]?.[targetLang]) {
    return COMMON_DICTIONARY[lowerKey][targetLang];
  }

  // 3. Fallback: Return original text (as backend content is usually provided in UZ or EN)
  return text;
}
