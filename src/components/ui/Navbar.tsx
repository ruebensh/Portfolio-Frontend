"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  House, Code, Certificate, FileText, Article, User, Sparkle,
  List, X, Globe
} from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext";
import { Language } from "@/lib/i18n";
import { BackgroundMusicPlayer } from "@/components/ui/BackgroundMusicPlayer";

export const Navbar = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { name: t("nav.home"),         href: "/",             icon: House },
    { name: t("nav.projects"),     href: "/projects",     icon: Code },
    { name: t("nav.certificates"), href: "/certificates", icon: Certificate },
    { name: t("nav.resume"),       href: "/resume",       icon: FileText },
    { name: t("nav.blog"),         href: "/blog",         icon: Article },
    { name: t("nav.about"),        href: "/about",        icon: User },
    { name: t("nav.aiChat"),       href: "/ai-chat",      icon: Sparkle },
  ];

  const languages: { code: Language; label: string }[] = [
    { code: "uz", label: "O'zbek" },
    { code: "en", label: "English" },
    { code: "ru", label: "Русский" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Floating Glass Header */}
      <header className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-6xl transition-all duration-300">
        <div
          className={`w-full rounded-2xl sm:rounded-full border transition-all duration-300 px-3.5 sm:px-5 py-2.5 sm:py-2 flex items-center justify-between ${
            scrolled
              ? "bg-[#09090b]/90 backdrop-blur-2xl border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.8)]"
              : "bg-[#09090b]/75 backdrop-blur-xl border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            className="font-display font-bold text-base sm:text-lg tracking-tighter text-white flex items-center gap-2 group px-1"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(244,201,93,0.8)]" />
            <span>Jaloliddin<span className="text-accent">.</span></span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              const Icon = link.icon;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 select-none ${
                    isActive
                      ? "text-accent-foreground font-semibold"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active-pill"
                      className="absolute inset-0 bg-accent rounded-full shadow-[0_0_15px_rgba(244,201,93,0.4)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon size={15} weight={isActive ? "fill" : "regular"} />
                    <span className="font-sans">{link.name}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions (Music + Language + Mobile Menu) */}
          <div className="flex items-center gap-2">
            <BackgroundMusicPlayer />

            {/* Language Switcher */}
            <div className="relative">
              <button
                id="lang-toggle"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-full border border-white/15 bg-white/5 text-muted font-mono text-[10px] uppercase tracking-wider flex items-center gap-1 hover:border-accent hover:text-accent transition-colors duration-200"
              >
                <Globe size={13} />
                <span>{language}</span>
              </button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 w-36 bg-[#0c0c16]/95 backdrop-blur-2xl border border-white/15 shadow-2xl rounded-2xl p-1 z-50 overflow-hidden"
                  >
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl font-mono text-[10px] uppercase tracking-wider transition-colors ${
                          language === l.code
                            ? "bg-accent/15 text-accent font-bold"
                            : "text-muted hover:text-foreground hover:bg-white/10"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Trigger Button */}
            <button
              id="mobile-menu-toggle"
              aria-label="Open Navigation Menu"
              className="lg:hidden w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full border border-white/15 bg-white/5 text-white flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Minimal Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-[#050505]/95 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-8"
          >
            {/* Drawer Header */}
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-5">
              <div className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                Jaloliddin<span className="text-accent">.</span>
              </div>
              <button
                id="mobile-menu-close"
                aria-label="Close Menu"
                className="w-10 h-10 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white hover:border-accent hover:text-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Links List */}
            <nav className="w-full max-w-md mx-auto flex flex-col gap-2.5 my-auto py-6">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                const Icon = link.icon;

                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * i }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-5 py-3.5 rounded-2xl border transition-all ${
                        isActive
                          ? "bg-accent text-accent-foreground border-accent font-bold shadow-lg"
                          : "border-white/10 bg-white/5 text-foreground hover:border-accent/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} weight={isActive ? "fill" : "regular"} />
                        <span className="font-display text-base tracking-tight">{link.name}</span>
                      </div>
                      <span className="font-mono text-xs text-muted">→</span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Drawer Footer Languages */}
            <div className="w-full max-w-md mx-auto border-t border-white/10 pt-5 flex flex-col items-center gap-4">
              <div className="flex gap-2 w-full">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`flex-1 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all border ${
                      language === l.code
                        ? "border-accent text-accent bg-accent/15 font-bold"
                        : "border-white/10 text-muted hover:border-white/30"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted text-center">
                AI/ML Student & Python Backend Developer
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
