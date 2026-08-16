import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  FileText,
  Maximize2,
  Pause,
  Play,
  Presentation,
  ExternalLink,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "../lib/router";
import NeonBorder from "../components/originkit/ui/neon-border";
import { useLanguage } from "../context/LanguageContext";

type ViewMode = "cv" | "portfolio";

const resumeUrl = "/Jaloliddin_Xalimov_CV.pdf";
const portfolioPdfUrl = "/Jaloliddin_Xalimov_Portfolio.pdf";
const slides = Array.from({ length: 11 }, (_, index) => `/portfolio-slides/${index + 1}.png`);

export function ResumePage() {
  const { t } = useLanguage();

  // Portfolio Slideshow is active FIRST by default
  const [mode, setMode] = useState<ViewMode>("portfolio");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const touchStartX = useRef<number | null>(null);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((slide) => (slide + 1) % slides.length);
  };

  const previousSlide = () => {
    setDirection(-1);
    setCurrentSlide((slide) => (slide - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index >= currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  // Automatic slideshow transition every 4.5 seconds
  useEffect(() => {
    if (mode !== "portfolio" || !isPlaying) return;

    const timeoutId = window.setTimeout(() => {
      setDirection(1);
      setCurrentSlide((slide) => (slide + 1) % slides.length);
    }, 4500);

    return () => window.clearTimeout(timeoutId);
  }, [mode, isPlaying, currentSlide]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (mode !== "portfolio") return;
      if (event.key === "ArrowRight") nextSlide();
      if (event.key === "ArrowLeft") previousSlide();
      if (event.key === " ") {
        event.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, currentSlide]);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const endX = event.changedTouches[0]?.clientX ?? null;
    const difference = (touchStartX.current ?? 0) - (endX ?? 0);
    if (Math.abs(difference) > 40) {
      difference > 0 ? nextSlide() : previousSlide();
    }
  };

  // Absolute URL for Google Docs PDF viewer fallback (helps mobile Safari & Chrome)
  const absolutePdfUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${resumeUrl}`
      : resumeUrl;
  const googlePdfViewer = `https://docs.google.com/viewer?url=${encodeURIComponent(absolutePdfUrl)}&embedded=true`;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] px-3 pb-8 pt-24 text-white sm:px-6 sm:pt-28">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5">
        <header className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <Link href="/" className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-2 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">{t("resume.back")}</span>
            <span className="sm:hidden">{t("nav.home")}</span>
          </Link>

          {/* Mode Switcher (Portfolio Default First) */}
          <div className="mx-auto flex w-fit items-center">
            <NeonBorder color="#FFD700" rounded={16} thickness={2} borderSize={35} glow={70} speed={12}>
              <div className="flex items-center rounded-2xl border border-amber-400/40 bg-black/70 p-1 backdrop-blur-xl">
                <button
                  onClick={() => setMode("portfolio")}
                  className={`flex min-w-[110px] sm:min-w-[130px] items-center justify-center gap-2 rounded-xl px-4 sm:px-5 py-2.5 text-xs font-bold transition ${
                    mode === "portfolio"
                      ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Presentation size={15} /> {t("resume.portfolioMode")}
                </button>
                <button
                  onClick={() => setMode("cv")}
                  className={`flex min-w-[110px] sm:min-w-[130px] items-center justify-center gap-2 rounded-xl px-4 sm:px-5 py-2.5 text-xs font-bold transition ${
                    mode === "cv"
                      ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <FileText size={15} /> {t("resume.cvMode")}
                </button>
              </div>
            </NeonBorder>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={resumeUrl}
              download
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold transition hover:bg-amber-500/20 text-amber-200"
            >
              <FileDown size={15} /> <span className="hidden md:inline">{t("resume.download")}</span><span className="md:hidden">CV</span>
            </a>
            <NeonBorder color="#FFD700" rounded={12} thickness={2} borderSize={40} glow={60} speed={14}>
              <a
                href={portfolioPdfUrl}
                download
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-black transition hover:bg-amber-300 shadow-[0_0_15px_rgba(255,215,0,0.4)]"
              >
                <Download size={15} /> <span className="hidden md:inline">Portfolio PDF</span><span className="md:hidden">PDF</span>
              </a>
            </NeonBorder>
          </div>
        </header>

        <section className="flex items-end justify-between px-1 sm:px-2">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-400/80">{t("resume.title")}</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
              {mode === "portfolio" ? "Portfolio Presentation" : t("resume.subtitle")}
            </h1>
          </div>
          <span className="hidden rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-white/40 sm:inline">
            Jaloliddin Xalimov
          </span>
        </section>

        <section className="w-full overflow-hidden rounded-3xl border border-white/10 bg-[#101010] shadow-2xl shadow-black/40" style={{ minHeight: "calc(100vh - 285px)" }}>
          <AnimatePresence mode="wait" initial={false}>
            {mode === "portfolio" ? (
              /* PORTFOLIO SLIDESHOW (PRIMARY DEFAULT TAB) */
              <motion.div key="portfolio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col" style={{ minHeight: "calc(100vh - 285px)" }}>
                <div className="flex h-12 flex-shrink-0 items-center justify-between border-b border-white/10 bg-white/[0.035] px-4 sm:px-6">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Presentation size={16} className="text-amber-400" /> Portfolio Deck
                  </div>

                  {/* Top Slide Counter & Play State */}
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 font-mono text-[11px] font-bold text-amber-300">
                      {currentSlide + 1} / {slides.length}
                    </span>
                  </div>
                </div>

                <div
                  className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,_#17293a_0%,_#080808_52%)] p-3 sm:p-8"
                  style={{ minHeight: "calc(100vh - 350px)" }}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.img
                      key={currentSlide}
                      src={slides[currentSlide]}
                      alt={`Portfolio slide ${currentSlide + 1}`}
                      custom={direction}
                      initial={{ opacity: 0, x: direction * 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction * -40 }}
                      transition={{ duration: 0.28 }}
                      onError={() => setImageErrors((errors) => ({ ...errors, [currentSlide]: true }))}
                      className="max-h-full max-w-full rounded-2xl border border-white/10 object-contain shadow-2xl"
                      style={{ maxHeight: "calc(100vh - 430px)" }}
                      draggable={false}
                    />
                  </AnimatePresence>

                  {imageErrors[currentSlide] && (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-white/50">
                      Portfolio slide topilmadi.
                    </div>
                  )}

                  {/* Side Navigation Arrows */}
                  <button
                    onClick={previousSlide}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/60 p-3 text-white/80 backdrop-blur transition hover:bg-amber-400 hover:text-black shadow-lg"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/60 p-3 text-white/80 backdrop-blur transition hover:bg-amber-400 hover:text-black shadow-lg"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={22} />
                  </button>

                  {/* 3 CONTROL BUTTONS: < (Ortga), PAUZA / O'YNATISH, > (Oldinga) */}
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-amber-400/30 bg-black/75 px-4 py-2 shadow-2xl backdrop-blur-xl">
                    {/* 1. Ortga (<) */}
                    <button
                      onClick={previousSlide}
                      title="Ortga"
                      className="rounded-xl border border-white/10 bg-white/10 p-2 text-white/90 transition hover:bg-amber-400 hover:text-black"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {/* 2. Pauza / Play */}
                    <button
                      onClick={() => setIsPlaying((playing) => !playing)}
                      className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-extrabold text-black transition hover:bg-amber-300 shadow-[0_0_15px_rgba(255,215,0,0.4)]"
                      aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
                    >
                      {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                      <span>{isPlaying ? "PAUZA" : "O'YNATISH"}</span>
                    </button>

                    {/* 3. Oldinga (>) */}
                    <button
                      onClick={nextSlide}
                      title="Oldinga"
                      className="rounded-xl border border-white/10 bg-white/10 p-2 text-white/90 transition hover:bg-amber-400 hover:text-black"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Bottom Slide Indicators */}
                <div className="flex items-center justify-center gap-1.5 border-t border-white/10 bg-black/40 py-2.5">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentSlide ? "w-7 bg-amber-400 shadow-[0_0_8px_rgba(255,215,0,0.8)]" : "w-1.5 bg-white/30 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              /* CV RESUME PDF (SECONDARY TAB - DUAL FALLBACK FOR MOBILE & DESKTOP) */
              <motion.div key="cv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col" style={{ minHeight: "calc(100vh - 285px)" }}>
                <div className="flex h-12 flex-shrink-0 items-center justify-between border-b border-white/10 bg-white/[0.035] px-4 sm:px-6">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <FileText size={16} className="text-amber-400" /> Jaloliddin_Xalimov_CV.pdf
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-amber-300 hover:underline"
                    >
                      <ExternalLink size={13} /> <span>Open PDF</span>
                    </a>
                    <a
                      href={googlePdfViewer}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white"
                    >
                      <Maximize2 size={13} /> <span className="hidden sm:inline">To‘liq oynada</span>
                    </a>
                  </div>
                </div>

                <div className="relative flex-1 bg-[#171717] p-2 sm:p-5" style={{ minHeight: 620 }}>
                  {/* Object PDF container with fallback iframe for Mobile Safari & Android Chrome */}
                  <object
                    data={`${resumeUrl}#view=FitH&navpanes=0&toolbar=0`}
                    type="application/pdf"
                    className="block w-full rounded-xl border border-white/10 bg-white"
                    style={{ height: "calc(100vh - 365px)", minHeight: 620 }}
                  >
                    <iframe
                      src={googlePdfViewer}
                      title="Jaloliddin Xalimov Resume PDF"
                      className="block w-full rounded-xl border border-white/10 bg-white"
                      style={{ height: "calc(100vh - 365px)", minHeight: 620 }}
                    />
                  </object>

                  {/* Direct Action Bar below PDF preview for mobile browsers */}
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/50 p-3 sm:hidden">
                    <span className="text-xs text-white/70">PDF mobil brauzerda ochilmadimi?</span>
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-black"
                    >
                      PDF ko'rish
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <footer className="flex justify-center text-[10px] uppercase tracking-[0.3em] text-white/25">
          Ruebensh AI Engineering
        </footer>
      </div>
    </main>
  );
}

export default ResumePage;
