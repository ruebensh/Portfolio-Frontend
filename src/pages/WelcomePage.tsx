import { useState, useRef } from "react";
import { ArrowRight } from "lucide-react";

interface WelcomePageProps {
  onEnter: () => void;
}

export function WelcomePage({ onEnter }: WelcomePageProps) {
  const [isEntering, setIsEntering] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleEnter = () => {
    if (isEntering) return;
    setIsEntering(true);

    // 2 soniyalik silliq qorong'ulashtirish (fade to black) effekti tugagach onEnter chaqiriladi
    setTimeout(() => {
      onEnter();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-[100vh] h-[100dvh] overflow-hidden bg-black select-none flex flex-col items-center justify-end pb-16 sm:pb-24 md:pb-28">
      {/* ── Responsiv Dual-Layer Video (Blurred Fill + Full Uncropped Main Video) ── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
        {/* 1-QAVAT: Yuqori va pastki bo'shliqlarni to'ldiradigan hira (blurred) orqa fon video */}
        <video
          autoPlay
          muted
          playsInline
          loop
          className={`absolute inset-0 w-full h-full object-cover scale-125 blur-3xl opacity-70 brightness-90 transition-all duration-[2000ms] ease-in-out ${
            isEntering ? "scale-150 opacity-0" : "scale-125 opacity-70"
          }`}
        >
          <source src="/backgrounds/welcome.mp4" type="video/mp4" />
          <source src="/backgrounds/1.mp4" type="video/mp4" />
        </video>

        {/* 2-QAVAT: Video to'liq, qirqilmasdan (uncropped) ko'rinadigan asosiy video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onEnded={handleEnter}
          className={`relative z-10 w-full h-full object-contain transition-all duration-[2000ms] ease-in-out ${
            isEntering ? "scale-110 blur-2xl opacity-0" : "scale-100 opacity-100"
          }`}
        >
          <source src="/backgrounds/welcome.mp4" type="video/mp4" />
          <source src="/backgrounds/1.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Yengil ambient qorong'i maska */}
      <div className="absolute inset-0 z-10 bg-black/35 backdrop-brightness-[0.85] pointer-events-none" />

      {/* ── Ekran Markazida "ENTER PORTFOLIO" Tugmasi ─────────────────── */}
      <div
        className={`relative z-20 transition-all duration-[2000ms] ease-in-out flex flex-col items-center justify-center p-4 ${
          isEntering
            ? "scale-75 opacity-0 blur-xl translate-y-8"
            : "scale-100 opacity-100 translate-y-0"
        }`}
      >
        {/* Orqa fon nuriy aura (Glow Effect) */}
        <div className="absolute w-[280px] h-[90px] sm:w-[420px] sm:h-[130px] rounded-full bg-gradient-to-r from-indigo-500/35 via-purple-500/40 to-cyan-500/35 blur-[40px] sm:blur-[65px] animate-pulse pointer-events-none" />

        {/* Premium Shishali Tugma */}
        <button
          onClick={handleEnter}
          className="relative group overflow-hidden rounded-full border border-white/40 hover:border-white/80 bg-white/10 hover:bg-white/20 backdrop-blur-2xl px-7 py-3.5 sm:px-10 sm:py-4.5 md:px-12 md:py-5 flex items-center gap-3.5 sm:gap-4.5 text-white font-extrabold text-xs sm:text-base md:text-lg tracking-[0.2em] sm:tracking-[0.28em] uppercase transition-all duration-500 shadow-[0_15px_45px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.6)] hover:shadow-[0_20px_60px_rgba(99,102,241,0.4),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:scale-[1.04] active:scale-95 cursor-pointer"
        >
          {/* Shimmer yorug'lik chizig'i effekti */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

          <span className="relative z-10 text-shadow-sm">ENTER PORTFOLIO</span>

          {/* Strelkali frosted badge */}
          <span className="relative z-10 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-white/15 border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-black group-hover:rotate-[-45deg] transition-all duration-500 shadow-sm">
            <ArrowRight
              size={18}
              className="sm:w-5 sm:h-5 transition-transform duration-300"
            />
          </span>
        </button>
      </div>

      {/* ── Fade-to-Black Overlay ──────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 bg-black pointer-events-none transition-opacity duration-[2000ms] ease-in-out ${
          isEntering ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}