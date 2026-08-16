import { createPortal } from "react-dom";

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
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setGraphicsMenuOpen(!graphicsMenuOpen)}
                title="Graphics Quality Menu"
                className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all duration-300 backdrop-blur-md shadow-md hover:scale-105 active:scale-95 ${tierLabels[tier].color}`}
              >
                <span className="sm:hidden text-[10px] font-black tracking-widest flex items-center gap-1">
                  {tierLabels[tier].mobileLabel}
                  <ChevronDown size={11} className={`transition-transform duration-200 ${graphicsMenuOpen ? "rotate-180" : ""}`} />
                </span>
                <span className="hidden sm:flex items-center gap-1.5">
                  <span>{tierLabels[tier].icon}</span>
                  <span className="text-[11px] font-black tracking-wider uppercase">
                    <span className="opacity-50 font-medium normal-case">Graphics: </span>
                    {tierLabels[tier].label}
                  </span>
                  <ChevronDown size={12} className={`transition-transform duration-200 opacity-70 ${graphicsMenuOpen ? "rotate-180" : ""}`} />
                </span>
              </button>

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

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/85 backdrop-blur-md z-[999990] md:hidden"
              />

              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                style={{
                  background: "linear-gradient(180deg, #0e0927 0%, #09061a 50%, #04020c 100%)",
                  borderColor: "rgba(168, 85, 247, 0.35)",
                  boxShadow: "0 0 90px rgba(99, 102, 241, 0.4), 25px 0 60px rgba(0, 0, 0, 0.95)",
                }}
                className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-[320px] border-r z-[1000000] p-6 flex flex-col justify-between overflow-y-auto md:hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-purple-500/20 via-indigo-500/10 to-transparent pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-6">
                  <div className="flex items-center justify-between pb-5 border-b border-white/15">
                    <Link
                      href="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/30 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)] overflow-hidden">
                        {avatarSrc ? (
                          <img src={avatarSrc} alt={authorName} className="w-full h-full object-cover" />
                        ) : (
                          <Bot size={20} className="text-white" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-base text-white leading-tight truncate">{authorName}</h3>
                        <span className="text-[10px] font-extrabold text-purple-400 tracking-widest uppercase">Portfolio</span>
                      </div>
                    </Link>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95 shadow-md"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <nav className="flex flex-col gap-2">
                    {navLinks.map((link) => {
                      const active = isActive(link.path);
                      return (
                        <Link
                          key={link.path}
                          href={link.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`group relative px-4 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-between transition-all duration-300 ${
                            active
                              ? "bg-gradient-to-r from-purple-600/40 via-indigo-600/30 to-purple-900/20 text-white border border-purple-400/60 shadow-[0_0_25px_rgba(168,85,247,0.35)]"
                              : "text-white/80 hover:text-white hover:bg-white/10 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-2.5 h-2.5 rounded-full transition-all ${active ? "bg-purple-400 shadow-[0_0_10px_#c084fc]" : "bg-white/20 group-hover:bg-white/50"}`} />
                            <span>{link.name}</span>
                          </div>
                          {link.icon ? link.icon : active && <span className="text-xs font-bold text-purple-400">●</span>}
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="relative z-10 pt-6 border-t border-white/15 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Globe size={15} className="text-purple-400" /> {language === "uz" ? "Til" : language === "ru" ? "Язык" : "Language"}
                    </span>
                    <div className="flex items-center gap-2">
                      {languages.map((l) => {
                        const active = language === l.code;
                        return (
                          <button
                            key={l.code}
                            onClick={() => {
                              setLanguage(l.code);
                              setMobileMenuOpen(false);
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                              active
                                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.6)] scale-105"
                                : "bg-white/10 text-white/70 border-white/15 hover:bg-white/20 hover:text-white"
                            }`}
                          >
                            <span>{l.flag}</span>
                            <span className="uppercase text-[11px] font-black">{l.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
}