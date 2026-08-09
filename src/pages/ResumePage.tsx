import { useState, useEffect, useRef } from "react";
import { 
  FileDown, 
  ArrowLeft, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Columns, 
  FileText, 
  Presentation,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "../lib/router";

export function ResumePage() {
  const resumeUrl = "/Jaloliddin_Xalimov_CV.pdf";
  const portfolioPdfUrl = "/Jaloliddin_Xalimov_Portfolio.pdf";

  // Slaydlar ro'yxati (public/portfolio-slides/1.png ... 11.png)
  const [slides] = useState<string[]>(
    Array.from({ length: 11 }, (_, i) => `/portfolio-slides/${i + 1}.png`)
  );

  const [[currentSlide, direction], setSlideState] = useState<[number, number]>([0, 1]);
  const [isPlaying, setIsPlaying] = useState(true);
  // Mobile: default tab "cv", desktop: "split"
  const [activeTab, setActiveTab] = useState<"split" | "cv" | "portfolio">("split");
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setSlideState(([prev]) => [(prev + 1) % slides.length, 1]);
  };

  const prevSlide = () => {
    setSlideState(([prev]) => [(prev - 1 + slides.length) % slides.length, -1]);
  };

  const goToSlide = (index: number) => {
    setSlideState(([prev]) => [index, index > prev ? 1 : -1]);
  };

  // Touch/Swipe boshqaruv
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPlaying(false);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = (touchStartX.current ?? 0) - (touchEndX.current ?? 0);
    if (Math.abs(diff) > 40) {
      diff > 0 ? nextSlide() : prevSlide();
    }
    setIsPlaying(true);
  };

  // 5 soniyali avto-slayd shou
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, slides.length]);

  // Klaviatura o'qlari bilan boshqarish (faqat desktop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      else if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  // Slayd o'tish effektlari
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.97,
      filter: "blur(3px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        x: { type: "spring", stiffness: 260, damping: 28 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
        filter: { duration: 0.25 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 80 : -80,
      opacity: 0,
      scale: 0.97,
      filter: "blur(3px)",
      transition: {
        x: { type: "spring", stiffness: 260, damping: 28 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
        filter: { duration: 0.15 },
      },
    }),
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-16 sm:pt-20 pb-6 px-3 sm:px-6 flex flex-col font-sans">
      <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col gap-3">

        {/* ===== TOP NAV PANEL ===== */}
        <div className="flex flex-wrap justify-between items-center bg-white/5 p-2.5 sm:p-3 rounded-2xl border border-white/10 backdrop-blur-xl gap-2 sm:gap-4 shadow-2xl">

          {/* Orqaga qaytish */}
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-white transition-all group px-2.5 sm:px-3.5 py-2 rounded-xl hover:bg-white/5 text-xs sm:text-sm"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium hidden xs:inline">Asosiyga qaytish</span>
            <span className="font-medium xs:hidden">Orqaga</span>
          </Link>

          {/* Desktop: Ko'rish Rejimlari */}
          <div className="hidden lg:flex items-center bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
            {[
              { id: "split", label: "Split View", icon: <Columns size={13} /> },
              { id: "cv", label: "CV Only", icon: <FileText size={13} /> },
              { id: "portfolio", label: "Portfolio", icon: <Presentation size={13} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Yuklab olish tugmalari */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <a
              href={resumeUrl}
              download
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl font-semibold border border-white/10 transition-all text-xs active:scale-95"
            >
              <FileDown size={14} />
              <span className="hidden sm:inline">CV (PDF)</span>
              <span className="sm:hidden">CV</span>
            </a>
            <a
              href={portfolioPdfUrl}
              download
              className="flex items-center gap-1.5 px-3 sm:px-5 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/25 transition-all text-xs"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Portfolio (PDF)</span>
              <span className="sm:hidden">PDF</span>
            </a>
          </div>
        </div>

        {/* ===== MOBILE TAB SWITCHER (sm dan pastda) ===== */}
        <div className="flex lg:hidden bg-white/5 p-1 rounded-xl border border-white/10 text-xs gap-1">
          <button
            onClick={() => setActiveTab("cv")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === "cv" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground"
            }`}
          >
            <FileText size={13} /> CV Hujjat
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === "portfolio" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground"
            }`}
          >
            <Presentation size={13} /> Portfolio
          </button>
        </div>

        {/* ===== ASOSIY KONTENT ===== */}
        <div className={`flex-1 w-full grid gap-3 sm:gap-4 ${
          activeTab === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        }`}>

          {/* ===== CHAP: CV PDF VIEWER ===== */}
          {(activeTab === "split" || activeTab === "cv") && (
            <div className="flex flex-col rounded-2xl border border-white/10 overflow-hidden bg-[#141414] shadow-2xl">
              {/* CV Header */}
              <div className="bg-white/5 px-3 sm:px-4 py-2.5 border-b border-white/10 flex justify-between items-center text-xs text-muted-foreground flex-shrink-0">
                <span className="flex items-center gap-1.5 font-mono text-white/80 truncate">
                  <FileText size={13} className="text-primary flex-shrink-0" />
                  <span className="truncate">CV.pdf</span>
                </span>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center gap-1 flex-shrink-0 ml-2"
                >
                  <Maximize2 size={12} />
                  <span className="hidden sm:inline">To'liq oynada</span>
                </a>
              </div>
              {/* PDF iframe */}
              <div className="flex-1 w-full">
                <iframe
                  src={`${resumeUrl}#view=FitH&navpanes=0&toolbar=0`}
                  className="w-full border-none block"
                  style={{ height: activeTab === "cv" ? "calc(100vh - 220px)" : "min(60vh, 560px)", minHeight: "350px" }}
                  title="Jaloliddin Xalimov Resume"
                />
              </div>
            </div>
          )}

          {/* ===== O'NG: PORTFOLIO SLIDESHOW ===== */}
          {(activeTab === "split" || activeTab === "portfolio") && (
            <div className="flex flex-col rounded-2xl border border-white/10 overflow-hidden bg-[#111111] shadow-2xl">

              {/* Slideshow Header */}
              <div className="bg-white/5 px-3 sm:px-4 py-2.5 border-b border-white/10 flex justify-between items-center text-xs flex-shrink-0">
                <span className="flex items-center gap-1.5 font-mono text-white/80">
                  <Presentation size={13} className="text-primary" />
                  <span className="hidden sm:inline">Portfolio Deck</span>
                  <span className="sm:hidden">Portfolio</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-white/50 bg-black/40 px-2 py-0.5 rounded-full border border-white/5 text-[11px]">
                    {currentSlide + 1} / {slides.length}
                  </span>
                  <button
                    onClick={togglePlay}
                    className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-lg transition-all text-[11px]"
                  >
                    {isPlaying
                      ? <Pause size={11} className="text-primary" />
                      : <Play size={11} />
                    }
                    <span className="hidden sm:inline">{isPlaying ? "Autoplay ON" : "Play"}</span>
                  </button>
                </div>
              </div>

              {/* Slayd Ko'rinish Maydoni */}
              <div
                className="flex-1 relative flex items-center justify-center bg-black/70 overflow-hidden select-none"
                style={{ minHeight: activeTab === "portfolio" ? "calc(100vh - 280px)" : "min(55vh, 500px)" }}
                onMouseEnter={() => setIsPlaying(false)}
                onMouseLeave={() => setIsPlaying(true)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={currentSlide}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 flex items-center justify-center p-3 sm:p-5"
                  >
                    {imageErrors[currentSlide] ? (
                      // Rasm yuklanmagan — zaxira karta
                      <div className="w-full h-full min-h-[280px] flex flex-col justify-center items-center p-5 sm:p-8 bg-gradient-to-br from-primary/10 via-black to-black border border-white/10 rounded-2xl text-center shadow-2xl">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-3 sm:mb-4 shadow-xl border border-primary/30">
                          <Presentation size={24} />
                        </div>
                        <h3 className="text-base sm:text-xl font-bold text-white mb-2">Slayd {currentSlide + 1}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-xs sm:max-w-md mb-4 sm:mb-6 leading-relaxed">
                          <code className="text-primary bg-black/60 px-1.5 py-0.5 rounded font-mono text-[11px]">
                            public/portfolio-slides/{currentSlide + 1}.png
                          </code>{" "}
                          faylini joylashtiring.
                        </p>
                        <a
                          href={portfolioPdfUrl}
                          download
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <Download size={13} /> Portfolio (PDF) yuklab olish
                        </a>
                      </div>
                    ) : (
                      <img
                        src={slides[currentSlide]}
                        alt={`Portfolio Slide ${currentSlide + 1}`}
                        onError={() => handleImageError(currentSlide)}
                        className="max-h-full w-auto max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
                        draggable={false}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigatsiya Tugmalari (Prev / Next) */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/70 hover:bg-primary text-white hover:text-primary-foreground border border-white/10 flex items-center justify-center transition-all backdrop-blur-md shadow-xl active:scale-90"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/70 hover:bg-primary text-white hover:text-primary-foreground border border-white/10 flex items-center justify-center transition-all backdrop-blur-md shadow-xl active:scale-90"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Swipe Hint — faqat mobile da */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/20 sm:hidden pointer-events-none">
                  ← Swipe qiling →
                </div>
              </div>

              {/* Dots Pagination */}
              <div className="bg-white/5 px-3 py-2.5 sm:py-3 border-t border-white/10 flex justify-center items-center gap-1.5 sm:gap-2 flex-shrink-0 overflow-x-auto">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                      idx === currentSlide
                        ? "w-6 sm:w-8 bg-primary shadow-lg shadow-primary/50"
                        : "w-2 bg-white/20 hover:bg-white/50"
                    }`}
                    title={`Slayd ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="py-2 flex justify-center items-center gap-3 opacity-20 text-[9px] sm:text-[10px] uppercase tracking-[0.25em]">
          <div className="h-px w-8 sm:w-12 bg-white" />
          <span>Ruebensh AI Engineering</span>
          <div className="h-px w-8 sm:w-12 bg-white" />
        </div>
      </div>
    </div>
  );
}