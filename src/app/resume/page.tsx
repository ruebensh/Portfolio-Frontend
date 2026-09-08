"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { EyebrowBadge } from "@/components/ui/EyebrowBadge";
import {
  CaretLeft,
  CaretRight,
  Download,
  Pause,
  Play,
  ArrowsOut,
  X,
  ArrowSquareOut,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  FilePdf,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

const resumeUrl = "/Jaloliddin_Xalimov_CV.pdf";
const cvPreviewImage = "/cv-page-1.webp";
const portfolioPdfUrl = "/Jaloliddin_Xalimov_Portfolio.pdf";
const SLIDE_COUNT = 11;
const slides = Array.from({ length: SLIDE_COUNT }, (_, i) => `/portfolio-slides/${i + 1}.png`);

type Mode = "cv" | "portfolio";

export default function ResumePage() {
  const [mode, setMode] = useState<Mode>("portfolio");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreenCv, setIsFullscreenCv] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
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
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, mode, currentSlide]);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 600 : -600, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -600 : 600, opacity: 0 }),
  };

  return (
    <main className="min-h-screen pt-20 sm:pt-24 pb-16 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto p-4 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl border border-card-border/80 bg-card-bg/60 backdrop-blur-xl shadow-2xl">
        <AnimatedSection>
          <AnimatedItem className="mb-6 sm:mb-10">
            <EyebrowBadge className="mb-3 sm:mb-4">Hujjatlar</EyebrowBadge>
            <h1 className="heading-gradient-rose text-3xl sm:text-4xl md:text-6xl font-bold tracking-tighter mb-4">
              Resume & Portfolio
            </h1>
          </AnimatedItem>

          {/* Mode Switcher */}
          <AnimatedItem className="mb-6 sm:mb-10">
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              <button
                onClick={() => setMode("portfolio")}
                className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all border text-center ${
                  mode === "portfolio"
                    ? "bg-accent text-accent-foreground border-accent shadow-sm"
                    : "card-surface-nested text-muted hover:border-accent/40"
                }`}
              >
                Portfolio Slides
              </button>
              <button
                onClick={() => setMode("cv")}
                className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all border text-center ${
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
              <div className="card-surface overflow-hidden rounded-xl sm:rounded-2xl">
                {/* Slide viewer */}
                <div
                  className="relative aspect-video card-surface-nested overflow-hidden border-0"
                  onTouchStart={(e) => {
                    touchStartX.current = e.touches[0].clientX;
                  }}
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
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-t border-card-border">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevSlide}
                      className="w-9 h-9 rounded-xl card-surface-nested text-foreground flex items-center justify-center hover:bg-accent/10 hover:border-accent transition-colors"
                      aria-label="Previous slide"
                    >
                      <CaretLeft size={18} />
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-9 h-9 rounded-xl card-surface-nested text-foreground flex items-center justify-center hover:bg-accent/10 hover:border-accent transition-colors"
                      aria-label={isPlaying ? "Pause autoplay" : "Start autoplay"}
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button
                      onClick={nextSlide}
                      className="w-9 h-9 rounded-xl card-surface-nested text-foreground flex items-center justify-center hover:bg-accent/10 hover:border-accent transition-colors"
                      aria-label="Next slide"
                    >
                      <CaretRight size={18} />
                    </button>
                  </div>

                  <span className="text-xs sm:text-sm text-muted font-mono">
                    {currentSlide + 1} / {SLIDE_COUNT}
                  </span>

                  <a
                    href={portfolioPdfUrl}
                    download
                    className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <Download size={16} /> PDF Yuklab olish
                  </a>
                </div>

                {/* Slide dots */}
                <div className="flex justify-center gap-1.5 pb-4">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setDirection(i > currentSlide ? 1 : -1);
                        setCurrentSlide(i);
                      }}
                      className={`transition-all rounded-full ${
                        i === currentSlide ? "w-5 h-2 bg-accent" : "w-2 h-2 bg-muted/40 hover:bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </AnimatedItem>
          ) : (
            <AnimatedItem>
              <div className="card-surface overflow-hidden rounded-xl sm:rounded-2xl">
                {/* Document Top Bar */}
                <div className="p-3 sm:p-4 bg-card-surface-nested border-b border-card-border flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <FilePdf size={18} className="text-accent" />
                    <span className="font-medium text-foreground">Jaloliddin_Xalimov_CV.pdf</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsFullscreenCv(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors font-medium text-xs"
                    >
                      <ArrowsOut size={14} /> Kattalashtirish
                    </button>
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg card-surface-nested hover:border-accent/40 text-foreground transition-colors font-medium text-xs"
                    >
                      <ArrowSquareOut size={14} /> Yangi oynada ochish
                    </a>
                  </div>
                </div>

                {/* Main Responsive CV View */}
                <div className="relative bg-neutral-900/90 p-2 sm:p-6 md:p-8 flex justify-center items-center min-h-[450px] sm:min-h-[650px] overflow-x-auto">
                  <div
                    onClick={() => setIsFullscreenCv(true)}
                    className="relative cursor-pointer group max-w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white transition-transform duration-300 hover:scale-[1.005]"
                  >
                    <Image
                      src={cvPreviewImage}
                      alt="Jaloliddin Xalimov CV Document Preview"
                      width={1819}
                      height={2573}
                      className="w-full h-auto max-w-full md:max-w-[850px] object-contain mx-auto"
                      priority
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/80 text-white text-xs sm:text-sm font-medium border border-white/20 shadow-xl">
                        <ArrowsOut size={16} /> Kattalashtirib ko'rish uchun bosing
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Toolbar */}
                <div className="p-4 sm:p-5 border-t border-card-border flex flex-wrap items-center justify-between gap-3 bg-card-bg">
                  <div className="text-xs text-muted flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Hujjat responsiv tayyor (PDF)</span>
                  </div>

                  <a
                    href={resumeUrl}
                    download
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity shadow-md"
                  >
                    <Download size={16} /> CV (PDF) Yuklab Olish
                  </a>
                </div>
              </div>
            </AnimatedItem>
          )}
        </AnimatedSection>
      </div>

      {/* Lightbox / Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreenCv && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between"
          >
            {/* Top Modal Bar */}
            <div className="p-3 sm:p-4 bg-black/70 border-b border-white/10 flex items-center justify-between gap-4 z-10">
              <div className="flex items-center gap-2 text-white text-xs sm:text-sm font-medium truncate">
                <FilePdf size={20} className="text-rose-400 shrink-0" />
                <span className="truncate">Jaloliddin Xalimov CV</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                  title="Kichiklashtirish"
                >
                  <MagnifyingGlassMinus size={16} />
                </button>
                <span className="text-xs text-white/80 font-mono px-1">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                  title="Kattalashtirish"
                >
                  <MagnifyingGlassPlus size={16} />
                </button>
                <a
                  href={resumeUrl}
                  download
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-medium hover:opacity-90"
                >
                  <Download size={14} /> Yuklab olish
                </a>
                <button
                  onClick={() => {
                    setIsFullscreenCv(false);
                    setZoomLevel(1);
                  }}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 text-white flex items-center justify-center hover:bg-rose-500/80 transition-colors ml-1"
                  title="Yopish"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Image Area */}
            <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center">
              <div
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}
                className="transition-transform duration-200 max-w-full my-auto"
              >
                <Image
                  src={cvPreviewImage}
                  alt="Full CV"
                  width={1819}
                  height={2573}
                  className="max-w-full h-auto rounded-lg shadow-2xl border border-white/20 object-contain mx-auto"
                />
              </div>
            </div>

            {/* Bottom Modal Bar */}
            <div className="p-3 bg-black/80 border-t border-white/10 flex items-center justify-center gap-3">
              <a
                href={resumeUrl}
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Download size={16} /> CV (PDF) Yuklab Olish
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
