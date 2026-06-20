import { Link, useRouter } from "../lib/router";
import { Menu, X, LayoutDashboard, Sparkles, FileText, Bot, BookOpen, Rss } from "lucide-react"; // Rss yoki BookOpen qo'shdik
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface HeaderProps {
  data?: any;
}

export function Header({ data }: HeaderProps) {
  const { currentPath } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const authorName = data?.author || "Jaloliddin"; 
  const avatarSrc = data?.avatarUrl ? `${API_URL}${data.avatarUrl}` : null;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: "Certificates", path: "/certificates" },
    { name: "Resume", path: "/resume" },
    { name: "Rubensh AI", path: "/ai-chat", icon: <Sparkles size={14} className="text-yellow-400" /> },
    // YANGI BLOG (TELEGRAM CHANNEL) LINKI
    { name: "Blog", path: "/blog", icon: <Rss size={14} className="text-blue-400" /> },
    { name: "About", path: "/about" },
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
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary/80 to-purple-600/80 border border-white/20 shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                {avatarSrc ? (
                  <img src={avatarSrc} alt={authorName} className="w-full h-full object-cover relative z-10" />
                ) : (
                  <Bot size={22} className="text-white relative z-10 drop-shadow-md group-hover:animate-pulse" />
                )}
                {/* Online Status Dot */}
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-[3px] border-background rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] z-20"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[15px] leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 group-hover:to-primary transition-all">
                  {authorName}
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/90 flex items-center gap-1">
                  AI Engineer <Sparkles size={10} className="text-yellow-400/80" />
                </span>
              </div>
            </Link>

            {/* AI Online Indicator */}
            <Link href="/ai-chat" className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
               <motion.div 
                 animate={{ opacity: [0.4, 1, 0.4] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"
               />
               <span className="text-[10px] font-semibold uppercase tracking-tighter flex items-center gap-1 text-white">
                 Ask AI <Sparkles size={10} className="text-yellow-400" />
               </span>
            </Link>
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

          <div className="flex items-center gap-4">


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
              

            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}