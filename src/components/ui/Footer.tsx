"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { GithubLogo, TelegramLogo, LinkedinLogo, InstagramLogo, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext";

export const Footer = ({ settings }: { settings?: any }) => {
  const currentYear = new Date().getFullYear();
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useLanguage();

  const handleSecretClick = () => {
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    if (clickCount.current >= 3) {
      clickCount.current = 0;
      window.location.href = "/admin";
      return;
    }
    clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 700);
  };

  const authorName = settings?.title || "Jaloliddin Xalimov";
  const authorRole = settings?.description || "AI/ML Student & Python Developer";

  const socialLinks = [
    { name: "GitHub",    Icon: GithubLogo,    href: settings?.github    || "https://github.com/jaloliddinxalimov" },
    { name: "LinkedIn",  Icon: LinkedinLogo,  href: settings?.linkedin  || "https://linkedin.com" },
    { name: "Telegram",  Icon: TelegramLogo,  href: settings?.telegram ? `https://t.me/${settings.telegram.replace("@", "")}` : "https://t.me/jaloliddin_xalimov" },
    { name: "Instagram", Icon: InstagramLogo, href: settings?.instagram || "https://instagram.com" },
    { name: "Email",     Icon: EnvelopeSimple, href: settings?.email ? `mailto:${settings.email}` : "mailto:jaloliddinxalimov.0103@gmail.com" },
  ];

  const navLinks = [
    { label: t("nav.home"),         href: "/" },
    { label: t("nav.projects"),     href: "/projects" },
    { label: t("nav.certificates"), href: "/certificates" },
    { label: t("nav.about"),        href: "/about" },
    { label: t("nav.blog"),         href: "/blog" },
    { label: t("nav.resume"),       href: "/resume" },
  ];

  return (
    <footer className="relative z-10 border-t border-card-border bg-card-bg py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Top row: logo + nav links */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 mb-12 pb-12 border-b border-card-border">
          {/* Brand block */}
          <div className="max-w-xs">
            <button
              onClick={handleSecretClick}
              title="Siri kashf etish uchun 3 marta bosing"
              className="font-display text-2xl font-bold text-foreground tracking-tighter hover:text-accent transition-colors select-none mb-3 block"
            >
              Jaloliddin<span className="text-accent">.</span>
            </button>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {authorRole}
            </p>
            <p className="mt-4 text-sm text-muted leading-relaxed font-sans max-w-[260px]">
              Data ichidan signalni topaman. Murakkab modelni aniq yo'nalishga aylantiraman.
            </p>
          </div>

          {/* Nav grid */}
          <nav className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-3">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-accent transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom row: social icons + copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Social */}
          <div className="flex items-center gap-4">
            {socialLinks.map(({ name, Icon, href }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={name}
                className="w-9 h-9 border border-card-border flex items-center justify-center text-muted hover:border-accent hover:text-accent transition-colors duration-200"
              >
                <Icon size={16} weight="fill" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-muted">
            <span>© {currentYear} {authorName}.</span>
            <span className="hidden md:inline text-card-border">|</span>
            <span>{t("footer.rights")}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
