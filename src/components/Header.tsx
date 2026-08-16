import { Link, useRouter } from "../lib/router";
import { Menu, X, Sparkles, Bot, Rss, Globe, Zap, Gauge, ChevronDown, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MovingGradientButton from "./originkit/ui/moving-gradient-button";
import NeonBorder from "./originkit/ui/neon-border";
import { useLanguage } from "../context/LanguageContext";
import { usePerformance, QualityTier } from "../context/PerformanceContext";
import { Language } from "../lib/i18n";
import { translateDynamicText } from "../lib/translator";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface HeaderProps {
  data?: any;
}

export function Header({ data }: HeaderProps) {
  const { currentPath } = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { tier, setTier } = usePerformance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [graphicsMenuOpen, setGraphicsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const authorName = data?.author || "Jaloliddin";
  const avatarSrc = data?.avatarUrl ? `${API_URL}${data.avatarUrl}` : null;

  const selectTier = (selectedTier: QualityTier) => {
    setTier(selectedTier);
    setGraphicsMenuOpen(false);
    // Reload so canvas effects re-initialize with the new tier settings
    setTimeout(() => window.location.reload(), 80);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setGraphicsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Per-tier color theme: soft glassmorphism via inline CSS
  const tierColors: Record<QualityTier, {
    bg: string; border: string; text: string; shadow: string;
    activeBg: string; activeBorder: string; activeText: string; activeShadow: string;
    badgeBg: string; badgeBorder: string; badgeText: string;
  }> = {
    best:   { bg: "rgba(245,158,11,0.15)",  border: "rgba(251,191,36,0.30)",  text: "#fde68a", shadow: "none",
              activeBg: "rgba(251,191,36,0.28)", activeBorder: "rgba(251,191,36,0.70)", activeText: "#fef9c3", activeShadow: "0 0 16px rgba(251,191,36,0.30)",
              badgeBg: "rgba(251,191,36,0.20)", badgeBorder: "rgba(251,191,36,0.40)", badgeText: "#fcd34d" },
    max:    { bg: "rgba(244,63,94,0.14)",   border: "rgba(251,113,133,0.28)", text: "#fecdd3", shadow: "none",
              activeBg: "rgba(244,63,94,0.28)",  activeBorder: "rgba(251,113,133,0.65)", activeText: "#ffe4e6", activeShadow: "0 0 16px rgba(251,113,133,0.28)",
              badgeBg: "rgba(244,63,94,0.20)",  badgeBorder: "rgba(251,113,133,0.38)", badgeText: "#fb7185" },
    ultra:  { bg: "rgba(168,85,247,0.14)",  border: "rgba(192,132,252,0.28)", text: "#e9d5ff", shadow: "none",
              activeBg: "rgba(168,85,247,0.28)", activeBorder: "rgba(192,132,252,0.65)", activeText: "#f3e8ff", activeShadow: "0 0 16px rgba(168,85,247,0.28)",
              badgeBg: "rgba(168,85,247,0.20)", badgeBorder: "rgba(192,132,252,0.38)", badgeText: "#c084fc" },
    high:   { bg: "rgba(6,182,212,0.13)",   border: "rgba(34,211,238,0.26)",  text: "#a5f3fc", shadow: "none",
              activeBg: "rgba(6,182,212,0.26)",  activeBorder: "rgba(34,211,238,0.62)",  activeText: "#cffafe", activeShadow: "0 0 16px rgba(34,211,238,0.25)",
              badgeBg: "rgba(6,182,212,0.20)",  badgeBorder: "rgba(34,211,238,0.38)",  badgeText: "#22d3ee" },
    medium: { bg: "rgba(249,115,22,0.13)",  border: "rgba(251,146,60,0.26)",  text: "#fed7aa", shadow: "none",
              activeBg: "rgba(249,115,22,0.26)", activeBorder: "rgba(251,146,60,0.62)",  activeText: "#ffedd5", activeShadow: "0 0 16px rgba(251,146,60,0.25)",
              badgeBg: "rgba(249,115,22,0.20)", badgeBorder: "rgba(251,146,60,0.38)",  badgeText: "#fb923c" },
    low:    { bg: "rgba(16,185,129,0.13)",  border: "rgba(52,211,153,0.26)",  text: "#a7f3d0", shadow: "none",
              activeBg: "rgba(16,185,129,0.26)", activeBorder: "rgba(52,211,153,0.62)",  activeText: "#d1fae5", activeShadow: "0 0 16px rgba(52,211,153,0.25)",
              badgeBg: "rgba(16,185,129,0.20)", badgeBorder: "rgba(52,211,153,0.38)",  badgeText: "#34d399" },
  };

  const tierLabels: Record<QualityTier, { label: string; mobileLabel: string; icon: string; desc: string; color: string }> = {
    best:  { label: "Best",   mobileLabel: "BEST", icon: "👑", desc: "240FPS+ • 1800 Stars • 100% Video • Music", color: "border-amber-400/80 text-amber-200 bg-amber-500/20 shadow-amber-500/30" },
    max:   { label: "Max",    mobileLabel: "MAX",  icon: "💎", desc: "144FPS+ • 1200 Stars • 95% Video • Music",  color: "border-rose-400/60 text-rose-200 bg-rose-500/15 shadow-rose-500/20" },
    ultra: { label: "Ultra",  mobileLabel: "UHD",  icon: "🚀", desc: "120FPS+ • 600 Stars • 82% Video • Music",   color: "border-purple-500/40 text-purple-300 bg-purple-500/10" },
    high:  { label: "High",   mobileLabel: "FHD",  icon: "✨", desc: "60-120FPS • 200 Stars • Smooth",               color: "border-cyan-500/40 text-cyan-300 bg-cyan-500/10" },
    medium:{ label: "Medium", mobileLabel: "HD",   icon: "⚡",  desc: "60FPS • 100 Stars • Power Saver",             color: "border-amber-500/40 text-amber-300 bg-amber-500/10" },
    low:   { label: "Saver",  mobileLabel: "SD",   icon: "🔋", desc: "60FPS • VirtualBox Ready • 0% CPU Load",       color: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10" },
  };

  const tierOptions: QualityTier[] = ["best", "max", "ultra", "high", "medium", "low"];

  const navLinks = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.projects"), path: "/projects" },
    { name: t("nav.certificates"), path: "/certificates" },
    { name: t("nav.resume"), path: "/resume" },
    { name: t("nav.aiChat"), path: "/ai-chat", icon: <Sparkles size={14} className="text-yellow-400" /> },
    { name: t("nav.blog"), path: "/blog", icon: <Rss size={14} className="text-blue-400" /> },
    { name: t("nav.about"), path: "/about" },
  ];

  const languages: { code: Language; flag: string; label: string; neonColor: string }[] = [
    { code: "uz", flag: "🇺🇿", label: "UZ", neonColor: "#00f0ff" }, // Cyan blue
    { code: "en", flag: "🇬🇧", label: "EN", neonColor: "#ff2a6d" }, // Neon red/magenta
    { code: "ru", flag: "🇷🇺", label: "RU", neonColor: "#ffb703" }, // Amber orange
  ];

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(y / height);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <motion.div
        className="h-[2px] bg-gradient-to-r from-primary via-purple-500 to-pink-500 origin-left"
        style={{ scaleX: progress }}
      />

      <div
        className={`transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-xl bg-background/70 border-b border-white/5 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between">

          <div className="flex items-center gap-3 lg:gap-6 min-w-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-primary/80 to-purple-600/80 border border-white/20 shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                {avatarSrc ? (
                  <img src={avatarSrc} alt={authorName} className="w-full h-full object-cover relative z-10" />
                ) : (
                  <Bot size={22} className="text-white relative z-10 drop-shadow-md group-hover:animate-pulse" />
                )}
                {/* Online Status Dot */}
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-[3px] border-background rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] z-20"></div>
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <span className="font-extrabold text-[15px] leading-tight tracking-tight text-white group-hover:text-primary transition-colors truncate">
                  {authorName}
                </span>
                <span className="hidden sm:flex text-[10px] font-bold tracking-[0.2em] uppercase text-primary/90 items-center gap-1 mt-0.5">
                  AI/ML Developer <Sparkles size={10} className="text-yellow-400/80" />
                </span>
              </div>
            </Link>

            {/* AI Online Indicator */}
            <div className="hidden lg:flex items-center">
              <MovingGradientButton
                label={t("nav.askAi")}
                link="/ai-chat"
                newTab={false}
                colors={{ fill: "#0e0926", hoverFill: "#1b1145", textColor: "#FFFFFF", hoverTextColor: "#FACC15" }}
                stroke={{ headColor: "#FACC15", color: "#818CF8", count: 2, speed: 25, trail: 70, movement: "continuous" }}
                addIcon={true}
                icon={{ symbol: "✨", size: 12, color: "#FACC15" }}
                rounded={100}
                padding="6px 14px"
                gap={6}
                border={{ borderWidth: 1, borderColor: "rgba(129,140,248,0.3)" }}
                font={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}
              />
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-full backdrop-blur-md">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-3 lg:px-5 py-2 rounded-full text-[13px] font-medium transition-all flex items-center gap-1.5 ${
                  isActive(link.path)
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {link.name}
                {link.icon && link.icon}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Graphics Quality Dropdown Container */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setGraphicsMenuOpen(!graphicsMenuOpen)}
                title="Graphics Quality Menu"
                className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all duration-300 backdrop-blur-md shadow-md hover:scale-105 active:scale-95 ${tierLabels[tier].color}`}
              >
                {/* Mobile: short badge (SD / HD / FHD / UHD / MAX / BEST) */}
                <span className="sm:hidden text-[10px] font-black tracking-widest flex items-center gap-1">
                  {tierLabels[tier].mobileLabel}
                  <ChevronDown size={11} className={`transition-transform duration-200 ${graphicsMenuOpen ? "rotate-180" : ""}`} />
                </span>
                {/* Desktop: emoji + "Graphics: Ultra" */}
                <span className="hidden sm:flex items-center gap-1.5">
                  <span>{tierLabels[tier].icon}</span>
                  <span className="text-[11px] font-black tracking-wider uppercase">
                    <span className="opacity-50 font-medium normal-case">Graphics: </span>
                    {tierLabels[tier].label}
                  </span>
                  <ChevronDown size={12} className={`transition-transform duration-200 opacity-70 ${graphicsMenuOpen ? "rotate-180" : ""}`} />
                </span>
              </button>

              {/* Graphics Dropdown Menu List — mobile: fixed bottom-up, desktop: below button */}
              <AnimatePresence>
                {graphicsMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-44 sm:w-52 rounded-2xl border border-white/20 bg-[#08080f]/97 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-50 overflow-hidden"
                    style={{ maxWidth: "calc(100vw - 16px)" }}
                  >
                    <div className="px-2.5 py-1 border-b border-white/10 mb-1 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                        {translateDynamicText("Grafika Rejimi", language)}
                      </span>
                      <span className="text-[9px] text-white/40 font-mono font-bold">
                        {language === "uz" ? "6 ta Rejim" : language === "ru" ? "6 Режимов" : "6 Options"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      {tierOptions.map((optId) => {
                        const opt = tierLabels[optId];
                        const tc = tierColors[optId];
                        const isActiveTier = tier === optId;
                        const btnBg     = isActiveTier ? tc.activeBg     : tc.bg;
                        const btnBorder = isActiveTier ? tc.activeBorder : tc.border;
                        const btnColor  = isActiveTier ? tc.activeText   : tc.text;
                        const btnShadow = isActiveTier ? tc.activeShadow : "none";
                        return (
                          <button
                            key={optId}
                            onClick={() => selectTier(optId)}
                            style={{
                              background: btnBg,
                              borderColor: btnBorder,
                              color: btnColor,
                              boxShadow: btnShadow,
                              backdropFilter: "blur(10px)",
                              WebkitBackdropFilter: "blur(10px)",
                            }}
                            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl border transition-all duration-200 text-left hover:scale-[1.04] hover:z-10"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-base flex-shrink-0">{opt.icon}</span>
                              <span className="text-xs font-black uppercase tracking-wider">{opt.label}</span>
                              <span
                                style={{
                                  background: tc.badgeBg,
                                  borderColor: tc.badgeBorder,
                                  color: tc.badgeText,
                                }}
                                className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded-md border"
                              >
                                {opt.mobileLabel}
                              </span>
                            </div>
                            {isActiveTier && <Check size={14} className="flex-shrink-0 ml-1 opacity-90" style={{ color: btnColor }} />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language buttons — smaller on mobile */}
            <div className="flex items-center gap-1 sm:gap-2">
              {languages.map((l) => {
                const active = language === l.code;
                return (
                  <NeonBorder
                    key={l.code}
                    color={l.neonColor}
                    rounded={10}
                    thickness={2}
                    borderSize={30}
                    glow={active ? 70 : 28}
                    speed={active ? 14 : 20}
                  >
                    <button
                      onClick={() => setLanguage(l.code)}
                      title={l.label}
                      className={`relative px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-[10px] border flex items-center gap-1 sm:gap-1.5 transition-all duration-300 ${
                        active
                          ? "bg-white/15 text-white border-white/30 shadow-[0_0_12px_rgba(255,255,255,0.12)] scale-105"
                          : "bg-black/50 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className="text-xs sm:text-sm leading-none">{l.flag}</span>
                      <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase hidden xs:inline sm:inline">{l.label}</span>
                    </button>
                  </NeonBorder>
                );
              })}
            </div>

            <button
              className="md:hidden p-2.5 rounded-xl border border-white/10 bg-white/5 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 border-t border-white/5 bg-background/95 backdrop-blur-2xl p-6 shadow-2xl"
          >
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-4 rounded-2xl text-lg font-medium flex items-center justify-between ${
                    isActive(link.path) ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                  {link.icon && link.icon}
                </Link>
              ))}

              <hr className="my-2 border-white/5" />

              {/* Mobile Graphics Quality Selector */}
              <div className="px-2 py-2">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <Zap size={13} /> {translateDynamicText("Grafika Rejimi", language)}
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {tierOptions.map((optId) => {
                    const opt = tierLabels[optId];
                    const tc = tierColors[optId];
                    const isActiveTier = tier === optId;
                    return (
                      <button
                        key={optId}
                        onClick={() => { selectTier(optId); setMobileMenuOpen(false); }}
                        style={{
                          background: isActiveTier ? tc.activeBg : tc.bg,
                          borderColor: isActiveTier ? tc.activeBorder : tc.border,
                          color: isActiveTier ? tc.activeText : tc.text,
                          boxShadow: isActiveTier ? tc.activeShadow : "none",
                        }}
                        className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl border text-center transition-all duration-200"
                      >
                        <span className="text-base">{opt.icon}</span>
                        <span className="text-[9px] font-black uppercase tracking-wide">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="my-2 border-white/5" />

              {/* Mobile Language Selector */}
              <div className="flex items-center justify-between px-2 py-2">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Globe size={16} /> {t("nav.language")}:
                </span>
                <div className="flex items-center gap-2">
                  {languages.map((l) => {
                    const active = language === l.code;
                    return (
                      <NeonBorder
                        key={l.code}
                        color={l.neonColor}
                        rounded={12}
                        thickness={2}
                        borderSize={35}
                        glow={active ? 80 : 35}
                        speed={active ? 14 : 20}
                      >
                        <button
                          onClick={() => setLanguage(l.code)}
                          title={l.label}
                          className={`relative px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all duration-300 ${
                            active
                              ? "bg-white/15 text-white border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                              : "bg-black/50 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <span className="text-base leading-none">{l.flag}</span>
                          <span className="text-xs font-black tracking-wider uppercase">{l.label}</span>
                        </button>
                      </NeonBorder>
                    );
                  })}
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}