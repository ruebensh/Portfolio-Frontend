"use client";

import React from "react";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { Database, Code, Brain, TerminalWindow, Network, HardDrives } from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext";

const fallbackFeatures = [
  {
    title: "AI & Machine Learning",
    description:
      "PyTorch va TensorFlow orqali sun'iy intellekt modellarini yaratish, o'qitish va optimallashtirish. Computer Vision va NLP loyihalari.",
    icon: <Brain size={28} weight="duotone" className="text-accent" />,
    span: "md:col-span-2 md:row-span-2",
    index: "01",
  },
  {
    title: "Python Backend",
    description:
      "FastAPI va Django yordamida tezkor, xavfsiz va miqyoslanadigan backend arxitekturalari.",
    icon: <Code size={28} weight="duotone" className="text-foreground/60" />,
    span: "md:col-span-1 md:row-span-1",
    index: "02",
  },
  {
    title: "Ma'lumotlar Bazasi",
    description:
      "PostgreSQL, MongoDB va Redis bilan ishlash. Murakkab query'larni optimallashtirish.",
    icon: <Database size={28} weight="duotone" className="text-foreground/60" />,
    span: "md:col-span-1 md:row-span-1",
    index: "03",
  },
  {
    title: "Data Science",
    description:
      "Katta hajmdagi ma'lumotlarni tahlil qilish, tozalash va vizualizatsiya qilish.",
    icon: <Network size={28} weight="duotone" className="text-foreground/60" />,
    span: "md:col-span-1 md:row-span-1",
    index: "04",
  },
  {
    title: "Infratuzilma",
    description:
      "Docker, CI/CD pipeline'lar va cloud serverlarda dasturlarni joylashtirish.",
    icon: <HardDrives size={28} weight="duotone" className="text-foreground/60" />,
    span: "md:col-span-1 md:row-span-1",
    index: "05",
  },
  {
    title: "Terminal & Skriptlar",
    description:
      "Linux muhitida avtomatlashtirish, bash skriptlar yozish va server boshqaruvi.",
    iconName: "TerminalWindow",
    span: "md:col-span-2 md:row-span-1",
    index: "06",
  },
];

const getIcon = (name: string) => {
  switch (name) {
    case "Brain":      return <Brain size={28} weight="duotone" className="text-accent" />;
    case "Code":       return <Code size={28} weight="duotone" className="text-foreground/60" />;
    case "Database":   return <Database size={28} weight="duotone" className="text-foreground/60" />;
    case "Network":    return <Network size={28} weight="duotone" className="text-foreground/60" />;
    case "HardDrives": return <HardDrives size={28} weight="duotone" className="text-foreground/60" />;
    case "TerminalWindow": return <TerminalWindow size={28} weight="duotone" className="text-accent" />;
    default: return <Code size={28} weight="duotone" className="text-foreground/60" />;
  }
};

export const BentoFeatures = ({ skills = [] }: { skills?: any[] }) => {
  const { td } = useLanguage();
  const displaySkills = skills.length > 0 ? skills : fallbackFeatures;

  return (
    <section id="services" className="relative px-6 py-28 md:px-8 md:py-36 overflow-hidden">
      {/* Subtle accent glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/3 blur-[160px] rounded-full pointer-events-none" />
      
      <AnimatedSection className="mx-auto max-w-[1200px] relative z-10">
        {/* Section header */}
        <AnimatedItem className="mb-20">
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent border border-accent/20 px-3 py-1 inline-block mb-6">
            {td("Xizmatlar & Ko'nikmalar")}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tighter text-foreground max-w-2xl">
            {td("Murakkab muammolarga")}{" "}
            <span className="text-muted">{td("zamonaviy yechimlar")}</span>
          </h2>
        </AnimatedItem>

        <div className="grid grid-cols-1 gap-px md:grid-cols-4 md:grid-rows-3 bg-card-border border border-card-border">
          {displaySkills.map((feature: any, idx: number) => {
            const spanClass =
              feature.span ||
              (idx === 0
                ? "md:col-span-2 md:row-span-2"
                : idx === 5
                ? "md:col-span-2 md:row-span-1"
                : "md:col-span-1 md:row-span-1");
            const indexLabel = feature.index || String(idx + 1).padStart(2, "0");

            return (
              <AnimatedItem key={idx} className={spanClass}>
                <div className="group h-full flex flex-col p-8 md:p-10 bg-card-bg/75 backdrop-blur-xl hover:bg-card-bg/90 transition-all duration-300 border border-card-border/80">
                  {/* Index label */}
                  <span className="font-mono text-[10px] text-muted uppercase tracking-widest mb-8">
                    — {indexLabel}
                  </span>
                  
                  {/* Icon */}
                  <div className="mb-6 flex h-12 w-12 items-center justify-center border border-card-border bg-card-bg group-hover:border-accent/30 transition-colors duration-300">
                    {feature.icon || getIcon(feature.iconName)}
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-xl font-bold text-foreground mb-3 tracking-tight">
                    {td(feature.title)}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed font-sans flex-1">
                    {td(feature.description)}
                  </p>

                  {/* Hover indicator */}
                  <div className="mt-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="h-px w-6 bg-accent" />
                    <span className="font-mono text-[10px] text-accent uppercase tracking-widest">
                      {td("Ko'proq")}
                    </span>
                  </div>
                </div>
              </AnimatedItem>
            );
          })}
        </div>
      </AnimatedSection>
    </section>
  );
};
