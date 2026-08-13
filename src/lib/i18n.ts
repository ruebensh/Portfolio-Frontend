export type Language = "uz" | "en" | "ru";

export const translations: Record<Language, Record<string, string>> = {
  uz: {
    // Navigation
    "nav.home": "Home",
    "nav.projects": "Projects",
    "nav.certificates": "Certificates",
    "nav.resume": "Resume",
    "nav.aiChat": "Rubensh AI",
    "nav.blog": "Blog",
    "nav.about": "About",
    "nav.askAi": "Ask AI",

    // Welcome Page
    "welcome.title": "Xush Kelibsiz & Welcome",
    "welcome.heading": "Jaloliddin Xalimov",
    "welcome.subheading": "AI/ML Student & Python Developer",
    "welcome.enter": "PORTFOLIOGA KIRISH",

    // Home Page Hero
    "home.badge": "Xush Kelibsiz & Welcome",
    "home.defaultTitle": "Men aqlli va masshtablanuvchi raqamli mahsulotlar yarataman",
    "home.defaultDesc": "Zamonaviy veb-texnologiyalar va Sun'iy Intellekt bo'yicha mutaxassis.",
    "home.viewProjects": "Loyihalarni ko'rish",
    "home.downloadCv": "CV Yuklab Olish",
    "home.getInTouch": "Bog'lanish",

    // Profile Card
    "profile.projects": "Loyihalar",
    "profile.experience": "Tajriba",
    "profile.mainStack": "Asosiy Stack",
    "profile.defaultTitle": "Jaloliddin Xalimov",
    "profile.defaultDesc": "Data Science — School 21 da Machine Learning talabasi",

    // Ask Ruebensh AI component
    "ai.title": "Ruebensh AI dan so'rang",
    "ai.desc": "Men va mening loyihalarim yoki tajribam haqida shaxsiy AI yordamchimdan so'rang.",
    "ai.placeholder": "Masalan: Ruebensh niki nimani anglatadi?",
    "ai.submit": "So'rash",
    "ai.fullChat": "To'liq AI Chat",
    "ai.newChat": "Yangi suhbat",

    // Contact
    "contact.title": "Bog'lanish",
    "contact.subtitle": "Takliflar yoki hamkorlik uchun xabar qoldiring",
    "contact.name": "Ismingiz",
    "contact.email": "Email manzilingiz",
    "contact.message": "Xabaringiz",
    "contact.send": "Yuborish",

    // Projects Page
    "projects.explore": "ta loyihani o'rganing",
    "projects.title": "Barcha Loyihalar",
    "projects.subtitle": "Proyektlar bilan tanishib chiqishingiz mumkin",
    "projects.catAll": "Barchasi",
    "projects.viewDetails": "Tafsilotlar",
    "projects.open": "Ochish",
    "projects.empty": "Bu kategoriyada hozircha loyiha yo‘q.",
    "projects.emptySub": "Balki boshqa kategoriya tanlaymiz? 😄",
    "projects.loading": "Yuklanmoqda...",

    // Project Detail Page
    "projectDetail.back": "Loyihalarga qaytish",
    "projectDetail.viewLive": "Loyihani ko'rish",
    "projectDetail.github": "GitHub Repo",
    "projectDetail.category": "Turkum",
    "projectDetail.status": "Holat",
    "projectDetail.link": "Havola",
    "projectDetail.noDesc": "Ushbu loyiha haqida ma'lumot berilmagan.",
    "projectDetail.noLink": "Mavjud emas",

    // Certificates Page
    "certificates.verified": "Tasdiqlangan yutuqlar",
    "certificates.title": "Sertifikatlar",
    "certificates.subtitle": "Mening o'qib-o'rganishlarim, kurslar va professional faoliyatim davomida qo'lga kiritgan maxsus yutuqlarim to'plami.",
    "certificates.fullPreview": "To'liq ko'rish",
    "certificates.openDoc": "Hujjatni ochish",
    "certificates.empty": "Hozircha sertifikatlar yuklanmagan.",
    "certificates.emptySub": "Tez orada yangi yutuqlar shu yerda paydo bo'ladi! ✨",

    // Resume Page
    "resume.back": "Asosiyga qaytish",
    "resume.title": "Professional hujjatlar",
    "resume.subtitle": "Resume & Portfolio",
    "resume.download": "PDF Yuklab olish",
    "resume.cvMode": "Rezyume (CV)",
    "resume.portfolioMode": "Portfolio taqdimoti",

    // About Page
    "about.title": "Men haqimda",
    "about.subtitle": "Keling, yaqindan tanishaylik",
    "about.skills": "Ko'nikmalar va Texnologiyalar",
    "about.exp": "Tajriba va Faoliyat",

    // Footer
    "footer.rights": "Barcha huquqlar himoyalangan.",
    "footer.builtWith": "Bilan yaratilgan",

    // Common
    "common.loading": "Yuklanmoqda...",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.projects": "Projects",
    "nav.certificates": "Certificates",
    "nav.resume": "Resume",
    "nav.aiChat": "Rubensh AI",
    "nav.blog": "Blog",
    "nav.about": "About",
    "nav.askAi": "Ask AI",

    // Welcome Page
    "welcome.title": "Welcome & Salutation",
    "welcome.heading": "Jaloliddin Khalimov",
    "welcome.subheading": "AI/ML Student & Python Developer",
    "welcome.enter": "ENTER PORTFOLIO",

    // Home Page Hero
    "home.badge": "Welcome & Salutation",
    "home.defaultTitle": "I build smart, scalable digital products",
    "home.defaultDesc": "Full-stack software engineer specializing in modern web technologies and AI.",
    "home.viewProjects": "View Projects",
    "home.downloadCv": "Download CV",
    "home.getInTouch": "Get in Touch",

    // Profile Card
    "profile.projects": "Projects",
    "profile.experience": "Experience",
    "profile.mainStack": "Main Stack",
    "profile.defaultTitle": "Jaloliddin Khalimov",
    "profile.defaultDesc": "Data Science & Machine Learning student at School 21",

    // Ask Ruebensh AI component
    "ai.title": "Ask Ruebensh AI",
    "ai.desc": "Ask my AI assistant about me, my experience, or my projects.",
    "ai.placeholder": "Example: What does the name Ruebensh mean?",
    "ai.submit": "Ask AI",
    "ai.fullChat": "Full AI Chat",
    "ai.newChat": "New Chat",

    // Contact
    "contact.title": "Get in Touch",
    "contact.subtitle": "Leave a message for inquiries or collaboration",
    "contact.name": "Your Name",
    "contact.email": "Your Email",
    "contact.message": "Your Message",
    "contact.send": "Send Message",

    // Projects Page
    "projects.explore": "projects to explore",
    "projects.title": "All Projects",
    "projects.subtitle": "Explore my latest projects and engineering work",
    "projects.catAll": "All",
    "projects.viewDetails": "View Details",
    "projects.open": "Open",
    "projects.empty": "No projects found in this category.",
    "projects.emptySub": "Try selecting another category 😄",
    "projects.loading": "Loading...",

    // Project Detail Page
    "projectDetail.back": "Back to Projects",
    "projectDetail.viewLive": "Live Demo",
    "projectDetail.github": "GitHub Repo",
    "projectDetail.category": "Category",
    "projectDetail.status": "Status",
    "projectDetail.link": "Link",
    "projectDetail.noDesc": "No description available for this project.",
    "projectDetail.noLink": "Not available",

    // Certificates Page
    "certificates.verified": "Verified Achievements",
    "certificates.title": "Certificates",
    "certificates.subtitle": "A curated collection of my verified certificates, course completions, and achievements.",
    "certificates.fullPreview": "Full Preview",
    "certificates.openDoc": "Open Document",
    "certificates.empty": "No certificates uploaded yet.",
    "certificates.emptySub": "New achievements will appear here soon! ✨",

    // Resume Page
    "resume.back": "Back to Home",
    "resume.title": "Professional Documents",
    "resume.subtitle": "Resume & Portfolio",
    "resume.download": "Download PDF",
    "resume.cvMode": "Resume (CV)",
    "resume.portfolioMode": "Portfolio Deck",

    // About Page
    "about.title": "About Me",
    "about.subtitle": "Get to know me better",
    "about.skills": "Skills & Technologies",
    "about.exp": "Experience & Career",

    // Footer
    "footer.rights": "All rights reserved.",
    "footer.builtWith": "Built with",

    // Common
    "common.loading": "Loading...",
  },
  ru: {
    // Navigation
    "nav.home": "Главная",
    "nav.projects": "Проекты",
    "nav.certificates": "Сертификаты",
    "nav.resume": "Резюме",
    "nav.aiChat": "Rubensh AI",
    "nav.blog": "Блог",
    "nav.about": "Обо мне",
    "nav.askAi": "Спросить AI",

    // Welcome Page
    "welcome.title": "Добро пожаловать",
    "welcome.heading": "Джалолиддин Халимов",
    "welcome.subheading": "Студент AI/ML & Python Разработчик",
    "welcome.enter": "ВОЙТИ В ПОРТФОЛИО",

    // Home Page Hero
    "home.badge": "Добро пожаловать",
    "home.defaultTitle": "Я создаю умные и масштабируемые цифровые продукты",
    "home.defaultDesc": "Full-stack разработчик, специализирующийся на современных веб-технологиях и ИИ.",
    "home.viewProjects": "Посмотреть проекты",
    "home.downloadCv": "Скачать CV",
    "home.getInTouch": "Связаться",

    // Profile Card
    "profile.projects": "Проекты",
    "profile.experience": "Опыт",
    "profile.mainStack": "Основной стек",
    "profile.defaultTitle": "Джалолиддин Халимов",
    "profile.defaultDesc": "Студент Data Science и Machine Learning в Школе 21",

    // Ask Ruebensh AI component
    "ai.title": "Спросите Ruebensh AI",
    "ai.desc": "Задайте вопрос моему AI-ассистенту обо мне, моих проектах и опыте.",
    "ai.placeholder": "Например: Что означает никнейм Ruebensh?",
    "ai.submit": "Спросить",
    "ai.fullChat": "Полный AI Чат",
    "ai.newChat": "Новый чат",

    // Contact
    "contact.title": "Связаться",
    "contact.subtitle": "Оставьте сообщение для сотрудничества или предложений",
    "contact.name": "Ваше имя",
    "contact.email": "Ваш Email",
    "contact.message": "Ваше сообщение",
    "contact.send": "Отправить",

    // Projects Page
    "projects.explore": "проектов для просмотра",
    "projects.title": "Все Проекты",
    "projects.subtitle": "Ознакомьтесь с моими проектами и разработками",
    "projects.catAll": "Все",
    "projects.viewDetails": "Подробнее",
    "projects.open": "Открыть",
    "projects.empty": "В этой категории пока нет проектов.",
    "projects.emptySub": "Попробуйте выбрать другую категорию 😄",
    "projects.loading": "Загрузка...",

    // Project Detail Page
    "projectDetail.back": "К проектам",
    "projectDetail.viewLive": "Посмотреть проект",
    "projectDetail.github": "GitHub Репозиторий",
    "projectDetail.category": "Категория",
    "projectDetail.status": "Статус",
    "projectDetail.link": "Ссылка",
    "projectDetail.noDesc": "Описание для этого проекта пока не добавлено.",
    "projectDetail.noLink": "Недоступно",

    // Certificates Page
    "certificates.verified": "Подтвержденные достижения",
    "certificates.title": "Сертификаты",
    "certificates.subtitle": "Коллекция моих подтвержденных сертификатов, курсов и профессиональных достижений.",
    "certificates.fullPreview": "Просмотреть",
    "certificates.openDoc": "Открыть документ",
    "certificates.empty": "Сертификаты пока не загружены.",
    "certificates.emptySub": "Скоро здесь появятся новые достижения! ✨",

    // Resume Page
    "resume.back": "На главную",
    "resume.title": "Профессиональные документы",
    "resume.subtitle": "Резюме & Портфолио",
    "resume.download": "Скачать PDF",
    "resume.cvMode": "Резюме (CV)",
    "resume.portfolioMode": "Презентация портфолио",

    // About Page
    "about.title": "Обо мне",
    "about.subtitle": "Давайте познакомимся поближе",
    "about.skills": "Навыки и Технологии",
    "about.exp": "Опыт и Карьера",

    // Footer
    "footer.rights": "Все права защищены.",
    "footer.builtWith": "Создано с помощью",

    // Common
    "common.loading": "Загрузка...",
  },
};
