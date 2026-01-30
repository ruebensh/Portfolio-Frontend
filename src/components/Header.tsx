import { Link, useRouter } from "../lib/router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:3000";

interface HeaderProps {
  data?: any;
}

export function Header({ data }: HeaderProps) {
  const { currentPath } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: "About", path: "/about" },
  ];

  const authorName = data?.author || "Jaloliddin"; 
  const avatarSrc = data?.avatarUrl ? `${API_URL}${data.avatarUrl}` : null;

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 backdrop-blur-xl bg-background/80">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-primary/20 flex items-center justify-center transition-transform group-hover:scale-105">
              {avatarSrc ? (
                <img src={avatarSrc} alt={authorName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-bold text-lg">{authorName.charAt(0)}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight hidden sm:inline-block">
                {authorName}
              </span>
              <span className="text-[10px] text-primary/80 font-medium hidden sm:inline-block tracking-wider uppercase">
                AI Engineer
              </span>
            </div>
          </Link>

          {}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm transition-colors relative py-2 ${
                  isActive(link.path) ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {}
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="hidden md:block px-5 py-2 rounded-xl text-sm font-medium
                         bg-white/5 border border-white/10 backdrop-blur-md
                         hover:bg-white/10 hover:border-white/20 
                         transition-all duration-300 shadow-xl text-foreground/90"
            >
              Admin
            </Link>

            <button
              className="md:hidden p-2 rounded-xl border border-white/10 bg-white/5"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-2xl overflow-hidden"
          >
            <nav className="flex flex-col px-6 py-6 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className="text-base py-2 text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/admin"
                className="mt-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-center font-bold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}