import { Link, useRouter } from "../lib/router";
import { Menu, X, LayoutDashboard, Sparkles, FileText, Bot, BookOpen, Rss, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MovingGradientButton from "./originkit/ui/moving-gradient-button";
import { useLanguage } from "../context/LanguageContext";
import { Language } from "../lib/i18n";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface HeaderProps {
  data?: any;
}

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

  const languages: { code: Language; label: string }[] = [
    { code: "uz", label: "UZ" },
    { code: "en", label: "EN" },
    { code: "ru", label: "RU" },
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

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Desktop & Mobile Language Selector */}
            <div className="flex items-center bg-white/5 border border-white/10 p-1 rounded-full backdrop-blur-md">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                    language === l.code
                      ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(var(--primary),0.5)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {l.label}
                </button>
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
              
              {/* Language Selector in Mobile Drawer */}
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Globe size={16} /> Language / Til:
                </span>
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-full">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLanguage(l.code)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        language === l.code
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {l.label}
                    </button>
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