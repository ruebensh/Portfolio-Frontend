# Jaloliddin Xalimov — Portfolio Frontend

> **Live:** [xalimov.vercel.app](https://xalimov.vercel.app)

---

## 🇬🇧 English

### Tech Stack

- **React 18** + TypeScript
- **Vite** — build tool
- **Tailwind CSS** — styling
- **Framer Motion** — animations
- **Lucide React** — icons
- **React Router** — navigation
- **Vercel** — hosting & CI/CD

---

### Architecture

```
Portfolio-Frontend/
├── public/
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx          # Landing page
│   │   ├── BlogPage.tsx          # Telegram-powered blog
│   │   ├── ProjectsPage.tsx      # Portfolio projects
│   │   ├── ProjectDetailPage.tsx # Single project view
│   │   ├── CertificatesPage.tsx  # Certificates
│   │   ├── ResumePage.tsx        # CV / Resume
│   │   ├── AboutPage.tsx         # About me
│   │   ├── AIChatPage.tsx        # Rubensh AI chat
│   │   └── admin/                # Admin panel (protected)
│   ├── components/               # Reusable UI components
│   ├── services/                 # API service layer
│   ├── lib/                      # Utilities
│   ├── styles/                   # Global styles
│   ├── App.tsx                   # Routes
│   ├── main.tsx                  # Entry point
│   └── index.css
├── .env
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

### Pages & Features

| Page | Description |
|------|-------------|
| **Home** | Hero section, skills, experience, featured projects |
| **Blog** | Real-time Telegram channel feed, reactions, comments |
| **Projects** | Portfolio projects with detail pages |
| **Certificates** | Certificates showcase |
| **Resume** | Downloadable CV |
| **Rubensh AI** | AI chat powered by Groq/Cerebras |
| **About** | Personal info |
| **Admin** | Protected panel to manage all content |

**Blog system features:**
- Real-time polling every 5 seconds
- Supports: text, image, video, GIF, audio, voice, sticker
- Reactions (🔥 👍 ❤️ 🤯) with live counts
- Comments (web + Telegram discussion group)
- Auto-scroll to latest post
- Hide post: add `#hidden` tag in Telegram
- Delete post from site via `...` menu (password protected)
- Copy post link

---

### Installation & Setup

```bash
# Clone and install
git clone https://github.com/your-username/portfolio-frontend.git
cd portfolio-frontend
npm install

# Environment variables
cp .env.example .env
```

**`.env` variables:**
```env
VITE_API_URL=https://your-backend-domain.com
VITE_ADMIN_PASSWORD=your_admin_password
```

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

### Deployment (Vercel)

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables in **Settings → Environment Variables**
4. Vercel auto-deploys on every `git push`

---

## 🇺🇿 O'zbek

### Texnologiyalar

- **React 18** + TypeScript
- **Vite** — build vositasi
- **Tailwind CSS** — stillar
- **Framer Motion** — animatsiyalar
- **Lucide React** — ikonkalar
- **React Router** — navigatsiya
- **Vercel** — hosting va CI/CD

---

### Sahifalar va funksiyalar

| Sahifa | Tavsif |
|--------|--------|
| **Home** | Asosiy sahifa, ko'nikmalar, tajriba, loyihalar |
| **Blog** | Real-time Telegram kanal feed, reaksiyalar, izohlar |
| **Projects** | Portfolio loyihalari |
| **Certificates** | Sertifikatlar |
| **Resume** | CV yuklab olish |
| **Rubensh AI** | Groq/Cerebras AI chat |
| **About** | Men haqimda |
| **Admin** | Himoyalangan boshqaruv paneli |

**Blog tizimi xususiyatlari:**
- Har 5 sekundda yangi postlarni tekshirish
- Qo'llab-quvvatlaydi: matn, rasm, video, GIF, audio, ovoz, stiker
- Reaksiyalar (🔥 👍 ❤️ 🤯) jonli hisoblar bilan
- Izohlar (veb + Telegram muhokama guruhi)
- Yangi postga avtomatik scroll
- Postni yashirish: Telegramda `#hidden` qo'shing
- Saytdan o'chirish: `...` menyusi orqali (parol himoyasida)
- Post havolasini nusxalash

---

### O'rnatish

```bash
git clone https://github.com/your-username/portfolio-frontend.git
cd portfolio-frontend
npm install
```

**`.env` fayli:**
```env
VITE_API_URL=https://your-backend-domain.com
VITE_ADMIN_PASSWORD=your_admin_password
```

```bash
npm run dev      # ishlab chiqish rejimi
npm run build    # production build
```

---

### Vercel ga deploy qilish

1. GitHubga push qiling
2. [vercel.com](https://vercel.com) da loyihani import qiling
3. **Settings → Environment Variables** ga o'zgaruvchilarni qo'shing
4. Har `git push` da Vercel avtomatik deploy qiladi

---

## License

MIT © Jaloliddin Xalimov
