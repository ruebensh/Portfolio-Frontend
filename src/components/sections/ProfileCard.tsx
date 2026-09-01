"use client";

import React, { forwardRef } from "react";
import Image from "next/image";
import { GithubLogo, TelegramLogo, LinkedinLogo, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext";
import { resolveUrl } from "@/lib/api";

export const ProfileCardContent = ({ settings }: { settings: any }) => {
  const { t, td } = useLanguage();

  const avatarSrc = resolveUrl(settings?.avatarUrl) || "/jaloliddin_profile.png";

  const socials = [
    { icon: <GithubLogo size={20} weight="fill" />, href: settings?.github, label: "GitHub" },
    { icon: <TelegramLogo size={20} weight="fill" />, href: settings?.telegram, label: "Telegram" },
    { icon: <LinkedinLogo size={20} weight="fill" />, href: settings?.linkedin, label: "LinkedIn" },
    { icon: <EnvelopeSimple size={20} weight="fill" />, href: settings?.email ? `mailto:${settings.email}` : null, label: "Email" },
  ].filter((s) => s.href);

  return (
    <div className="card-surface p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 w-[90vw] max-w-3xl mx-auto shadow-[0_25px_70px_-10px_rgba(244,201,93,0.35),0_0_35px_rgba(244,201,93,0.2)] rounded-3xl border border-accent/40 bg-card-bg/75 backdrop-blur-xl relative overflow-hidden">
      {/* Glass glow backdrop ambient */}
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      {/* Avatar Container */}
      <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 z-10">
        <div className="w-full h-full rounded-full p-1 border-2 border-accent/50 bg-black/60 backdrop-blur-md shadow-[0_0_25px_rgba(244,201,93,0.3)] overflow-hidden">
          <img
            src={avatarSrc}
            alt={settings?.title || "Profile"}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-accent border-2 border-black/80 shadow-[0_0_12px_rgba(244,201,93,0.8)] animate-pulse" />
      </div>

      {/* Info Container */}
      <div className="flex-1 text-center md:text-left z-10">
        <h2 suppressHydrationWarning className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2 drop-shadow-md">
          {td(settings?.author || settings?.title || "Jaloliddin Xalimov")}
        </h2>
        <p suppressHydrationWarning className="font-mono text-sm md:text-base text-accent font-semibold mb-6 tracking-wide uppercase">
          {td(settings?.mainStack || settings?.description || "AI/ML Student & Python Backend Developer")}
        </p>

        {settings?.stats && (
          <div className="flex flex-wrap justify-center md:justify-start gap-8 mb-8 border-y border-white/10 py-4">
            <div className="text-center md:text-left">
              <p className="font-display text-2xl font-bold text-foreground">{settings.stats.projects}+</p>
              <p className="font-mono text-xs text-muted uppercase tracking-wider">{t("profile.projects")}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="font-display text-2xl font-bold text-foreground">{settings.stats.experience}</p>
              <p className="font-mono text-xs text-muted uppercase tracking-wider">{t("profile.experience")}</p>
            </div>
            <div className="text-center md:text-left">
              <p className="font-display text-lg font-bold text-foreground max-w-[120px] truncate">{settings.stats.stack}</p>
              <p className="font-mono text-xs text-muted uppercase tracking-wider">{t("profile.mainStack")}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center md:justify-start gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-accent/30 bg-accent/5 backdrop-blur-md text-foreground hover:border-accent hover:bg-accent/20 hover:text-accent transition-all text-sm font-medium shadow-sm hover:shadow-[0_0_15px_rgba(244,201,93,0.3)]"
            >
              {s.icon} <span className="font-mono text-xs uppercase tracking-wider">{s.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ProfileCard = forwardRef<HTMLDivElement, { settings: any, id?: string }>(({ settings, id }, ref) => {
  return (
    <div id={id} ref={ref} className="relative z-10 w-full transition-opacity duration-300">
      <ProfileCardContent settings={settings} />
    </div>
  );
});

ProfileCard.displayName = "ProfileCard";
