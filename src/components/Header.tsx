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

  const tierLabels: Record<QualityTier, { label: string; mobileLabel: string; icon: string; desc: string; color: string; accentBg: string; accentBorder: string; accentText: string; accentGlow: string }> = {
    best:  { label: "Best",   mobileLabel: "BEST", icon: "👑", desc: "144FPS • Max Stars • Full Neon • Music",      color: "border-amber-400/60 text-amber-300 bg-amber-400/15",   accentBg: "rgba(251,191,36,0.12)",  accentBorder: "rgba(251,191,36,0.5)",  accentText: "#fcd34d",  accentGlow: "rgba(251,191,36,0.25)" },
    max:   { label: "Max",    mobileLabel: "MAX",  icon: "💎", desc: "120FPS+ • 800 Stars • 90% Video • Music",    color: "border-rose-500/40 text-rose-300 bg-rose-500/10",      accentBg: "rgba(244,63,94,0.12)",   accentBorder: "rgba(244,63,94,0.5)",   accentText: "#fb7185",  accentGlow: "rgba(244,63,94,0.25)" },
    ultra: { label: "Ultra",  mobileLabel: "UHD",  icon: "🚀", desc: "120FPS+ • 600 Stars • 82% Video • Music",   color: "border-purple-500/40 text-purple-300 bg-purple-500/10", accentBg: "rgba(168,85,247,0.12)",  accentBorder: "rgba(168,85,247,0.5)", accentText: "#d8b4fe",  accentGlow: "rgba(168,85,247,0.25)" },
    high:  { label: "High",   mobileLabel: "FHD",  icon: "✨", desc: "60-120FPS • 200 Stars • Smooth",               color: "border-cyan-500/40 text-cyan-300 bg-cyan-500/10",       accentBg: "rgba(6,182,212,0.12)",   accentBorder: "rgba(6,182,212,0.5)",  accentText: "#67e8f9",  accentGlow: "rgba(6,182,212,0.25)" },
    medium:{ label: "Medium", mobileLabel: "HD",   icon: "⚡",  desc: "60FPS • 100 Stars • Power Saver",             color: "border-orange-500/40 text-orange-300 bg-orange-500/10",  accentBg: "rgba(249,115,22,0.12)",  accentBorder: "rgba(249,115,22,0.5)", accentText: "#fdba74",  accentGlow: "rgba(249,115,22,0.25)" },
    low:   { label: "Saver",  mobileLabel: "SD",   icon: "🔋", desc: "60FPS • VirtualBox Ready • 0% CPU Load",       color: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10", accentBg: "rgba(16,185,129,0.12)", accentBorder: "rgba(16,185,129,0.5)", accentText: "#6ee7b7",  accentGlow: "rgba(16,185,129,0.25)" },
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
    <header className="fixed top-0 left-0 right-0 z-[100] pointer-events-auto">
      <motion.div
        className="h-[2px] bg-gradient-to-r from-primary via-purple-500 to-pink-500 origin-left"
        style={{ scaleX: progress }}
      />

      <div
        className={`transition-all duration-500 pointer-events-auto ${
          scrolled
            ? "backdrop-blur-xl bg-background/70 border-b border-white/5 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between">

          <div className="flex items-center gap-3 lg:gap-6 min-w-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary/80 to-purple-600/80 border border-white/20 shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                {avatarSrc ? (
                  <img src={avatarSrc} alt={authorName} className="w-full h-full object-cover relative z-10" />
                ) : (
                  <Bot size={20} className="text-white relative z-10 drop-shadow-md group-hover:animate-pulse" />
                )}
                {/* Online Status Dot */}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] z-20"></div>
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <span className="font-extrabold text-[14px] leading-tight tracking-tight text-white group-hover:text-primary transition-colors truncate">
                  {authorName}
                </span>
                <span className="hidden xl:flex text-[9px] font-bold tracking-[0.2em] uppercase text-primary/90 items-center gap-1 mt-0.5">
                  AI/ML Student <Sparkles size={9} className="text-yellow-400/80" />
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

          <nav className="hidden md:flex items-center gap-0.5 bg-white/5 border border-white/10 p-1 rounded-full backdrop-blur-md overflow-hidden flex-shrink">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-2.5 lg:px-4 py-1.5 rounded-full text-[12px] font-medium transition-all flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${
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

              {/* Graphics Dropdown Menu List */}
              <AnimatePresence>
                {graphicsMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2.5 w-52 sm:w-56 rounded-2xl border border-white/20 bg-[#05050d] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.95)] backdrop-blur-3xl z-[200] overflow-hidden"
                    style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.06)" }}
                  >
                    <div className="px-2.5 py-1.5 border-b border-white/10 mb-1.5 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                        {translateDynamicText("Grafika Rejimi", language)}
                      </span>
                      <span className="text-[9px] text-white/40 font-mono font-bold">
                        {language === "uz" ? "6 ta Rejim" : language === "ru" ? "6 Режимов" : "6 Options"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      {tierOptions.map((optId) => {
                        const opt = tierLabels[optId];
                        const isActiveTier = tier === optId;
                        return (
                          <button
                            key={optId}
                            onClick={() => selectTier(optId)}
                            style={isActiveTier ? {
                              background: opt.accentBg,
                              borderColor: opt.accentBorder,
                              color: opt.accentText,
                              boxShadow: `0 0 14px ${opt.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.08)`
                            } : {
                              background: opt.accentBg,
                              borderColor: `${opt.accentBorder.replace('0.5)', '0.2)')}`,
                            }}
                            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl border transition-all duration-200 text-left relative overflow-hidden group"
                          >
                            {/* Hover overlay */}
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"
                              style={{ background: opt.accentBg, boxShadow: `inset 0 0 20px ${opt.accentGlow}` }}
                            />
                            <div className="relative flex items-center gap-2 min-w-0">
                              <span className="text-base flex-shrink-0">{opt.icon}</span>
                              <span
                                className="text-xs font-black uppercase tracking-wider"
                                style={{ color: isActiveTier ? opt.accentText : "rgba(255,255,255,0.85)" }}
                              >
                                {opt.label}
                              </span>
                              <span
                                className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded-md border"
                                style={{
                                  background: isActiveTier ? opt.accentBg : "rgba(255,255,255,0.07)",
                                  borderColor: isActiveTier ? opt.accentBorder : "rgba(255,255,255,0.12)",
                                  color: isActiveTier ? opt.accentText : "rgba(255,255,255,0.55)"
                                }}
                              >
                                {opt.mobileLabel}
                              </span>
                            </div>
                            {isActiveTier && (
                              <Check size={13} className="relative flex-shrink-0 ml-1" style={{ color: opt.accentText }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3 ta alohida to'rtburchak NeonBorder ga ega bayroqli tugmalar */}
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
                      className={`relative px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all duration-300 ${
                        active
                          ? "bg-white/15 text-white border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.15)] scale-105"
                          : "bg-black/50 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className="text-sm leading-none">{l.flag}</span>
                      <span className="text-[11px] font-black tracking-wider uppercase">{l.label}</span>
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