import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Award,
  Heart,
  Code,
  BookOpen,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { usePerformance } from "../context/PerformanceContext";
import { SubtleVideoBackground } from "../components/SubtleVideoBackground";
import { SecondaryStarField } from "../components/SecondaryStarField";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function SoftAboutBackground() {
  const { tier } = usePerformance();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <SubtleVideoBackground index={0} />
      <SecondaryStarField />
      <style>{`
        .ab-aurora {
          opacity: ${tier === "low" ? "0.1" : tier === "medium" ? "0.18" : "0.22"};
          filter: blur(100px);
          background:
            radial-gradient(45% 45% at 12% 20%, rgba(99,102,241,.18), transparent 60%),
            radial-gradient(45% 45% at 88% 24%, rgba(168,85,247,.12), transparent 60%),
            radial-gradient(65% 65% at 50% 88%, rgba(56,189,248,.09), transparent 65%);
          animation: abAurora 18s ease-in-out infinite alternate;
          transform: translateZ(0);
        }
        @keyframes abAurora {
          0%   { transform: translate3d(-2%, -1%, 0) scale(1); }
          100% { transform: translate3d( 2%,  1%, 0) scale(1.06); }
        }

        .ab-noise {
          opacity: .06;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
        }

        .ab-vignette {
          background:
            radial-gradient(70% 60% at 50% 20%, rgba(255,255,255,.03), transparent 60%),
            radial-gradient(95% 95% at 50% 50%, transparent, rgba(0,0,0,.74));
        }

        .ab-glass {
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%);
          border: 1px solid rgba(255,255,255,0.18);
          backdrop-filter: blur(24px) saturate(1.5);
          -webkit-backdrop-filter: blur(24px) saturate(1.5);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.18),
            inset 0 -1px 0 rgba(0,0,0,0.1),
            0 25px 60px rgba(0,0,0,0.45),
            0 0 0 1px rgba(255,255,255,0.04);
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .ab-glass:hover {
          border-color: rgba(255,255,255,0.26);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.25),
            inset 0 -1px 0 rgba(0,0,0,0.1),
            0 30px 70px rgba(0,0,0,0.5),
            0 0 0 1px rgba(255,255,255,0.06);
        }

        .ab-title {
          background: linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,.65), rgba(255,255,255,1));
          background-size: 220% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: abTitleSheen 4.2s ease-in-out infinite;
        }
        @keyframes abTitleSheen {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .ab-chip {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        @media (prefers-reduced-motion: reduce) {
          .ab-aurora, .ab-title { animation: none; }
        }
      `}</style>

      <div className="absolute inset-0 ab-aurora" />
      <div className="absolute inset-0 ab-noise" />
      <div className="absolute inset-0 ab-vignette" />
    </div>
  );
}

const sectionWrap = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};

const sectionItem = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

const getItemText = (item: any) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item === "object") return item.text || item.name || item.title || item.degree || "";
  return String(item);
};

const DEFAULT_FALLBACK_STORY = `Men Sun'iy Intellekt, Machine Learning va Python backend yo'nalishida faoliyat yurituvchi dasturchiman.
School 21 o'quv maskanida Data Science va Machine Learning yo'nalishida o'qiyman.
Masshtablanuvchi veb-ilovalar, neyron tarmoqlari hamda aqlli raqamli tizimlar yaratish bo'yicha tajribaga egaman.`;

const DEFAULT_EDUCATION = [
  { degree: "Data Science & Machine Learning", institution: "School 21", year: "2023 - Hozir" },
  { degree: "Software Engineering & Python Development", institution: "Self-Taught & Specialized Courses", year: "2021 - 2023" }
];

const DEFAULT_CERTIFICATES = [
  { name: "Machine Learning Specialization", issuer: "Coursera / Stanford Online", year: "2023" },
  { name: "Full-Stack Web Development with Python & React", issuer: "Professional Certification", year: "2023" }
];

const DEFAULT_VALUES = [
  "Doimiy o'rganish va amaliyot orqali yangi texnologiyalarni egallash",
  "Toza, o'qilishi oson va masshtablanuvchi kod yozish madaniyati",
  "Muammolarga innovatsion va sun'iy intellektga asoslangan yechimlar topish"
];

const DEFAULT_LEARNING = [
  "Deep Learning & PyTorch Architecture",
  "Large Language Models (LLM) & RAG Systems",
  "High-Performance Async Backend Systems"
];

const DEFAULT_WORKING = [
  "AI Portfolio & Interactive Web Platform",
  "Custom Machine Learning Pipeline & Data Analytics Tools",
  "Rubensh AI Assistant Integration"
];

function safeArray(v: any) {
  return Array.isArray(v) ? v : [];
}

export function AboutPage() {
  const { td } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/about`).then((res) => res.ok ? res.json() : null).catch(() => null),
      fetch(`${API_URL}/settings`).then((res) => res.ok ? res.json() : null).catch(() => null),
    ])
      .then(([aboutData, settingsData]) => {
        setData(aboutData);
        setSettings(settingsData);
      })
      .catch((err) => console.error("Xatolik:", err))
      .finally(() => setLoading(false));
  }, []);

  const getAvatarUrl = () => {
    if (!settings?.avatarUrl) return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800";
    if (settings.avatarUrl.startsWith("http")) return settings.avatarUrl;
    return `${API_URL}${settings.avatarUrl}`;
  };

  const content = useMemo(() => {
    return {
      story: data?.story || DEFAULT_FALLBACK_STORY,
      education: (data?.education && safeArray(data.education).length > 0) ? data.education : DEFAULT_EDUCATION,
      certificates: (data?.certificates && safeArray(data.certificates).length > 0) ? data.certificates : DEFAULT_CERTIFICATES,
      values: (data?.values && safeArray(data.values).length > 0) ? data.values : DEFAULT_VALUES,
      currentlyLearning: (data?.currentlyLearning && safeArray(data.currentlyLearning).length > 0) ? data.currentlyLearning : DEFAULT_LEARNING,
      currentlyWorking: (data?.currentlyWorking && safeArray(data.currentlyWorking).length > 0) ? data.currentlyWorking : DEFAULT_WORKING,
    };
  }, [data]);

  const education = safeArray(content.education);
  const certificates = safeArray(content.certificates);
  const values = safeArray(content.values);
  const currentlyLearning = safeArray(content.currentlyLearning);
  const currentlyWorking = safeArray(content.currentlyWorking);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020202]">
        <SoftAboutBackground />
        <div className="ab-glass rounded-2xl px-8 py-6 flex items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={22} />
          <span className="text-sm text-muted-foreground">Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#020202] text-foreground relative">
      <SoftAboutBackground />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <div className="ab-glass rounded-3xl p-8 md:p-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full ab-chip mb-6">
              <Sparkles size={16} className="text-primary" />
              <span className="text-xs md:text-sm text-muted-foreground">
                {td("Men haqimda:")}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight mb-4 ab-title">
              {td("About Me")}
            </h1>

            <p className="text-muted-foreground text-lg max-w-3xl">
              {td("Tanishing bu men")}
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={sectionWrap}
          initial="hidden"
          animate="show"
          className="mb-12"
        >
          <motion.div variants={sectionItem} className="ab-glass rounded-3xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="relative shrink-0">
                <div className="absolute -inset-6 rounded-[28px] bg-gradient-to-br from-primary/25 via-purple-500/10 to-sky-400/10 blur-2xl opacity-80" />
                <motion.img
                  src={getAvatarUrl()}
                  alt={settings?.author || "Jaloliddin Xalimov"}
                  className="relative w-44 h-44 md:w-52 md:h-52 rounded-[28px] object-cover border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,.50)]"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>

              <div className="flex-1 w-full">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    {settings?.author ? td(settings.author) : "Jaloliddin Xalimov"}
                  </h2>
                  <p className="text-muted-foreground">
                    {td(settings?.subtitle || "AI/ML Student & Python Developer")}
                  </p>
                </div>

                <div className="mt-6">
                  {(content.story || "")
                    .split("\n\n")
                    .filter(Boolean)
                    .map((paragraph: string, idx: number) => (
                      <p
                        key={idx}
                        className="text-muted-foreground leading-relaxed mb-4 text-center md:text-left"
                      >
                        {td(paragraph)}
                      </p>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="space-y-8">
          <motion.section variants={sectionWrap} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-90px" }}>
            <motion.div variants={sectionItem} className="ab-glass rounded-3xl p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-white/10 flex items-center justify-center">
                  <GraduationCap className="text-primary" size={20} />
                </div>
                <h2 className="text-2xl font-bold">{td("Education")}</h2>
              </div>

              <div className="space-y-4">
                {education.length ? (
                  education.map((edu: any, index: number) => (
                    <motion.div
                      key={index}
                      variants={sectionItem}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/7 transition-colors p-6"
                    >
                      <h3 className="font-semibold mb-1">{td(getItemText(edu.degree || edu))}</h3>
                      <p className="text-muted-foreground text-sm">
                        {td(getItemText(edu.institution))} • {edu.year || "2023 - Hozir"}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">{td("Education ma’lumotlari yo‘q.")}</p>
                )}
              </div>
            </motion.div>
          </motion.section>

          <motion.section variants={sectionWrap} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-90px" }}>
            <motion.div variants={sectionItem} className="ab-glass rounded-3xl p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-white/10 flex items-center justify-center">
                  <Award className="text-primary" size={20} />
                </div>
                <h2 className="text-2xl font-bold">{td("Certificates")}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.length ? (
                  certificates.map((cert: any, index: number) => (
                    <motion.div
                      key={index}
                      variants={sectionItem}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/7 transition-colors p-6"
                    >
                      <h3 className="font-semibold mb-1">{td(getItemText(cert.name || cert))}</h3>
                      <p className="text-muted-foreground text-sm">
                        {td(getItemText(cert.issuer))} • {cert.year || "2023"}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic md:col-span-2">
                    {td("Certificates yo‘q.")}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.section>

          <motion.section variants={sectionWrap} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-90px" }}>
            <motion.div variants={sectionItem} className="ab-glass rounded-3xl p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-white/10 flex items-center justify-center">
                  <Heart className="text-primary" size={20} />
                </div>
                <h2 className="text-2xl font-bold">{td("Values & Principles")}</h2>
              </div>

              <div className="space-y-4">
                {values.length ? (
                  values.map((v: any, index: number) => (
                    <motion.div
                      key={index}
                      variants={sectionItem}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/7 transition-colors p-6 flex items-start gap-4"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0 shadow-[0_0_18px_rgba(99,102,241,.35)]" />
                      <p className="text-muted-foreground">{td(getItemText(v))}</p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">{td("Values yo‘q.")}</p>
                )}
              </div>
            </motion.div>
          </motion.section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.section variants={sectionWrap} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-90px" }}>
              <motion.div variants={sectionItem} className="ab-glass rounded-3xl p-8 md:p-10 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-white/10 flex items-center justify-center">
                    <BookOpen className="text-primary" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold">{td("Currently Learning")}</h2>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <ul className="space-y-3">
                    {currentlyLearning.length ? (
                      currentlyLearning.map((item: any, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground text-sm">{td(getItemText(item))}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground italic text-sm">
                        {td("Hozircha learning ro‘yxati yo‘q.")}
                      </li>
                    )}
                  </ul>
                </div>
              </motion.div>
            </motion.section>

            <motion.section variants={sectionWrap} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-90px" }}>
              <motion.div variants={sectionItem} className="ab-glass rounded-3xl p-8 md:p-10 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-white/10 flex items-center justify-center">
                    <Code className="text-primary" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold">{td("Currently Working On")}</h2>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <ul className="space-y-3">
                    {currentlyWorking.length ? (
                      currentlyWorking.map((item: any, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground text-sm">{td(getItemText(item))}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground italic text-sm">
                        {td("Hozircha working ro‘yxati yo‘q.")}
                      </li>
                    )}
                  </ul>
                </div>
              </motion.div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}