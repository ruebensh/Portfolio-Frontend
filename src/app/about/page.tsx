"use client";

import React, { useEffect, useState } from "react";
import { getAbout, getSettings, resolveUrl } from "@/lib/api";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { EyebrowBadge } from "@/components/ui/EyebrowBadge";
import { BookOpen, Certificate, GraduationCap, Heart, Code } from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
  const { td } = useLanguage();
  const [aboutData, setAboutData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAbout().catch(() => null),
      getSettings().catch(() => null),
    ]).then(([aboutRes, settingsRes]) => {
      setAboutData(aboutRes);
      setSettings(settingsRes);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { story, education = [], certificates = [], values = [], currentlyLearning = [], currentlyWorking = [] } = aboutData || {};
  const avatarUrl = resolveUrl(settings?.avatarUrl) || "/jaloliddin_profile.png";

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto p-6 sm:p-10 md:p-12 rounded-3xl border border-card-border/80 bg-card-bg/60 backdrop-blur-xl shadow-2xl space-y-12">
        <AnimatedSection>
          {/* Header Card with Profile Photo */}
          <AnimatedItem>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-white/10 pb-8 mb-4">
              {/* Profile Avatar Image from Backend */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-accent/60 bg-black/60 overflow-hidden flex-shrink-0 shadow-[0_0_30px_rgba(244,201,93,0.3)]">
                <img
                  src={avatarUrl}
                  alt={settings?.author || "Jaloliddin Xalimov"}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <div className="text-center sm:text-left flex-1">
                <EyebrowBadge className="mb-3">{td("Men Haqimda")}</EyebrowBadge>
                <h1 className="heading-gradient-emerald text-3xl sm:text-5xl font-bold tracking-tighter mb-2 font-display">
                  {td(settings?.author || "Jaloliddin Xalimov")}
                </h1>
                <p className="font-mono text-xs sm:text-sm text-accent font-semibold uppercase tracking-wider mb-3">
                  {td(settings?.mainStack || "AI/ML Student & Python Backend Developer")}
                </p>
                <p className="text-xs sm:text-sm text-foreground/80 font-sans max-w-xl">
                  {td(settings?.description || "Men Sun'iy Intellekt, Machine Learning va Python backend yo'nalishida faoliyat yurituvchi dasturchiman.")}
                </p>
              </div>
            </div>
          </AnimatedItem>

          {/* Story */}
          {story && (
            <AnimatedItem>
              <div className="card-surface p-8 md:p-10 rounded-3xl border border-white/15 bg-[#0f0f1b]/80 backdrop-blur-xl">
                <p className="text-base md:text-lg text-foreground/90 font-sans leading-relaxed whitespace-pre-wrap">
                  {td(story)}
                </p>
              </div>
            </AnimatedItem>
          )}

          {/* Education */}
          {education.length > 0 && (
            <AnimatedItem>
              <div className="card-surface p-8 md:p-10 rounded-3xl border border-white/15 bg-[#0f0f1b]/80 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                    <GraduationCap size={22} weight="fill" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-display">{td("Ta'lim")}</h2>
                </div>
                <div className="space-y-4">
                  {education.map((edu: any, idx: number) => (
                    <div key={idx} className="card-surface-nested p-6 rounded-2xl border border-white/10 bg-[#141424]/80 backdrop-blur-md">
                      <h3 className="font-semibold text-white font-display text-lg mb-1">{td(edu.degree)}</h3>
                      <p className="text-muted text-sm font-mono">{td(edu.institution)} • {edu.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedItem>
          )}

          {/* Certificates */}
          {certificates.length > 0 && (
            <AnimatedItem>
              <div className="card-surface p-8 md:p-10 rounded-3xl border border-white/15 bg-[#0f0f1b]/80 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center justify-center">
                    <Certificate size={22} weight="fill" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-display">{td("Sertifikatlar")}</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {certificates.map((cert: any, idx: number) => (
                    <div key={idx} className="card-surface-nested p-6 rounded-2xl border border-white/10 bg-[#141424]/80 backdrop-blur-md">
                      <h3 className="font-semibold text-white font-display mb-1">{td(cert.name || cert.title)}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-muted text-xs font-mono">{td(cert.issuer)}</p>
                        <span className="text-xs text-accent font-mono bg-accent/10 px-2.5 py-1 rounded-full border border-accent/30">{cert.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedItem>
          )}

          {/* Values */}
          {values.length > 0 && (
            <AnimatedItem>
              <div className="card-surface p-8 md:p-10 rounded-3xl border border-white/15 bg-[#0f0f1b]/80 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                    <Heart size={22} weight="fill" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-display">{td("Qadriyatlar & Tamoyillar")}</h2>
                </div>
                <div className="space-y-3">
                  {values.map((v: any, idx: number) => {
                    const textVal = typeof v === "string" ? v : v.value || JSON.stringify(v);
                    return (
                      <div key={idx} className="card-surface-nested p-5 rounded-2xl border border-white/10 bg-[#141424]/80 backdrop-blur-md flex items-start gap-4">
                        <span className="w-2.5 h-2.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                        <p className="text-foreground/90 font-sans text-sm leading-relaxed">{td(textVal)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </AnimatedItem>
          )}

          {/* Currently Learning & Working */}
          <AnimatedItem>
            <div className="grid md:grid-cols-2 gap-6">
              {currentlyLearning.length > 0 && (
                <div className="card-surface p-7 rounded-3xl border border-white/15 bg-[#0f0f1b]/80 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                      <BookOpen size={20} weight="fill" />
                    </div>
                    <h2 className="text-lg font-bold text-white font-display">{td("Hozir O'rganayotganlar")}</h2>
                  </div>
                  <ul className="space-y-2">
                    {currentlyLearning.map((item: any, idx: number) => {
                      const textVal = typeof item === "string" ? item : item.name || JSON.stringify(item);
                      return (
                        <li key={idx} className="flex items-start gap-3 text-sm font-sans text-muted">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                          {td(textVal)}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {currentlyWorking.length > 0 && (
                <div className="card-surface p-7 rounded-3xl border border-white/15 bg-[#0f0f1b]/80 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                      <Code size={20} weight="fill" />
                    </div>
                    <h2 className="text-lg font-bold text-white font-display">{td("Hozir Ishlayotganlar")}</h2>
                  </div>
                  <ul className="space-y-2">
                    {currentlyWorking.map((item: any, idx: number) => {
                      const textVal = typeof item === "string" ? item : item.name || JSON.stringify(item);
                      return (
                        <li key={idx} className="flex items-start gap-3 text-sm font-sans text-muted">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                          {td(textVal)}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </AnimatedItem>

        </AnimatedSection>
      </div>
    </main>
  );
}
