import { Link, useRouter } from "../lib/router";
import { Menu, X, ChevronRight, LayoutDashboard } from "lucide-react";
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

  // Ma'lumotlar
  const authorName = data?.author || "Jaloliddin"; 
  const avatarSrc = data?.avatarUrl ? `${API_URL}${data.avatarUrl}` : null;

  // Faqat kerakli bo'limlar
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: "About", path: "/about" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  // Scroll kuzatuvchisi
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
      {/* Progress Bar */}
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
          
          {/* Logo & Avatar */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-primary/20 flex items-center justify-center transition-transform group-hover:scale-110">
              {avatarSrc ? (
                <img src={avatarSrc} alt={authorName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-bold text-lg">{authorName.charAt(0)}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight tracking-tight">
                {authorName}
              </span>
              <span className="text-[10px] text-primary font-medium tracking-widest uppercase opacity-80">
                AI Engineer
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-full backdrop-blur-md">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive(link.path) 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Admin Panel (Desktop) */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                         bg-foreground text-background hover:opacity-90 transition-all shadow-xl"
            >
              <LayoutDashboard size={16} />
              Admin
            </Link>

            {/* Mobile Menu Toggle */}
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
                  className={`p-4 rounded-2xl text-lg font-medium ${
                    isActive(link.path) ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <hr className="my-2 border-white/5" />
              
              {/* Admin Panel (Mobile) */}
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 font-bold text-foreground"
              >
                <LayoutDashboard size={20} />
                Admin Panel
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}