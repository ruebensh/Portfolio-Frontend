"use client";

import React, { useRef, useCallback } from "react";
import { ScrollScene } from "../core/ScrollScene";
import { FrameSequenceCanvas, FrameSequenceCanvasRef } from "../core/FrameSequenceCanvas";
import { EyebrowBadge } from "@/components/ui/EyebrowBadge";
import { useLanguage } from "@/context/LanguageContext";

const SKILL_FRAME_START = 24;
const SKILL_FRAME_END = 97;
const SKILL_FRAME_COUNT = SKILL_FRAME_END - SKILL_FRAME_START + 1;

function normalizeSkillCategories(skills: any[]) {
  if (!Array.isArray(skills) || skills.length === 0) return [];

  if (skills.some((s) => s && (Array.isArray(s.items) || s.category))) {
    return skills.map((cat, idx) => {
      const title = cat.category || cat.title || cat.name || "Category";
      let items: any[] = [];
      if (Array.isArray(cat.items)) {
        items = cat.items;
      } else {
        items = [{ name: cat.name || cat.title || title, level: cat.level ?? 80 }];
      }
      return {
        id: String(cat.id || idx + 1),
        title,
        items,
      };
    });
  }

  const map: Record<string, any[]> = {};
  skills.forEach((s) => {
    const cat = s.category || "General";
    if (!map[cat]) map[cat] = [];
    map[cat].push(s);
  });

  return Object.entries(map).map(([title, items], idx) => ({
    id: String(idx + 1),
    title,
    items,
  }));
}

const DEFAULT_CATEGORIES = [
  {
    id: "1",
    title: "Data Science",
    items: [
      { name: "Python", level: 70 },
      { name: "Pandas", level: 65 },
      { name: "NumPy", level: 63 },
      { name: "Data Visualization", level: 55 },
      { name: "Jupyter Notebook", level: 70 },
    ],
  },
  {
    id: "2",
    title: "Machine Learning / AI",
    items: [
      { name: "PyTorch", level: 50 },
      { name: "scikit-learn", level: 60 },
      { name: "Neural Networks", level: 45 },
      { name: "CNNs", level: 45 },
      { name: "RNNs", level: 40 },
      { name: "Clustering", level: 55 },
      { name: "AI/LLM Integration", level: 40 },
    ],
  },
  {
    id: "3",
    title: "Tools & Deployment",
    items: [
      { name: "Docker", level: 40 },
      { name: "Nginx", level: 30 },
      { name: "Oracle Cloud", level: 50 },
      { name: "Git/GitHub", level: 80 },
    ],
  },
  {
    id: "4",
    title: "Frontend",
    items: [
      { name: "React", level: 19 },
      { name: "TypeScript", level: 21 },
      { name: "HTML/CSS", level: 32 },
      { name: "Tailwind CSS", level: 10 },
    ],
  },
];

export const SkillsSection = ({ skills = [] }: { skills?: any[] }) => {
  const { td } = useLanguage();
  const canvasRef  = useRef<FrameSequenceCanvasRef>(null);
  const catCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barRefs    = useRef<Record<string, HTMLDivElement | null>>({});

  const normalized = normalizeSkillCategories(skills);
  const displayCats = normalized.length > 0 ? normalized : DEFAULT_CATEGORIES;

  const handleProgress = useCallback((progress: number) => {
    if (canvasRef.current) {
      canvasRef.current.drawProgress(progress);
    }

    const catCount = displayCats.length;
    if (catCount === 0) return;

    displayCats.forEach((cat, catIdx) => {
      const cardEl = catCardRefs.current[catIdx];
      
      // Calculate start and end threshold for each category card sequence
      const startThreshold = (catIdx / catCount) * 0.75;
      const endThreshold   = startThreshold + 0.25;

      let cardOpacity = 0;
      if (progress >= startThreshold) {
        cardOpacity = Math.min(1, (progress - startThreshold) / 0.10);
      }

      if (cardEl) {
        cardEl.style.opacity = cardOpacity.toString();
        cardEl.style.transform = `translateY(${(1 - cardOpacity) * 35}px) scale(${0.94 + 0.06 * cardOpacity})`;
      }

      // Animate progress bars for items in this category
      cat.items.forEach((item: any, itemIdx: number) => {
        const barKey = `${catIdx}-${itemIdx}`;
        const barEl  = barRefs.current[barKey];
        if (!barEl) return;

        const level = typeof item === "object" ? (item.level ?? 80) : 80;
        let fill = 0;
        if (progress > startThreshold) {
          fill = Math.min(1, Math.max(0, (progress - startThreshold) / (endThreshold - startThreshold)));
        }
        barEl.style.width = `${(fill * level).toFixed(1)}%`;
      });
    });
  }, [displayCats]);

  return (
    <>
      {/* Desktop 3D Frame Sequence (MD and up) */}
      <div className="hidden md:block">
        <ScrollScene height="450vh" onProgress={handleProgress} id="skills" className="bg-[#050505] text-white">
          <FrameSequenceCanvas
            ref={canvasRef}
            frameCount={SKILL_FRAME_COUNT}
            framePath={(idx) => {
              const normalized = Math.max(1, Math.min(SKILL_FRAME_COUNT, idx));
              const frameNum = Math.round(
                SKILL_FRAME_START +
                  ((normalized - 1) / Math.max(1, SKILL_FRAME_COUNT - 1)) *
                  (SKILL_FRAME_END - SKILL_FRAME_START)
              );
              return `/skill-frames/frame_${String(frameNum).padStart(4, "0")}.jpg`;
            }}
            className="opacity-50"
          />

          <div className="absolute inset-0 z-20 flex flex-col justify-between p-8 md:p-14">
            <div className="text-center max-w-2xl mx-auto pt-6">
              <EyebrowBadge className="mb-3">{td("TEXNIK ARSENALIM")}</EyebrowBadge>
              <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-2">
                {td("Ko'nikmalar va Texnologiyalar")}
              </h2>
              <p className="font-sans text-muted text-sm max-w-md mx-auto">
                {td("Ko'nikmalarim va texnologiyalar bo'yicha bilim va darajalarim")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full pb-8">
              {displayCats.map((cat, catIdx) => {
                const items = cat.items || [];
                return (
                  <div
                    key={cat.id || catIdx}
                    ref={(el) => { catCardRefs.current[catIdx] = el; }}
                    className="card-surface p-6 rounded-3xl border border-white/15 bg-[#0a0a14]/85 backdrop-blur-2xl shadow-xl hover:border-accent/40 transition-all duration-300"
                    style={{ opacity: 0, transform: "translateY(35px) scale(0.94)" }}
                  >
                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                      <h3 className="font-display text-lg font-bold text-white tracking-wide">
                        {cat.title}
                      </h3>
                      <span className="font-mono text-[10px] text-accent font-bold bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-md uppercase">
                        0{catIdx + 1}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-none">
                      {items.map((item: any, itemIdx: number) => {
                        const itemName = typeof item === "string" ? item : (item.name || item.title || "");
                        const level = typeof item === "object" ? (item.level ?? 80) : 80;
                        const barKey = `${catIdx}-${itemIdx}`;

                        return (
                          <div key={item.id || itemIdx} className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-mono text-white/90 font-medium truncate max-w-[75%]">
                                {itemName}
                              </span>
                              <span className="font-mono text-accent font-bold text-[10px]">
                                {level}%
                              </span>
                            </div>

                            <div className="relative h-2.5 w-full rounded-full overflow-hidden"
                                 style={{ background: "rgba(255,255,255,0.07)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}>
                              <div
                                ref={(el) => { barRefs.current[barKey] = el; }}
                                className="h-full rounded-full"
                                style={{
                                  width: "0%",
                                  background: "linear-gradient(90deg, #7c3aed 0%, #a855f7 50%, #f4c95d 100%)",
                                  boxShadow: "0 0 8px rgba(168,85,247,0.7), 0 0 16px rgba(244,201,93,0.3)",
                                  transition: "width 0.1s linear",
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollScene>
      </div>

      {/* Mobile Sleek Static Skills Grid (MD down) */}
      <section className="block md:hidden py-16 px-5 bg-transparent">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <EyebrowBadge className="mb-2">{td("TEXNIK ARSENALIM")}</EyebrowBadge>
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              {td("Ko'nikmalar va Texnologiyalar")}
            </h2>
            <p className="font-sans text-muted text-xs">
              {td("Ko'nikmalarim va texnologiyalar bo'yicha bilim va darajalarim")}
            </p>
          </div>

          <div className="space-y-5">
            {displayCats.map((cat, catIdx) => {
              const items = cat.items || [];
              return (
                <div
                  key={cat.id || catIdx}
                  className="card-surface p-5 rounded-2xl border border-white/15 bg-[#0f0f1b]/90 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2.5">
                    <h3 className="font-display text-base font-bold text-white tracking-wide">
                      {cat.title}
                    </h3>
                    <span className="font-mono text-[9px] text-accent font-bold bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-md uppercase">
                      0{catIdx + 1}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {items.map((item: any, itemIdx: number) => {
                      const itemName = typeof item === "string" ? item : (item.name || item.title || "");
                      const level = typeof item === "object" ? (item.level ?? 80) : 80;

                      return (
                        <div key={item.id || itemIdx} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono text-white/90 font-medium truncate max-w-[75%]">
                              {itemName}
                            </span>
                            <span className="font-mono text-accent font-bold text-[10px]">
                              {level}%
                            </span>
                          </div>

                          <div className="relative h-2 w-full rounded-full overflow-hidden bg-white/10">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${level}%`,
                                background: "linear-gradient(90deg, #7c3aed 0%, #a855f7 50%, #f4c95d 100%)",
                                boxShadow: "0 0 8px rgba(168,85,247,0.7)",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};
