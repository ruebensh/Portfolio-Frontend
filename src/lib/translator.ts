import { useState, useEffect } from "react";
import { Language } from "./i18n";

const COMMON_DICTIONARY: Record<string, Record<Language, string>> = {
  "Live": { uz: "Faol", en: "Live", ru: "В эфире" },
  "In Progress": { uz: "Jarayonda", en: "In Progress", ru: "В процессе" },
  "Completed": { uz: "Yakunlangan", en: "Completed", ru: "Завершен" },
  "General": { uz: "Umumiy", en: "General", ru: "Общий" },
  "Web Development": { uz: "Veb Dasturlash", en: "Web Development", ru: "Веб-Разработка" },
  "Mobile Apps": { uz: "Mobil Ilovalar", en: "Mobile Apps", ru: "Мобильные Приложения" },
  "AI & ML": { uz: "Sun'iy Intellekt va Machine Learning", en: "AI & ML", ru: "ИИ и Машинное Обучение" },
  "Data Science": { uz: "Ma'lumotlar Ilmi", en: "Data Science", ru: "Наука о Данных" },
  "Frontend": { uz: "Frontend", en: "Frontend", ru: "Фронтенд" },
  "Backend": { uz: "Backend", en: "Backend", ru: "Бэкенд" },
  "DevOps": { uz: "DevOps", en: "DevOps", ru: "DevOps" },
  "Portfolio": { uz: "Portfolio", en: "Portfolio", ru: "Портфолио" },
  "Experience": { uz: "Tajriba", en: "Experience", ru: "Опыт работы" },
  "Skills & Expertise": { uz: "Ko'nikmalar va Tajriba", en: "Skills & Expertise", ru: "Навыки и Опыт" },
  "About Me": { uz: "Men haqimda", en: "About Me", ru: "Обо мне" },
  "Certificates": { uz: "Sertifikatlar", en: "Certificates", ru: "Сертификаты" },
  "Projects": { uz: "Loyihalar", en: "Projects", ru: "Проекты" },
  "Resume": { uz: "Rezyume", en: "Resume", ru: "Резюме" },
  "Contact": { uz: "Aloqa", en: "Contact", ru: "Контакты" },
  "Grafika Rejimi": { uz: "Grafika Rejimi", en: "Graphics Quality", ru: "Качество Графики" },
  "Grafika va Unumdorlik": { uz: "Grafika va Unumdorlik", en: "Graphics & Performance", ru: "Графика и Производительность" },
  "Hi, I’m Jaloliddin — I build practical AI and machine-learning projects.": {
    uz: "Salom, men Jaloliddinman — Men sun'iy intellekt va mashinali o'rgatish bo'yicha amaliy loyihalar yarataman.",
    en: "Hi, I’m Jaloliddin — I build practical AI and machine-learning projects.",
    ru: "Привет, я Джалолиддин — я создаю практические проекты в области ИИ и машинного обучения."
  },
  "Hi, I'm Jaloliddin — I build practical AI and machine-learning projects.": {
    uz: "Salom, men Jaloliddinman — Men sun'iy intellekt va mashinali o'rgatish bo'yicha amaliy loyihalar yarataman.",
    en: "Hi, I'm Jaloliddin — I build practical AI and machine-learning projects.",
    ru: "Привет, я Джалолиддин — я создаю практические проекты в области ИИ и машинного обучения."
  },
  "Jaloliddin Xalimov Data Science — Machine Learning student at School 21": {
    uz: "Jaloliddin Xalimov — School 21 da Data Science va Machine Learning talabasi",
    en: "Jaloliddin Xalimov Data Science — Machine Learning student at School 21",
    ru: "Джалолиддин Халимов — Студент Data Science и машинного обучения в Школе 21"
  },
  "26 ML/Data Science projects completed at School 21 and stored in a private GitLab repository.": {
    uz: "School 21 da bajarilgan va shaxsiy GitLab repozitoriysida saqlangan 26 ta ML/Data Science loyihasi.",
    en: "26 ML/Data Science projects completed at School 21 and stored in a private GitLab repository.",
    ru: "26 проектов по ML/Data Science, выполненных в Школе 21 и сохраненных в приватном репозитории GitLab."
  },
  "1+ year of hands-on ML learning": {
    uz: "1+ yillik amaliy ML ta'limi",
    en: "1+ year of hands-on ML learning",
    ru: "1+ год практического обучения ML"
  },
  "Python • PyTorch • scikit-learn": {
    uz: "Python • PyTorch • scikit-learn",
    en: "Python • PyTorch • scikit-learn",
    ru: "Python • PyTorch • scikit-learn"
  },
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
  "Men Sun'iy Intellekt, Machine Learning va Python backend yo'nalishida faoliyat yurituvchi dasturchiman.": {
    uz: "Men Sun'iy Intellekt, Machine Learning va Python backend yo'nalishida faoliyat yurituvchi dasturchiman.",
    en: "I am a software developer specializing in Artificial Intelligence, Machine Learning, and Python backend.",
    ru: "Я разработчик, специализирующийся на искусственном интеллекте, машинном обучении и бэкенде на Python."
  },
  "School 21 o'quv maskanida Data Science va Machine Learning yo'nalishida o'qiyman.": {
    uz: "School 21 o'quv maskanida Data Science va Machine Learning yo'nalishida o'qiyman.",
    en: "I study Data Science and Machine Learning at School 21.",
    ru: "Я изучаю Data Science и машинное обучение в Школе 21."
  },
  "Masshtablanuvchi veb-ilovalar, neyron tarmoqlari hamda aqlli raqamli tizimlar yaratish bo'yicha tajribaga egaman.": {
    uz: "Masshtablanuvchi veb-ilovalar, neyron tarmoqlari hamda aqlli raqamli tizimlar yaratish bo'yicha tajribaga egaman.",
    en: "I have experience in creating scalable web applications, neural networks, and smart digital systems.",
    ru: "У меня есть опыт создания масштабируемых веб-приложений, нейронных сетей и интеллектуальных цифровых систем."
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
      // ignore
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
      // ignore
    }
  }
}

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

  if (COMMON_DICTIONARY[trimmed]?.[targetLang]) {
    return COMMON_DICTIONARY[trimmed][targetLang];
  }

  const lowerKey = Object.keys(COMMON_DICTIONARY).find(k => k.toLowerCase() === trimmed.toLowerCase());
  if (lowerKey && COMMON_DICTIONARY[lowerKey]?.[targetLang]) {
    return COMMON_DICTIONARY[lowerKey][targetLang];
  }

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

  if (COMMON_DICTIONARY[trimmed]?.[targetLang]) {
    return COMMON_DICTIONARY[trimmed][targetLang];
  }

  const lowerKey = Object.keys(COMMON_DICTIONARY).find(k => k.toLowerCase() === trimmed.toLowerCase());
  if (lowerKey && COMMON_DICTIONARY[lowerKey]?.[targetLang]) {
    return COMMON_DICTIONARY[lowerKey][targetLang];
  }

  const cached = getCachedTranslation(trimmed, targetLang);
  if (cached) return cached;

  translateTextAsync(trimmed, targetLang);

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