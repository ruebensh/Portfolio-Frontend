"use client";

import React, { useState, useEffect, useRef } from "react";

const CARD_GRADIENTS = [
  "linear-gradient(135deg, #18150c 0%, #090a10 50%, #221b0e 100%)",
  "linear-gradient(135deg, #091a14 0%, #06090e 50%, #0c2b21 100%)",
  "linear-gradient(135deg, #140d24 0%, #07060e 50%, #1c1135 100%)",
  "linear-gradient(135deg, #220e17 0%, #08060a 50%, #2d1221 100%)",
  "linear-gradient(135deg, #14171a 0%, #08090a 50%, #202428 100%)",
];

export interface ExperienceItem {
  id?: string | number;
  role?: string;
  title?: string;
  company?: string;
  year?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  stack?: string;
  cardNumber?: string;
  cvv?: string;
}

const MOCK_EXPERIENCE: ExperienceItem[] = [
  {
    role: "Senior AI / ML Engineer",
    company: "Devini AI Platform",
    year: "2024 — Hozir",
    description: "Sun'iy intellekt va LLM model arxitekturalari, CUDA optimallashtirish va asinxron Python backend.",
    stack: "Python • PyTorch • FastAPI • CUDA",
    cardNumber: "4232 8908 1121 4892",
    cvv: "382",
  },
  {
    role: "Python Backend & Systems Lead",
    company: "Data Science School 21",
    year: "2023 — 2024",
    description: "Yuqori yuklamali tarqoq tizimlar, Docker/Kubernetes klasterlari va mikroservis arxitektura.",
    stack: "Python • PostgreSQL • Redis • Docker",
    cardNumber: "4154 7831 9904 5124",
    cvv: "109",
  },
  {
    role: "Systems & Low-Level Dev",
    company: "Open Source Core Labs",
    year: "2022 — 2023",
    description: "C/C++ va Rust tillarida xotira xavfsizligi, algoritmlar optimallashtirish va Linux kernel bilan ishlash.",
    stack: "C/C++ • Rust • Linux • WebAssembly",
    cardNumber: "5457 4120 7733 9035",
    cvv: "764",
  },
  {
    role: "Full-Stack & Web Architect",
    company: "FinTech Innovation Lab",
    year: "2022 — Hozir",
    description: "Kinematik 3D veb interfeyslar, Next.js / React platformalar va xavfsiz FinTech modullari.",
    stack: "Next.js • TypeScript • Tailwind • Three.js",
    cardNumber: "4441 5567 1223 2468",
    cvv: "491",
  },
  {
    role: "AI Data Pipeline Specialist",
    company: "AI Vision & Analytics",
    year: "2021 — 2022",
    description: "Computer Vision modellari, neyron tarmoqlar (CNN/Transformer) va ma'lumotlar oqimini qayta ishlash.",
    stack: "TensorFlow • OpenCV • Scikit-learn • Kafka",
    cardNumber: "5375 8891 2234 7713",
    cvv: "255",
  },
];

import { useLanguage } from "@/context/LanguageContext";

export const ExperienceSection = ({ experience = [] }: { experience?: ExperienceItem[] }) => {
  const { td } = useLanguage();
  const items = experience && experience.length > 0 ? experience : MOCK_EXPERIENCE;
  const cardCount = items.length;
  const cardsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frameId = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Continuous scroll progress
  const progress = useRef<number>(0);

  // Track mouse coordinates for interactive 3D parallax tilt with inertia damping
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Responsive state containing card dimensions
  const [metrics, setMetrics] = useState({
    cardW: 360,
    cardH: 226, // 1.5925 standard credit card ratio
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const ry = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      mouse.current.targetX = Math.max(-1, Math.min(1, rx));
      mouse.current.targetY = Math.max(-1, Math.min(1, ry));
    };

    const handleMouseLeave = () => {
      mouse.current.targetX = 0;
      mouse.current.targetY = 0;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      let cardW = Math.round(w * 0.18 + 140);
      const heightFactor = Math.min(1.0, Math.max(0.65, h / 850));
      cardW = Math.round(cardW * heightFactor);
      cardW = Math.min(380, Math.max(180, cardW));
      const cardH = Math.round(cardW / 1.5925);

      setMetrics({ cardW, cardH });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Target progress for smooth click navigation
  const targetProgress = useRef<number | null>(null);

  const handleCardClick = (cardIdx: number) => {
    const currentP = progress.current;
    const currentBase = Math.round(currentP);

    let diff = cardIdx - ((currentBase % cardCount + cardCount) % cardCount);
    const half = cardCount / 2;
    while (diff > half) diff -= cardCount;
    while (diff < -half) diff += cardCount;

    targetProgress.current = currentBase + diff;
  };

  // Compute positions, rotations, and visual rules at 60-120fps
  const renderLoop = () => {
    if (targetProgress.current !== null) {
      const diff = targetProgress.current - progress.current;
      if (Math.abs(diff) > 0.002) {
        progress.current += diff * 0.032; // Silky smooth, calm transition on card click
      } else {
        progress.current = targetProgress.current;
        targetProgress.current = null;
      }
    } else {
      progress.current += 0.0007; // Calmer, luxury rotation speed
    }

    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.04;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.04;

    const cards = cardsRefs.current;
    const h = containerRef.current ? containerRef.current.clientHeight : window.innerHeight;
    const { cardH } = metrics;

    const continuousProgress = progress.current;
    const roundedIndex = Math.round(continuousProgress);
    const diffFromRound = continuousProgress - roundedIndex;

    const easedDiff = Math.sign(diffFromRound) * Math.pow(Math.abs(diffFromRound) * 2, 4.2) / 2;
    const virtualActiveIndex = roundedIndex + easedDiff;

    for (let i = 0; i < cardCount; i++) {
      const card = cards[i];
      if (!card) continue;

      let offset = i - virtualActiveIndex;
      const halfCount = cardCount / 2;
      while (offset > halfCount) offset -= cardCount;
      while (offset < -halfCount) offset += cardCount;

      const absOffset = Math.abs(offset);
      const sign = Math.sign(offset);

      if (absOffset > 3.0) {
        card.style.visibility = "hidden";
        continue;
      } else {
        card.style.visibility = "visible";
      }

      const gap = 36;
      const peekAmount = -55;
      const D = 1350;

      let y = 0;
      let z = 0;
      let rot = 0;

      if (absOffset <= 1) {
        const t = absOffset;
        const easedT = t * t * (3 - 2 * t);
        const targetY = cardH + gap;
        y = -sign * (easedT * targetY);
        z = 400 + easedT * (220 - 400);
        rot = easedT * 132;
      } else if (absOffset <= 2) {
        const t = absOffset - 1;
        const easedT = t * t * (3 - 2 * t);
        const yStart = cardH + gap;
        const zStart = 220;
        const rotStart = 132;
        const zEnd = -60;
        const rotEnd = 175;
        const sEnd = D / (D - zEnd);
        const yEnd = (h / 2 - peekAmount) / sEnd - (cardH / 2);
        const currentY = yStart + easedT * (yEnd - yStart);
        y = -sign * currentY;
        z = zStart + easedT * (zEnd - zStart);
        rot = rotStart + easedT * (rotEnd - rotStart);
      } else {
        const t = Math.min(absOffset - 2, 1);
        const easedT = t * t * (3 - 2 * t);
        const zStart = -60;
        const rotStart = 175;
        const zEnd3 = -250;
        const rotEnd3 = 195;
        const sEnd2 = D / (D - zStart);
        const yEnd2 = (h / 2 - peekAmount) / sEnd2 - (cardH / 2);
        const sEnd3 = D / (D - zEnd3);
        const yEnd3 = (h / 2 + 100) / sEnd3 + (cardH / 2);
        const currentY = yEnd2 + easedT * (yEnd3 - yEnd2);
        y = -sign * currentY;
        z = zStart + easedT * (zEnd3 - zStart);
        rot = rotStart + easedT * (rotEnd3 - rotStart);
      }

      const localCardRotation = -sign * rot;
      const centerFactor = Math.max(0, 1 - absOffset);

      const maxTiltY = 15;
      const maxTiltX = 12;

      const activeTiltX = -mouse.current.y * maxTiltX * centerFactor;
      const activeTiltY = mouse.current.x * maxTiltY * centerFactor;

      const totalRotX = localCardRotation + activeTiltX;
      const totalRotY = activeTiltY;

      card.style.zIndex = Math.round(z).toString();
      card.style.opacity = "1";
      card.style.transform = `translateY(${y.toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateX(${totalRotX.toFixed(2)}deg) rotateY(${totalRotY.toFixed(2)}deg) rotateZ(-3deg)`;
    }
  };

  useEffect(() => {
    let isVisible = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const tick = () => {
      if (isVisible) {
        renderLoop();
      }
      frameId.current = requestAnimationFrame(tick);
    };

    frameId.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameId.current);
      observer.disconnect();
    };
  }, [metrics]);

  const thicknessLayers = [-1.47, -0.73, 0, 0.73, 1.47];

  // Dynamically resolve backend experience or fallback to MOCK_EXPERIENCE
  const getItemDetails = (idx: number): ExperienceItem => {
    const rawItem = items[idx % items.length];
    const fallback = MOCK_EXPERIENCE[idx % MOCK_EXPERIENCE.length];

    const yearFormatted = rawItem.year || (rawItem.startDate
      ? `${new Date(rawItem.startDate).getFullYear()} — ${rawItem.endDate ? new Date(rawItem.endDate).getFullYear() : "Hozir"}`
      : fallback.year);

    return {
      role: rawItem.role || rawItem.title || fallback.role,
      company: rawItem.company || fallback.company,
      year: yearFormatted,
      description: rawItem.description || fallback.description,
      stack: rawItem.stack || fallback.stack,
      cardNumber: rawItem.cardNumber || fallback.cardNumber,
      cvv: rawItem.cvv || fallback.cvv,
    };
  };

  return (
    <section id="experience" className="relative w-full border-t border-card-border overflow-hidden">
      {/* Header */}
      <div className="relative z-20 text-center pt-16 pb-4 px-6 pointer-events-none">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent border border-accent/40 px-5 py-1.5 rounded-full bg-card-bg/75 backdrop-blur-xl shadow-sm">
          — {td("Ish Tajribam")} —
        </span>
        <h2 className="heading-gradient-gold font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mt-4">
          {td("Tajriba va Amaliyot")}
        </h2>
      </div>

      {/* 3D Cylinder Carousel Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[640px] sm:h-[720px] text-white flex items-center justify-center overflow-hidden select-none"
      >
        {/* 3D perspective camera space */}
        <div
          className="relative w-full h-full flex items-center justify-center pointer-events-none"
          style={{ perspective: "1350px" }}
        >
          {/* Dynamic 3D coordinate viewport */}
          <div
            className="absolute"
            style={{
              width: `${metrics.cardW}px`,
              height: `${metrics.cardH}px`,
              transformStyle: "preserve-3d",
            }}
          >
            {Array.from({ length: cardCount }).map((_, i) => {
              const expItem = getItemDetails(i);

              return (
                <div
                  key={i}
                  ref={(el) => { cardsRefs.current[i] = el; }}
                  onClick={() => handleCardClick(i)}
                  className="absolute inset-0 cursor-pointer pointer-events-auto hover:brightness-115 transition-[filter] duration-300"
                  style={{
                    width: `${metrics.cardW}px`,
                    height: `${metrics.cardH}px`,
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "visible",
                    willChange: "transform",
                  }}
                >
                  {/* Build physical 3D volumetric thickness by dense parallel layering */}
                  {thicknessLayers.map((zOffset, layerIdx) => {
                    const isFrontFace = layerIdx === thicknessLayers.length - 1;
                    const isBackFace = layerIdx === 0;
                    const baseBgColor = "#0f0f0f";

                    // Middle structural slice
                    if (!isFrontFace && !isBackFace) {
                      return (
                        <div
                          key={layerIdx}
                          className="absolute inset-0 rounded-[18px] border border-[#808080] pointer-events-none overflow-hidden"
                          style={{
                            backgroundColor: "#808080",
                            transform: `translateZ(${zOffset}px)`,
                          }}
                        />
                      );
                    }

                    // Front face slice — Prominently displaying Role, Company & Stack
                    if (isFrontFace) {
                      const cardGrad = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
                      const frontBorderStyle = "border border-white/20";

                      return (
                        <div
                          key={layerIdx}
                          className={`absolute inset-0 rounded-[18px] ${frontBorderStyle} pointer-events-none overflow-hidden`}
                          style={{
                            background: cardGrad,
                            transform: `translateZ(${zOffset}px)`,
                            backfaceVisibility: "hidden",
                            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.25), 0 20px 45px rgba(0,0,0,0.85)",
                          }}
                        >
                          {/* Carbon grid texture overlay */}
                          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:14px_14px] opacity-40 pointer-events-none" />

                          {/* Glowing Ambient Mesh Spot */}
                          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
                          <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

                          {/* Content overlay */}
                          <div className="relative z-10 p-5 sm:p-6 text-white h-full w-full font-sans flex flex-col justify-between">
                            {/* Top row: Metallic Chip & Year badge */}
                            <div className="flex items-center justify-between">
                              {/* Metallic Contact Chip */}
                              <div className="w-8 h-8 sm:w-[32px] sm:h-[32px]">
                                <svg viewBox="0 0 60 60" fill="none" className="w-full h-full">
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M20 8H40V14C40.0016 14.5299 40.2128 15.0377 40.5875 15.4125C40.9623 15.7872 41.4701 15.9984 42 16H59V24H42C41.4701 24.0016 40.9623 24.2128 40.5875 24.5875C40.2128 24.9623 40.0016 25.4701 40 26V52H20V8ZM18 8H8.00039C4.47435 8 1.56576 10.6083 1.08 14H18V8ZM1 16V24V26V34V36V44H18V36H1V34H18V26H1V24H18V16H1ZM1.08 46C1.56576 49.3917 4.47435 52 8.00039 52H18V46H1.08ZM42 14V8H52.0004C55.5264 8 58.4342 10.6084 58.92 14H42ZM59 26H42V34H59V26ZM59 36H42V44H59V36ZM52.0004 52H42V46H58.92C58.4342 49.3916 55.5264 52 52.0004 52Z"
                                    fill={`url(#chipGrad_${i})`}
                                  />
                                  <defs>
                                    <linearGradient id={`chipGrad_${i}`} x1="30" y1="8" x2="30" y2="52" gradientUnits="userSpaceOnUse">
                                      <stop stopColor="#F4C95D" />
                                      <stop offset="1" stopColor="#8A6B29" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                              </div>

                              {/* Year badge */}
                              <span className="font-mono text-[10px] sm:text-xs font-bold tracking-widest text-accent border border-accent/40 bg-black/70 px-3 py-1 rounded-full shadow-[0_0_12px_rgba(244,201,93,0.35)]">
                                {expItem.year}
                              </span>
                            </div>

                            {/* Middle: Role Title & Company Name */}
                            <div className="my-auto pt-2">
                              <p className="font-mono text-[10px] uppercase tracking-widest text-accent/90 mb-0.5 font-bold">
                                {td(expItem.company)}
                              </p>
                              <h3 className="font-display text-base sm:text-lg font-bold text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                                {td(expItem.role)}
                              </h3>
                            </div>

                            {/* Bottom row: Tech Stack & Brand circles */}
                            <div className="flex items-end justify-between border-t border-white/15 pt-2.5">
                              <p className="font-mono text-[9px] sm:text-[10px] text-gray-300 tracking-wide font-medium">
                                {expItem.stack}
                              </p>
                              {/* Intersecting circle brand logo */}
                              <div className="flex -space-x-2 items-center opacity-90">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-accent/40 backdrop-blur-[1px] border border-accent/50" />
                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-accent/80 backdrop-blur-[1px] border border-accent/80" />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Back face slice — Detailed Experience Description & Credentials
                    if (isBackFace) {
                      const cardGrad = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
                      const backBorderStyle = "border border-white/20";
                      return (
                        <div
                          key={layerIdx}
                          className={`absolute inset-0 rounded-[18px] ${backBorderStyle} pointer-events-none overflow-hidden`}
                          style={{
                            background: cardGrad,
                            transform: `translateZ(${zOffset}px) rotateX(180deg)`,
                            backfaceVisibility: "hidden",
                            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2)",
                          }}
                        >
                          {/* Texture overlay */}
                          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:14px_14px] opacity-30 pointer-events-none" />

                          {/* Magnetic stripe */}
                          <div className="absolute left-0 right-0 top-3 sm:top-4 h-6 sm:h-8 bg-black/95 backdrop-blur-md z-10 border-b border-accent/30" />

                          {/* Content Container */}
                          <div className="absolute inset-0 pt-12 p-4 sm:p-5 flex flex-col justify-between z-20 text-left bg-black/70 backdrop-blur-md">
                            {/* Description text */}
                            <div>
                              <p className="font-mono text-[9px] uppercase tracking-widest text-accent mb-1">
                                {td("Vazifalar & Yutuqlar")}
                              </p>
                              <p className="font-sans text-xs sm:text-xs text-foreground/90 leading-snug line-clamp-3 font-medium">
                                {td(expItem.description)}
                              </p>
                            </div>

                            {/* Cardholder info at bottom */}
                            <div className="border-t border-white/10 pt-2 flex items-center justify-between font-mono">
                              <div>
                                <p className="text-[10px] font-bold text-white tracking-widest uppercase">
                                  {expItem.role}
                                </p>
                                <p className="text-[8px] text-accent/80 tracking-wider">
                                  JALOLIDDIN XALIMOV • {expItem.cardNumber}
                                </p>
                              </div>
                              <span className="text-[9px] text-white/50 bg-white/10 px-2 py-0.5 rounded border border-white/10">
                                CVV {expItem.cvv}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
