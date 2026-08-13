import { Link, useRouter } from "../lib/router";
import { Menu, X, Sparkles, Bot, Rss, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MovingGradientButton from "./originkit/ui/moving-gradient-button";
import { useLanguage } from "../context/LanguageContext";
import { Language } from "../lib/i18n";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface HeaderProps {
  data?: any;
}

// ── Neon Rotating Border for flag buttons ────────────────────────────────────
interface FlagBtnProps {
  flag: string;
  code: Language;
  active: boolean;
  neonColor: string;
  onClick: () => void;
}

function FlagButton({ flag, code, active, neonColor, onClick }: FlagBtnProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SIZE = 46;
    const RADIUS = 19;
    const BORDER = 2.2;
    const TRAIL = active ? 1.5 : 0.8; // longer trail when active
    const SPEED = active ? 0.055 : 0.028;

    canvas.width = SIZE;
    canvas.height = SIZE;

    // Parse neonColor hex → rgb for rgba usage
    const r = parseInt(neonColor.slice(1, 3), 16);
    const g = parseInt(neonColor.slice(3, 5), 16);
    const b = parseInt(neonColor.slice(5, 7), 16);

    const cx = SIZE / 2;
    const cy = SIZE / 2;

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);

      // Base circle ring (dim)
      ctx.beginPath();
      ctx.arc(cx, cy, RADIUS, 0, Math.PI * 2);
      ctx.strokeStyle = active
        ? `rgba(${r},${g},${b},0.25)`
        : `rgba(255,255,255,0.08)`;
      ctx.lineWidth = BORDER;
      ctx.stroke();

      // Glowing arc
      const start = angleRef.current;
      const end = start + Math.PI * TRAIL;

      // outer glow
      ctx.save();
      ctx.shadowBlur = 14;
      ctx.shadowColor = `rgba(${r},${g},${b},0.9)`;
      const grad = ctx.createConicalGradient
        ? undefined
        : null;

      // Draw arc segment with gradient opacity trick
      const steps = 28;
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const angle = start + t * Math.PI * TRAIL;
        const opacity = active ? t * 0.95 : t * 0.55;
        ctx.beginPath();
        ctx.arc(cx, cy, RADIUS, angle, angle + (Math.PI * TRAIL) / steps + 0.01);
        ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
        ctx.lineWidth = BORDER + (active ? 2 : 1) * t;
        ctx.shadowBlur = active ? 18 : 8;
        ctx.stroke();
      }

      // Bright head dot
      const headX = cx + Math.cos(end) * RADIUS;
      const headY = cy + Math.sin(end) * RADIUS;
      ctx.beginPath();
      ctx.arc(headX, headY, active ? 3.5 : 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},1)`;
      ctx.shadowBlur = active ? 20 : 10;
      ctx.shadowColor = `rgba(${r},${g},${b},1)`;
      ctx.fill();

      ctx.restore();

      angleRef.current += SPEED;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, neonColor]);

  return (
    <button
      onClick={onClick}
      title={code.toUpperCase()}
      className="relative flex items-center justify-center w-[46px] h-[46px] flex-shrink-0 select-none"
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
    >
      {/* Neon canvas ring */}
      <canvas
        ref={canvasRef}
        width={46}
        height={46}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Flag & background */}
      <span
        className={`relative z-10 w-[34px] h-[34px] rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
          active
            ? "scale-110 shadow-lg"
            : "scale-95 opacity-70 hover:opacity-100 hover:scale-100"
        }`}
        style={
          active
            ? {
                boxShadow: `0 0 14px 3px ${neonColor}55, 0 0 4px 1px ${neonColor}99`,
              }
            : {}
        }
      >
        {flag}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function Header({ data }: HeaderProps) {
  const { currentPath } = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const authorName = data?.author || "Jaloliddin";
  const avatarSrc = data?.avatarUrl ? `${API_URL}${data.avatarUrl}` : null;

  const navLinks = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.projects"), path: "/projects" },
    { name: t("nav.certificates"), path: "/certificates" },
    { name: t("nav.resume"), path: "/resume" },
    { name: t("nav.aiChat"), path: "/ai-chat", icon: <Sparkles size={14} className="text-yellow-400" /> },
    { name: t("nav.blog"), path: "/blog", icon: <Rss size={14} className="text-blue-400" /> },
    { name: t("nav.about"), path: "/about" },
  ];

  const languages: { code: Language; flag: string; neonColor: string }[] = [
    { code: "uz", flag: "🇺🇿", neonColor: "#3BC3FF" }, // ko'k (O'zbekiston bayrog'i ko'ki)
    { code: "en", flag: "🇬🇧", neonColor: "#FF4C6B" }, // qizil (UK bayrog'i)
    { code: "ru", flag: "🇷🇺", neonColor: "#FF7A30" }, // to'q sariq/to'q (RU bayrog'i)
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
                  AI/ML Student & Python Developer <Sparkles size={10} className="text-yellow-400/80" />
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

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* 3 ta alohida bayroqli neon tugmalar */}
            <div className="flex items-center gap-1.5">
              {languages.map((l) => (
                <FlagButton
                  key={l.code}
                  flag={l.flag}
                  code={l.code}
                  active={language === l.code}
                  neonColor={l.neonColor}
                  onClick={() => setLanguage(l.code)}
                />
              ))}
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

              {/* Mobile Language Selector — 3 ta alohida bayroqli tugma */}
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Globe size={16} /> {t("nav.language")}:
                </span>
                <div className="flex items-center gap-1">
                  {languages.map((l) => (
                    <FlagButton
                      key={l.code}
                      flag={l.flag}
                      code={l.code}
                      active={language === l.code}
                      neonColor={l.neonColor}
                      onClick={() => setLanguage(l.code)}
                    />
                  ))}
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}