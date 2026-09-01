"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { EyebrowBadge } from "@/components/ui/EyebrowBadge";
import { CaretLeft, CaretRight, Download, Pause, Play } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

const resumeUrl = "/Jaloliddin_Xalimov_CV.pdf";
const portfolioPdfUrl = "/Jaloliddin_Xalimov_Portfolio.pdf";
const SLIDE_COUNT = 11;
const slides = Array.from({ length: SLIDE_COUNT }, (_, i) => `/portfolio-slides/${i + 1}.png`);

type Mode = "cv" | "portfolio";

export default function ResumePage() {
  const [mode, setMode] = useState<Mode>("portfolio");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((s) => (s + 1) % SLIDE_COUNT);
  };
  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((s) => (s - 1 + SLIDE_COUNT) % SLIDE_COUNT);
  };

  useEffect(() => {
    if (!isPlaying || mode !== "portfolio") return;
    intervalRef.current = setInterval(nextSlide, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, mode, currentSlide]);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 600 : -600, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -600 : 600, opacity: 0 }),
  };

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto p-6 sm:p-10 md:p-12 rounded-3xl border border-card-border/80 bg-card-bg/60 backdrop-blur-xl shadow-2xl">
        <AnimatedSection>
          <AnimatedItem className="mb-10">
            <EyebrowBadge className="mb-4">Hujjatlar</EyebrowBadge>
            <h1 className="heading-gradient-rose text-4xl md:text-6xl font-bold tracking-tighter mb-4">
              Resume & Portfolio
            </h1>
          </AnimatedItem>

          {/* Mode Switcher */}
          <AnimatedItem className="mb-10">
            <div className="flex gap-3">
              <button
                onClick={() => setMode("portfolio")}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${
                  mode === "portfolio"
                    ? "bg-accent text-accent-foreground border-accent shadow-sm"
                    : "card-surface-nested text-muted hover:border-accent/40"
                }`}
              >
                Portfolio Slides
              </button>
              <button
                onClick={() => setMode("cv")}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${
                  mode === "cv"
                    ? "bg-accent text-accent-foreground border-accent shadow-sm"
                    : "card-surface-nested text-muted hover:border-accent/40"
                }`}
              >
                CV (PDF)
              </button>
            </div>
          </AnimatedItem>

          {mode === "portfolio" ? (
            <AnimatedItem>
              <div className="card-surface overflow-hidden">
                {/* Slide viewer */}
                <div
                  className="relative aspect-video card-surface-nested overflow-hidden border-0"
                  onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                  onTouchEnd={(e) => {
                    if (touchStartX.current == null) return;
                    const diff = touchStartX.current - e.changedTouches[0].clientX;
                    if (diff > 50) nextSlide();
                    else if (diff < -50) prevSlide();
                    touchStartX.current = null;
                  }}
                >
                  <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                      key={currentSlide}
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={slides[currentSlide]}
                        alt={`Slide ${currentSlide + 1}`}
                        fill
                        className="object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between p-5 border-t border-card-border">
                  <div className="flex items-center gap-2">
                    <button onClick={prevSlide} className="w-9 h-9 rounded-xl card-surface-nested text-foreground flex items-center justify-center hover:bg-accent/10 hover:border-accent transition-colors">
                      <CaretLeft size={18} />
                    </button>
                    <button onClick={() => setIsPlaying(!isPlaying)} className="w-9 h-9 rounded-xl card-surface-nested text-foreground flex items-center justify-center hover:bg-accent/10 hover:border-accent transition-colors">
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button onClick={nextSlide} className="w-9 h-9 rounded-xl card-surface-nested text-foreground flex items-center justify-center hover:bg-accent/10 hover:border-accent transition-colors">
                      <CaretRight size={18} />
                    </button>
                  </div>

                  <span className="text-sm text-muted font-mono">
                    {currentSlide + 1} / {SLIDE_COUNT}
                  </span>

                  <a href={portfolioPdfUrl} download className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                    <Download size={16} /> PDF Yuklab olish
                  </a>
                </div>

                {/* Slide dots */}
                <div className="flex justify-center gap-1.5 pb-4">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setDirection(i > currentSlide ? 1 : -1); setCurrentSlide(i); }}
                      className={`transition-all rounded-full ${i === currentSlide ? "w-5 h-2 bg-accent" : "w-2 h-2 bg-muted/40 hover:bg-muted"}`}
                    />
                  ))}
                </div>
              </div>
            </AnimatedItem>
          ) : (
            <AnimatedItem>
              <div className="card-surface overflow-hidden">
                <iframe
                  src={`${resumeUrl}#toolbar=0`}
                  className="w-full"
                  style={{ height: "80vh" }}
                  title="CV"
                />
                <div className="p-5 border-t border-card-border flex justify-end">
                  <a href={resumeUrl} download className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                    <Download size={16} /> CV Yuklab Olish
                  </a>
                </div>
              </div>
            </AnimatedItem>
          )}
        </AnimatedSection>
      </div>
    </main>
  );
}
