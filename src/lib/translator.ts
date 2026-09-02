import { useState, useEffect } from "react";
import { Language } from "./i18n";

const KNOWN_PROPER_NOUNS = [
  "jaloliddin xalimov",
  "jaloliddin",
  "ruebensh",
  "school 21",
  "mizan",
  "mizan ai",
  "scraper bot",
  "bunker game",
  "workshop console",
  "revolutionary-layers-method",
  "portfolio sayt",
  "devini",
  "devini.io",
  "devini ai platform",
  "coursera",
  "deeplearning.ai",
  "gitlab",
  "github",
  "python",
  "pytorch",
  "tensorflow",
  "fastapi",
  "django",
  "next.js",
  "react",
  "docker",
  "kubernetes"
];

const COMMON_DICTIONARY: Record<string, Record<Language, string>> = {
  // Proper Nouns — Preserve across all languages
  "Jaloliddin Xalimov": { uz: "Jaloliddin Xalimov", en: "Jaloliddin Xalimov", ru: "Jaloliddin Xalimov" },
  "School 21": { uz: "School 21", en: "School 21", ru: "School 21" },
  "Mizan": { uz: "Mizan", en: "Mizan", ru: "Mizan" },
  "Mizan AI": { uz: "Mizan AI", en: "Mizan AI", ru: "Mizan AI" },
  "Scraper Bot": { uz: "Scraper Bot", en: "Scraper Bot", ru: "Scraper Bot" },
  "Bunker Game": { uz: "Bunker Game", en: "Bunker Game", ru: "Bunker Game" },
  "Workshop Console": { uz: "Workshop Console", en: "Workshop Console", ru: "Workshop Console" },
  "Revolutionary-Layers-Method": { uz: "Revolutionary-Layers-Method", en: "Revolutionary-Layers-Method", ru: "Revolutionary-Layers-Method" },
  "Portfolio sayt": { uz: "Portfolio sayt", en: "Portfolio sayt", ru: "Portfolio sayt" },
  "Devini AI Platform": { uz: "Devini AI Platform", en: "Devini AI Platform", ru: "Devini AI Platform" },
  "Coursera": { uz: "Coursera", en: "Coursera", ru: "Coursera" },
  "DeepLearning.AI": { uz: "DeepLearning.AI", en: "DeepLearning.AI", ru: "DeepLearning.AI" },

  // Navigation & General
  "Asosiy": { uz: "Asosiy", en: "Home", ru: "Главная" },
  "Loyihalar": { uz: "Loyihalar", en: "Projects", ru: "Проекты" },
  "Sertifikatlar": { uz: "Sertifikatlar", en: "Certificates", ru: "Сертификаты" },
  "Resume": { uz: "Resume", en: "Resume", ru: "Резюме" },
  "AI Chat": { uz: "AI Chat", en: "AI Chat", ru: "ИИ Чат" },
  "Blog": { uz: "Blog", en: "Blog", ru: "Блог" },
  "Men Haqimda": { uz: "Men Haqimda", en: "About Me", ru: "Обо мне" },
  "Admin Panel": { uz: "Admin Panel", en: "Admin Panel", ru: "Админ Панель" },

  // Statuses & Categories
  "Live": { uz: "Faol", en: "Live", ru: "В эфире" },
  "In Progress": { uz: "Jarayonda", en: "In Progress", ru: "В процессе" },
  "Completed": { uz: "Yakunlangan", en: "Completed", ru: "Завершен" },
  "General": { uz: "Umumiy", en: "General", ru: "Общий" },
  "Web Development": { uz: "Veb Dasturlash", en: "Web Development", ru: "Веб-Разработка" },
  "AI & ML": { uz: "Sun'iy Intellekt va Machine Learning", en: "AI & ML", ru: "ИИ и Машинное Обучение" },
  "Data Science": { uz: "Ma'lumotlar Ilmi", en: "Data Science", ru: "Наука о Данных" },
  "Backend": { uz: "Backend", en: "Backend", ru: "Бэкенд" },
  "Tools & Deployment": { uz: "Asboblar va Joylashtirish", en: "Tools & Deployment", ru: "Инструменты и Деплой" },
  "Frontend": { uz: "Frontend", en: "Frontend", ru: "Фронтенд" },
  "Machine Learning / AI": { uz: "Machinali o'qitish / AI", en: "Machine Learning / AI", ru: "Машинное обучение / ИИ" },

  // Home Tunnel & Sections
  "LOYIHALAR ARXIVI": { uz: "LOYIHALAR ARXIVI", en: "PROJECT ARCHIVE", ru: "АРХИВ ПРОЕКТОВ" },
  "Men Yaratgan Loyihalar": { uz: "Men Yaratgan Loyihalar", en: "Projects I Built", ru: "Проекты, Которые Я Создал" },
  "SCROLL QILIB KASHF ETING": { uz: "SCROLL QILIB KASHF ETING", en: "SCROLL TO DISCOVER", ru: "ПРОКРУТИТЕ ДЛЯ ИЗУЧЕНИЯ" },
  "BARCHA LOYIHALARNI KO'RISH →": { uz: "BARCHA LOYIHALARNI KO'RISH →", en: "VIEW ALL PROJECTS →", ru: "СМОТРЕТЬ ВСЕ ПРОЕКТЫ →" },
  "Barcha loyihalarni ko'rish →": { uz: "Barcha loyihalarni ko'rish →", en: "View All Projects →", ru: "Посмотреть все проекты →" },
  "KO'RISH ↗": { uz: "KO'RISH ↗", en: "VIEW ↗", ru: "СМОТРЕТЬ ↗" },
  "BATAFSIL KO'RISH →": { uz: "BATAFSIL KO'RISH →", en: "VIEW DETAILS →", ru: "ПОДРОБНЕЕ →" },

  // Skills & Bento
  "TEXNIK ARSENALIM": { uz: "TEXNIK ARSENALIM", en: "TECHNICAL ARSENAL", ru: "ТЕХНИЧЕСКИЙ АРСЕНАЛ" },
  "Ko'nikmalar va Texnologiyalar": { uz: "Ko'nikmalar va Texnologiyalar", en: "Skills & Technologies", ru: "Навыки и Технологии" },
  "Ko'nikmalarim va texnologiyalar bo'yicha bilim va darajalarim": { uz: "Ko'nikmalarim va texnologiyalar bo'yicha bilim va darajalarim", en: "My knowledge and levels in skills and technologies", ru: "Мои знания и уровни в навыках и технологиях" },
  "Xizmatlar & Ko'nikmalar": { uz: "Xizmatlar & Ko'nikmalar", en: "Services & Skills", ru: "Услуги и Навыки" },
  "Murakkab muammolarga": { uz: "Murakkab muammolarga", en: "Modern solutions to", ru: "Современные решения" },
  "zamonaviy yechimlar": { uz: "zamonaviy yechimlar", en: "complex problems", ru: "для сложных задач" },
  "Ko'proq": { uz: "Ko'proq", en: "More", ru: "Подробнее" },

  // About & Values
  "Tarixim & Faoliyatim": { uz: "Tarixim & Faoliyatim", en: "My Story & Activity", ru: "Моя История и Деятельность" },
  "Ta'lim": { uz: "Ta'lim", en: "Education", ru: "Образование" },
  "Ta'lim & Faoliyatim": { uz: "Ta'lim & Faoliyatim", en: "Education & Activity", ru: "Образование и Деятельность" },
  "Qadriyatlar & Tamoyillar": { uz: "Qadriyatlar & Tamoyillar", en: "Values & Principles", ru: "Ценности и Принципы" },
  "Doimiy o'rganish va amaliyot orqali yangi texnologiyalarni egallash": { uz: "Doimiy o'rganish va amaliyot orqali yangi texnologiyalarni egallash", en: "Mastering new technologies through continuous learning and practice", ru: "Освоение новых технологий через непрерывное обучение и практику" },
  "Toza, o'qilishi oson va masshtablanuvchi kod yozish madaniyati": { uz: "Toza, o'qilishi oson va masshtablanuvchi kod yozish madaniyati", en: "Culture of writing clean, readable, and scalable code", ru: "Культура написания чистого, читаемого и масштабируемого кода" },
  "Muammolarga innovatsion va AI yechimlar topish": { uz: "Muammolarga innovatsion va AI yechimlar topish", en: "Finding innovative and AI solutions to complex problems", ru: "Поиск инновационных и ИИ-решений для сложных проблем" },

  // Projects & Certificates Pages
  "Barcha Loyihalar": { uz: "Barcha Loyihalar", en: "All Projects", ru: "Все Проекты" },
  "Men yaratgan eng so'nggi va asosiy loyihalar ro'yxati bilan tanishing.": { uz: "Men yaratgan eng so'nggi va asosiy loyihalar ro'yxati bilan tanishing.", en: "Explore the list of the latest and key projects I built.", ru: "Ознакомьтесь со списком последних и основных проектов, созданных мной." },
  "Sertifikatlar va Yutuqlar": { uz: "Sertifikatlar va Yutuqlar", en: "Certificates and Achievements", ru: "Сертификаты и Достижения" },
  "Rasmiy sertifikatlar hamda ishtirok etilgan xalqaro ideaton va tadbirlar ro'yxati.": { uz: "Rasmiy sertifikatlar hamda ishtirok etilgan xalqaro ideaton va tadbirlar ro'yxati.", en: "Official certificates and list of international ideathons and events attended.", ru: "Официальные сертификаты и список международных идеатонов и мероприятий." },

  // Experience & Contact
  "Professional Tajriba": { uz: "Professional Tajriba", en: "Professional Experience", ru: "Профессиональный Опыт" },
  "Bosqichlar va Erishilgan Natijalar": { uz: "Bosqichlar va Erishilgan Natijalar", en: "Milestones and Achieved Results", ru: "Этапы и Достигнутые Результаты" },
  "Takliflar yoki hamkorlik uchun xabar qoldiring": { uz: "Takliflar yoki hamkorlik uchun xabar qoldiring", en: "Leave a message for proposals or collaboration", ru: "Оставьте сообщение для предложений или сотрудничества" },
  "Bog'lanish": { uz: "Bog'lanish", en: "Contact Me", ru: "Связаться" },
  "Ismingiz": { uz: "Ismingiz", en: "Your Name", ru: "Ваше Имя" },
  "Email manzilingiz": { uz: "Email manzilingiz", en: "Your Email", ru: "Ваш Email" },
  "Xabaringiz": { uz: "Xabaringiz", en: "Your Message", ru: "Ваше Сообщение" },
  "Xabaringiz...": { uz: "Xabaringiz...", en: "Your message...", ru: "Ваше сообщение..." },
  "Yuborish": { uz: "Yuborish", en: "Send", ru: "Отправить" },
  "Aloqa": { uz: "Aloqa", en: "Contact", ru: "Контакт" },
  "Aloqa manbalari": { uz: "Aloqa manbalari", en: "Contact Links", ru: "Контакты" },
  "Xabar qoldirish": { uz: "Xabar qoldirish", en: "Leave a Message", ru: "Написать сообщение" },
  "Tez orada →": { uz: "Tez orada →", en: "Coming Soon →", ru: "Скоро →" },
  "Telefon": { uz: "Telefon", en: "Phone", ru: "Телефон" },
  "Ruebensh AI dan so'rang": { uz: "Ruebensh AI dan so'rang", en: "Ask Ruebensh AI", ru: "Спросить Ruebensh AI" },
  "Savol bering — Ruebensh AI javob beradi...": { uz: "Savol bering — Ruebensh AI javob beradi...", en: "Ask a question — Ruebensh AI will answer...", ru: "Задайте вопрос — Ruebensh AI ответит..." },
  "Savolingiz...": { uz: "Savolingiz...", en: "Your question...", ru: "Ваш вопрос..." },
  "Tajriba va loyihalar haqida tezkor savol": { uz: "Tajriba va loyihalar haqida tezkor savol", en: "Quick question about experience & projects", ru: "Быстрый вопрос об опыте и проектах" },
  "Forma orqali to'g'ridan-to'g'ri yetib boradi": { uz: "Forma orqali to'g'ridan-to'g'ri yetib boradi", en: "Delivered directly through the form", ru: "Доставляется напрямую через форму" },
  "Xabar yuborildi!": { uz: "Xabar yuborildi!", en: "Message sent!", ru: "Сообщение отправлено!" },
  "Tez orada bog'lanaman.": { uz: "Tez orada bog'lanaman.", en: "I'll reach out soon.", ru: "Свяжусь с вами скоро." },
  "Yangi xabar →": { uz: "Yangi xabar →", en: "New message →", ru: "Новое сообщение →" },
  "Ruebensh": { uz: "Ruebensh", en: "Ruebensh", ru: "Ruebensh" },
  "Ish Tajribam": { uz: "Ish Tajribam", en: "My Work Experience", ru: "Мой Опыт Работы" },
  "Tajriba va Amaliyot": { uz: "Tajriba va Amaliyot", en: "Experience & Practice", ru: "Опыт и Практика" },
  "Vazifalar & Yutuqlar": { uz: "Vazifalar & Yutuqlar", en: "Tasks & Achievements", ru: "Задачи и Достижения" },
  "Loyiha, hamkorlik yoki savol bo'yicha — eng qulay ijtimoiy tarmoqlar orqali muloqot qiling.": { uz: "Loyiha, hamkorlik yoki savol bo'yicha — eng qulay ijtimoiy tarmoqlar orqali muloqot qiling.", en: "For projects, partnerships or questions — reach out through the most convenient social networks.", ru: "По проектам, партнерству или вопросам — свяжитесь через удобные социальные сети." },
  "Hozir O'rganayotganlar": { uz: "Hozir O'rganayotganlar", en: "Currently Learning", ru: "Сейчас Изучаю" },
  "Hozir Ishlayotganlar": { uz: "Hozir Ishlayotganlar", en: "Currently Working On", ru: "Сейчас Работаю Над" },

  // Ai Chat
  "Assalomu alaykum! Men Jaloliddinning raqamli yordamchisiman. Uning tajribasi, loyihalari yoki ko'nikmalari haqida so'rasangiz javob beraman.": { uz: "Assalomu alaykum! Men Jaloliddinning raqamli yordamchisiman. Uning tajribasi, loyihalari yoki ko'nikmalari haqida so'rasangiz javob beraman.", en: "Hello! I'm Jaloliddin's digital assistant. I can answer questions about his experience, projects, or skills.", ru: "Здравствуйте! Я цифровой помощник Джалолиддина. Я могу ответить на вопросы о его опыте, проектах или навыках." },
  "Yangi suhbat": { uz: "Yangi suhbat", en: "New chat", ru: "Новый чат" },
  "Suhbatlar": { uz: "Suhbatlar", en: "Chats", ru: "Чаты" },
};

const MEMORY_CACHE = new Map<string, string>();
const listeners = new Set<() => void>();
const MAX_TRANSLATE_QUERY_LENGTH = 500;

function shouldSkipTranslation(text: string): boolean {
  return text.trim().length > MAX_TRANSLATE_QUERY_LENGTH;
}

function notifyListeners() {
  listeners.forEach(fn => fn());
}

/** Subscribe to async translation completions. Returns an unsubscribe function. */
export function addTranslationListener(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

function isProperNoun(text: string): boolean {
  if (!text || !text.trim()) return false;
  const trimmed = text.trim();
  // Paragraphs or sentences over 40 characters or 4 words are NOT proper nouns!
  if (trimmed.length > 40 || trimmed.split(/\s+/).length > 4) return false;
  const lower = trimmed.toLowerCase();
  return KNOWN_PROPER_NOUNS.some((p) => lower === p || lower === `${p}.`);
}

export async function translateTextAsync(text: string, targetLang: Language): Promise<string> {
  if (!text || !text.trim()) return text;
  const trimmed = text.trim();

  if (isProperNoun(trimmed)) return text; // Never translate proper nouns
  if (shouldSkipTranslation(trimmed)) return text;

  // Dictionary hit — instant return
  if (COMMON_DICTIONARY[trimmed]?.[targetLang]) {
    return COMMON_DICTIONARY[trimmed][targetLang];
  }
  const lowerKey = Object.keys(COMMON_DICTIONARY).find(k => k.toLowerCase() === trimmed.toLowerCase());
  if (lowerKey && COMMON_DICTIONARY[lowerKey]?.[targetLang]) {
    return COMMON_DICTIONARY[lowerKey][targetLang];
  }

  const key = `tr_v3_${targetLang}_${trimmed}`;
  if (MEMORY_CACHE.has(key)) return MEMORY_CACHE.get(key)!;

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        MEMORY_CACHE.set(key, saved);
        return saved;
      }
    } catch {}
  }

  try {
    // Call internal proxy route /api/translate to eliminate CORS errors!
    const url = `/api/translate?targetLang=${targetLang}&text=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    if (data && data.translatedText) {
      const translated = data.translatedText;
      MEMORY_CACHE.set(key, translated);
      if (typeof window !== "undefined") {
        try { localStorage.setItem(key, translated); } catch {}
      }
      notifyListeners();
      return translated;
    }
  } catch (err) {
    console.error("Translation fetch error:", err);
  }

  return text;
}

export function translateDynamicText(text: string | null | undefined, targetLang: Language): string {
  if (!text || !text.trim()) return "";
  const trimmed = text.trim();

  if (isProperNoun(trimmed)) return text; // Protect proper nouns
  if (shouldSkipTranslation(trimmed)) return text;

  // Dictionary hit — instant return
  if (COMMON_DICTIONARY[trimmed]?.[targetLang]) {
    return COMMON_DICTIONARY[trimmed][targetLang];
  }
  const lowerKey = Object.keys(COMMON_DICTIONARY).find(k => k.toLowerCase() === trimmed.toLowerCase());
  if (lowerKey && COMMON_DICTIONARY[lowerKey]?.[targetLang]) {
    return COMMON_DICTIONARY[lowerKey][targetLang];
  }

  const key = `tr_v3_${targetLang}_${trimmed}`;
  if (MEMORY_CACHE.has(key)) return MEMORY_CACHE.get(key)!;

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return saved;
    } catch {}
  }

  translateTextAsync(trimmed, targetLang);
  return text;
}

export function useTranslatedText(text: string | null | undefined, targetLang: Language): string {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  if (!text) return "";
  return translateDynamicText(text, targetLang);
}
