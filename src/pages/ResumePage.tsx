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

  // Klaviatura o'qlari bilan boshqarish
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  // Slayd o'tish effektlari variatsiyasi (Slide + Fade + Scale)
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.96,
      filter: "blur(4px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        x: { type: "spring", stiffness: 260, damping: 28 },
        opacity: { duration: 0.35 },
        scale: { duration: 0.35 },
        filter: { duration: 0.3 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 120 : -120,
      opacity: 0,
      scale: 0.96,
      filter: "blur(4px)",
      transition: {
        x: { type: "spring", stiffness: 260, damping: 28 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 },
        filter: { duration: 0.2 },
      },
    }),
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-20 pb-6 px-3 sm:px-6 flex flex-col font-sans">
      <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
        
        {/* ================= TOP PANEL & NAVIGATION ================= */}
        <div className="flex flex-wrap justify-between items-center mb-4 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-xl gap-4 shadow-2xl">
          
          {/* Asosiy sahifaga qaytish */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-muted-foreground hover:text-white transition-all group px-3.5 py-2 rounded-xl hover:bg-white/5 text-sm"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Asosiyga qaytish</span>
          </Link>

          {/* Ko'rish Rejimlari (Split / CV / Portfolio) */}
          <div className="hidden md:flex items-center bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab("split")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "split" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"
              }`}
            >
              <Columns size={14} /> Split View
            </button>
            <button
              onClick={() => setActiveTab("cv")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "cv" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"
              }`}
            >
              <FileText size={14} /> CV Only
            </button>
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "portfolio" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"
              }`}
            >
              <Presentation size={14} /> Portfolio Only
            </button>
          </div>

          {/* Yuklab olish tugmalari */}
          <div className="flex items-center gap-2.5">
            <a 
              href={resumeUrl} 
              download 
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl font-semibold border border-white/10 transition-all text-xs sm:text-sm active:scale-95"
            >
              <FileDown size={16} /> CV (PDF)
            </a>
            
            <a 
              href={portfolioPdfUrl} 
              download 
              className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/25 transition-all text-xs sm:text-sm"
            >
              <Download size={16} /> Portfolio (PDF)
            </a>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden mb-4 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab("cv")}
            className={`flex-1 py-2 text-center rounded-lg font-medium ${activeTab === "cv" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            CV Hujjat
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`flex-1 py-2 text-center rounded-lg font-medium ${activeTab === "portfolio" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Portfolio Presentation
          </button>
        </div>

        {/* ================= MAIN CONTENT CONTAINER ================= */}
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch min-h-[650px]">
          
          {/* ================= CHAP TOMON: CV PDF VIEWER ================= */}
          {(activeTab === "split" || activeTab === "cv") && (
            <div className={`flex flex-col rounded-2xl border border-white/10 overflow-hidden bg-[#141414] shadow-2xl ${activeTab === "cv" ? "col-span-full" : ""}`}>
              <div className="bg-white/5 px-4 py-2.5 border-b border-white/10 flex justify-between items-center text-xs text-muted-foreground">
                <span className="flex items-center gap-2 font-mono text-white/80">
                  <FileText size={14} className="text-primary" /> Jaloliddin_Xalimov_CV.pdf
                </span>
                <a href={resumeUrl} target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                  <Maximize2 size={12} /> To'liq oynada
                </a>
              </div>
              <div className="flex-1 w-full relative min-h-[500px]">
                <iframe 
                  src={`${resumeUrl}#view=FitH&navpanes=0&toolbar=1`} 
                  className="w-full h-full border-none"
                  style={{ height: "100%", minHeight: "550px" }}
                  title="Jaloliddin Xalimov Resume"
                />
              </div>
            </div>
          )}

          {/* ================= O'NG TOMON: PPTX SLIDESHOW VIEWER ================= */}
          {(activeTab === "split" || activeTab === "portfolio") && (
            <div className={`flex flex-col rounded-2xl border border-white/10 overflow-hidden bg-[#111111] shadow-2xl relative group ${activeTab === "portfolio" ? "col-span-full" : ""}`}>
              
              {/* Slideshow Top Header */}
              <div className="bg-white/5 px-4 py-2.5 border-b border-white/10 flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 font-mono text-white/80">
                  <Presentation size={14} className="text-primary" /> Portfolio Deck (Presentation)
                </span>
                
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-white/60 bg-black/40 px-2.5 py-0.5 rounded-full border border-white/5">
                    {currentSlide + 1} / {slides.length}
                  </span>
                  
                  <button 
                    onClick={togglePlay}
                    className="flex items-center gap-1.5 text-[11px] bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg transition-all"
                    title={isPlaying ? "Vaqtinchalik to'xtatish" : "Avto-slaydni boshlash"}
                  >
                    {isPlaying ? <Pause size={12} className="text-primary" /> : <Play size={12} />}
                    <span>{isPlaying ? "Autoplay ON" : "Play"}</span>
                  </button>
                </div>
              </div>

              {/* Slide Main View (framer-motion AnimatePresence bilan) */}
              <div 
                className="flex-1 relative flex items-center justify-center p-4 bg-black/70 overflow-hidden min-h-[450px]"
                onMouseEnter={() => setIsPlaying(false)}
                onMouseLeave={() => setIsPlaying(true)}
              >
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={currentSlide}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full h-full flex items-center justify-center absolute inset-0 p-4"
                  >
                    {imageErrors[currentSlide] ? (
                      /* Rasm hali joylanmagan bo'lsa zaxira chiroyli slayd kartasi */
                      <div className="w-full h-full min-h-[400px] flex flex-col justify-center items-center p-8 bg-gradient-to-br from-primary/10 via-black to-black border border-white/10 rounded-2xl text-center shadow-2xl">
                        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-4 shadow-xl border border-primary/30">
                          <Presentation size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Slayd {currentSlide + 1}</h3>
                        <p className="text-sm text-muted-foreground max-w-md mb-6">
                          Rasmlarni <code className="text-primary bg-black/60 px-2 py-0.5 rounded font-mono text-xs">public/portfolio-slides/{currentSlide + 1}.png</code> papkasiga joylashtiring.
                        </p>
                        <a 
                          href={portfolioPdfUrl} 
                          download 
                          className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/10 transition-all flex items-center gap-2"
                        >
                          <Download size={14} /> Full Portfolio (PDF) yuklab olish
                        </a>
                      </div>
                    ) : (
                      <img 
                        src={slides[currentSlide]} 
                        alt={`Portfolio Slide ${currentSlide + 1}`}
                        onError={() => handleImageError(currentSlide)}
                        className="max-h-[560px] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Slayd Boshqaruv Tugmalari (Chap va O'ng) */}
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/70 hover:bg-primary text-white hover:text-primary-foreground border border-white/10 flex items-center justify-center transition-all opacity-80 hover:opacity-100 backdrop-blur-md shadow-2xl hover:scale-110 active:scale-95"
                  title="Oldingi slayd (←)"
                >
                  <ChevronLeft size={24} />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/70 hover:bg-primary text-white hover:text-primary-foreground border border-white/10 flex items-center justify-center transition-all opacity-80 hover:opacity-100 backdrop-blur-md shadow-2xl hover:scale-110 active:scale-95"
                  title="Keyingi slayd (→)"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Slide Dots Pagination (Interaktiv) */}
              <div className="bg-white/5 px-4 py-3 border-t border-white/10 flex justify-center items-center gap-2.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      idx === currentSlide 
                        ? "w-8 bg-primary shadow-lg shadow-primary/50" 
                        : "w-2.5 bg-white/20 hover:bg-white/50"
                    }`}
                    title={`Slayd ${idx + 1}`}
                  />
                ))}
              </div>

            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="pt-4 flex justify-center items-center gap-4 opacity-30 text-[10px] uppercase tracking-[0.3em]">
          <div className="h-px w-12 bg-white" />
          <span>Ruebensh AI Engineering & Portfolio</span>
          <div className="h-px w-12 bg-white" />
        </div>

      </div>
    </div>
  );
}